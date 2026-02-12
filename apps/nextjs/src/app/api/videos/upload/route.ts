import { NextResponse } from "next/server";
import { z } from "zod/v4";

import { uploadBunnyVideoHttp } from "@galileyo/api/video";

import { createApiCaller, mapTRPCError } from "~/app/api/_lib/trpc-caller";
import { env } from "~/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;
const VIDEO_PROXY_ENABLED = env.NEXT_PUBLIC_VIDEO_PROXY_ENABLED;

const UploadMetadataSchema = z.object({
  fileName: z.string().min(1),
  contentType: z.string().regex(/^video\//, "Must be a video content type"),
  fileSize: z
    .number()
    .positive()
    .max(500 * 1024 * 1024, "File size must be less than 500MB"),
  caption: z.string().max(500).optional(),
  subscriptionId: z.number().int().positive().optional(),
  userFeed: z.enum(["public", "friends"]).optional(),
});

function decodeHeaderValue(value: string | null): string | undefined {
  if (!value) return undefined;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

async function uploadToPresignedUrl(
  uploadUrl: string,
  body: ReadableStream<Uint8Array>,
): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    body,
    duplex: "half",
  } as RequestInit & { duplex: "half" });

  if (!response.ok) {
    throw new Error(`Upload failed with status ${response.status}`);
  }
}

export async function POST(request: Request) {
  try {
    if (!VIDEO_PROXY_ENABLED) {
      return NextResponse.json(
        { error: "Video proxy is disabled" },
        { status: 404 },
      );
    }

    if (!request.body) {
      return NextResponse.json(
        { error: "Request body is required" },
        { status: 400 },
      );
    }

    const fileSizeRaw = request.headers.get("x-video-file-size");
    const subscriptionIdRaw = request.headers.get("x-video-subscription-id");

    const metadataResult = UploadMetadataSchema.safeParse({
      fileName: decodeHeaderValue(request.headers.get("x-video-file-name")),
      contentType: request.headers.get("x-video-content-type") ?? undefined,
      fileSize: fileSizeRaw ? Number(fileSizeRaw) : Number.NaN,
      caption: decodeHeaderValue(request.headers.get("x-video-caption")),
      subscriptionId: subscriptionIdRaw ? Number(subscriptionIdRaw) : undefined,
      userFeed: request.headers.get("x-video-user-feed") ?? undefined,
    });

    if (!metadataResult.success) {
      return NextResponse.json(
        {
          error: "Invalid upload metadata",
          details: metadataResult.error.issues,
        },
        { status: 422 },
      );
    }

    const metadata = metadataResult.data;
    const caller = await createApiCaller(request);

    const uploadUrls = await caller.video.getUploadUrls({
      fileName: metadata.fileName,
      contentType: metadata.contentType,
      fileSize: metadata.fileSize,
      caption: metadata.caption,
      subscriptionId: metadata.subscriptionId,
      userFeed: metadata.userFeed,
    });

    const shouldUploadToMux = Boolean(uploadUrls.muxEnabled && uploadUrls.mux);
    const shouldUploadToBunny = Boolean(
      uploadUrls.bunnyEnabled && uploadUrls.bunny?.videoId,
    );

    let s3Body = request.body;
    let providerBody: ReadableStream<Uint8Array> | null = null;

    if (shouldUploadToMux || shouldUploadToBunny) {
      const [s3Stream, providerStream] = request.body.tee();
      s3Body = s3Stream;
      providerBody = providerStream;
    }

    const uploadTasks: Promise<unknown>[] = [
      uploadToPresignedUrl(uploadUrls.s3.uploadUrl, s3Body),
    ];

    if (shouldUploadToMux && providerBody && uploadUrls.mux) {
      uploadTasks.push(
        uploadToPresignedUrl(uploadUrls.mux.uploadUrl, providerBody),
      );
    } else if (
      shouldUploadToBunny &&
      providerBody &&
      uploadUrls.bunny?.videoId
    ) {
      uploadTasks.push(
        uploadBunnyVideoHttp(uploadUrls.bunny.videoId, providerBody),
      );
    }

    await Promise.all(uploadTasks);

    await caller.video.confirmUpload({
      videoId: uploadUrls.videoId,
      s3Completed: true,
      muxUploadId: uploadUrls.mux?.uploadId,
      bunnyVideoId: uploadUrls.bunny?.videoId,
      subscriptionId: metadata.subscriptionId,
      userFeed: metadata.userFeed,
      caption: metadata.caption,
    });

    const requiresProcessing = uploadUrls.muxEnabled || uploadUrls.bunnyEnabled;

    return NextResponse.json({
      videoId: uploadUrls.videoId,
      status: requiresProcessing ? "processing" : "ready",
    });
  } catch (error) {
    const trpcResponse = mapTRPCError(error);
    if (trpcResponse) {
      return trpcResponse;
    }

    console.error("Video proxy upload failed:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
