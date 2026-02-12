import { NextResponse } from "next/server";

import { createApiCaller, mapTRPCError } from "~/app/api/_lib/trpc-caller";
import { env } from "~/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const VIDEO_PROXY_ENABLED = env.NEXT_PUBLIC_VIDEO_PROXY_ENABLED;

const FORWARDED_QUERY_PARAMS = ["time", "width", "height", "fit_mode"] as const;

function buildRelayHeaders(upstream: Response): Headers {
  const headers = new Headers();

  const relayHeaderNames = [
    "content-type",
    "content-length",
    "etag",
    "last-modified",
  ];

  for (const headerName of relayHeaderNames) {
    const value = upstream.headers.get(headerName);
    if (value) {
      headers.set(headerName, value);
    }
  }

  headers.set("cache-control", "private, max-age=300");
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

    const caller = await createApiCaller(request);
    const source = await caller.video.getPlaybackSource({ id: videoId });

    if (!source.thumbnailUrl) {
      return NextResponse.json(
        { error: "Thumbnail not available" },
        { status: 404 },
      );
    }

    const upstreamThumbnailUrl = new URL(source.thumbnailUrl);
    const requestUrl = new URL(request.url);

    for (const key of FORWARDED_QUERY_PARAMS) {
      const value = requestUrl.searchParams.get(key);
      if (value !== null) {
        upstreamThumbnailUrl.searchParams.set(key, value);
      }
    }

    const upstream = await fetch(upstreamThumbnailUrl.toString(), {
      // cache: "no-store",
    });

    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: buildRelayHeaders(upstream),
    });
  } catch (error) {
    const trpcResponse = mapTRPCError(error);
    if (trpcResponse) {
      return trpcResponse;
    }

    console.error("Thumbnail proxy failed:", error);
    return NextResponse.json(
      { error: "Thumbnail proxy failed" },
      { status: 500 },
    );
  }
}
