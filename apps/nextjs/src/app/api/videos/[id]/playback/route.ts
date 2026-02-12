import { NextResponse } from "next/server";
import { z } from "zod/v4";

import { createApiCaller, mapTRPCError } from "~/app/api/_lib/trpc-caller";
import { env } from "~/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const VIDEO_PROXY_ENABLED = env.NEXT_PUBLIC_VIDEO_PROXY_ENABLED;

const PlaybackQuerySchema = z.object({
  format: z.enum(["hls", "mp4"]).default("hls"),
  segment: z.string().optional(),
});

function buildSegmentProxyUrl(videoId: number, absoluteUrl: string): string {
  return `/api/videos/${videoId}/playback?format=hls&segment=${encodeURIComponent(absoluteUrl)}`;
}

function rewriteManifest(
  manifest: string,
  videoId: number,
  manifestUrl: string,
): string {
  return manifest
    .split(/\r?\n/)
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return line;

      if (trimmed.startsWith("#")) {
        // Rewrite URI attributes in tags like EXT-X-KEY / EXT-X-MAP.
        return line.replace(/URI="([^"]+)"/g, (_match, uri: string) => {
          const absolute = new URL(uri, manifestUrl).toString();
          return `URI="${buildSegmentProxyUrl(videoId, absolute)}"`;
        });
      }

      const absolute = new URL(trimmed, manifestUrl).toString();
      return buildSegmentProxyUrl(videoId, absolute);
    })
    .join("\n");
}

function isAllowedSegmentUrl(
  segmentUrl: string,
  sourceManifestUrl: string,
  playbackId: string | null,
): boolean {
  try {
    const sourceUrl = new URL(sourceManifestUrl);
    const parsedSegmentUrl = new URL(segmentUrl);

    if (parsedSegmentUrl.origin !== sourceUrl.origin) {
      return false;
    }

    if (playbackId) {
      return parsedSegmentUrl.pathname.startsWith(`/${playbackId}`);
    }

    const basePrefix =
      sourceUrl.pathname.slice(0, sourceUrl.pathname.lastIndexOf("/") + 1) ||
      "/";

    return parsedSegmentUrl.pathname.startsWith(basePrefix);
  } catch {
    return false;
  }
}

function buildForwardHeaders(request: Request): Headers {
  const headers = new Headers();
  const range = request.headers.get("range");
  if (range) {
    headers.set("range", range);
  }
  return headers;
}

function buildRelayHeaders(upstream: Response, cacheControl: string): Headers {
  const headers = new Headers();

  const relayHeaderNames = [
    "content-type",
    "content-length",
    "accept-ranges",
    "content-range",
    "etag",
    "last-modified",
  ];

  for (const headerName of relayHeaderNames) {
    const value = upstream.headers.get(headerName);
    if (value) {
      headers.set(headerName, value);
    }
  }

  headers.set("cache-control", cacheControl);
  return headers;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!VIDEO_PROXY_ENABLED) {
      return NextResponse.json(
        { error: "Video proxy is disabled" },
        { status: 404 },
      );
    }

    const { id } = await params;
    const videoId = Number(id);

    if (!Number.isInteger(videoId) || videoId <= 0) {
      return NextResponse.json({ error: "Invalid video id" }, { status: 400 });
    }

    const requestUrl = new URL(request.url);
    const searchParams = requestUrl.searchParams;
    const parsedQuery = PlaybackQuerySchema.safeParse({
      format: searchParams.get("format") ?? "hls",
      segment: searchParams.get("segment") ?? undefined,
    });

    if (!parsedQuery.success) {
      return NextResponse.json(
        { error: "Invalid playback query" },
        { status: 400 },
      );
    }

    const query = parsedQuery.data;
    const caller = await createApiCaller(request);
    const source = await caller.video.getPlaybackSource({ id: videoId });

    if (query.format === "mp4") {
      if (!source.mp4Url) {
        return NextResponse.json(
          { error: "MP4 playback not available" },
          { status: 404 },
        );
      }

      const upstream = await fetch(source.mp4Url, {
        headers: buildForwardHeaders(request),
        // cache: "no-store",
      });

      return new NextResponse(upstream.body, {
        status: upstream.status,
        headers: buildRelayHeaders(upstream, "private, max-age=60"),
      });
    }

    if (!source.hlsUrl) {
      return NextResponse.json(
        { error: "HLS playback not available" },
        { status: 404 },
      );
    }

    if (query.segment) {
      if (
        !isAllowedSegmentUrl(query.segment, source.hlsUrl, source.playbackId)
      ) {
        return NextResponse.json(
          { error: "Invalid segment URL" },
          { status: 400 },
        );
      }

      const upstream = await fetch(query.segment, {
        headers: buildForwardHeaders(request),
        // cache: "no-store",
      });

      const segmentPathname = new URL(query.segment).pathname;
      const contentType = upstream.headers.get("content-type") ?? "";
      const isManifestSegment =
        contentType.includes("mpegurl") || segmentPathname.endsWith(".m3u8");

      if (isManifestSegment) {
        const manifestText = await upstream.text();
        const rewrittenManifest = rewriteManifest(
          manifestText,
          videoId,
          query.segment,
        );

        return new NextResponse(rewrittenManifest, {
          status: upstream.status,
          headers: {
            "content-type": "application/vnd.apple.mpegurl",
            "cache-control": "private, max-age=30",
          },
        });
      }

      return new NextResponse(upstream.body, {
        status: upstream.status,
        headers: buildRelayHeaders(upstream, "private, max-age=30"),
      });
    }

    const upstreamManifest = await fetch(source.hlsUrl, {
      // cache: "no-store",
    });

    if (!upstreamManifest.ok) {
      return NextResponse.json(
        { error: "Failed to fetch manifest" },
        { status: upstreamManifest.status },
      );
    }

    const manifestText = await upstreamManifest.text();
    const rewrittenManifest = rewriteManifest(
      manifestText,
      videoId,
      source.hlsUrl,
    );

    return new NextResponse(rewrittenManifest, {
      status: 200,
      headers: {
        "content-type": "application/vnd.apple.mpegurl",
        "cache-control": "private, max-age=30",
      },
    });
  } catch (error) {
    const trpcResponse = mapTRPCError(error);
    if (trpcResponse) {
      return trpcResponse;
    }

    console.error("Playback proxy failed:", error);
    return NextResponse.json(
      { error: "Playback proxy failed" },
      { status: 500 },
    );
  }
}
