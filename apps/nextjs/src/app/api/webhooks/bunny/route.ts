import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import {
  buildBunnyWebhookUpdate,
  buildVideoUpdatePayload,
  parseBunnyWebhook,
} from "@galileyo/api/video";
import { db } from "@galileyo/db/client";
import { video } from "@galileyo/db/schema";

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const payload = parseBunnyWebhook(body);

    const now = new Date().toISOString().slice(0, 19).replace("T", " ");
    const videoGuid = payload.VideoGuid;

    const [existingVideo] = await db
      .select({ id: video.id })
      .from(video)
      .where(eq(video.playbackId, videoGuid));

    if (!existingVideo) {
      console.warn(`Bunny webhook: Video not found for GUID ${videoGuid}`);
      return NextResponse.json({ success: false, message: "Video not found" });
    }

    const update = await buildBunnyWebhookUpdate(videoGuid, payload.Status);

    await db
      .update(video)
      .set({
        updatedAt: now,
        ...buildVideoUpdatePayload(update),
      })
      .where(eq(video.playbackId, videoGuid));

    return NextResponse.json({
      success: true,
      status: update.transcodingStatus,
    });
  } catch (error) {
    console.error("Error processing Bunny webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// Allow GET for webhook verification
export function GET() {
  return NextResponse.json({ status: "ok" });
}
