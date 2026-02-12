import crypto from "crypto";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@galileyo/db/client";
import { video } from "@galileyo/db/schema";

interface MuxWebhookEvent {
  type: string;
  data: {
    id: string;
    playback_ids?: { id: string; policy: string }[];
    status?: string;
    duration?: number;
    aspect_ratio?: string;
    resolution_tier?: string;
    upload_id?: string;
    errors?: { type: string; message: string }[];
  };
}

/**
 * Verify Mux webhook signature
 */
function verifySignature(
  payload: string,
  signature: string,
  secret: string,
): boolean {
  try {
    // Mux sends signatures in format: t=timestamp,v1=signature
    const parts = signature.split(",");
    const timestamp = parts.find((p) => p.startsWith("t="))?.slice(2);
    const sig = parts.find((p) => p.startsWith("v1="))?.slice(3);

    if (!timestamp || !sig) {
      return false;
    }

    // Create the signed payload
    const signedPayload = `${timestamp}.${payload}`;

    // Calculate expected signature
    const expectedSig = crypto
      .createHmac("sha256", secret)
      .update(signedPayload)
      .digest("hex");

    // Use timing-safe comparison
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig));
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("mux-signature");

    // Verify webhook signature in production
    // eslint-disable-next-line no-restricted-properties
    const webhookSecret = process.env.MUX_WEBHOOK_SECRET;
    if (webhookSecret && signature) {
      const isValid = verifySignature(body, signature, webhookSecret);
      if (!isValid) {
        console.error("Invalid Mux webhook signature");
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 },
        );
      }
    }

    const event = JSON.parse(body) as MuxWebhookEvent;

    console.log(`Received Mux webhook: ${event.type}`, event.data.id);

    const now = new Date().toISOString().slice(0, 19).replace("T", " ");

    switch (event.type) {
      case "video.asset.ready": {
        // Video is ready for playback
        const playbackId = event.data.playback_ids?.[0]?.id;

        await db
          .update(video)
          .set({
            transcodingStatus: "ready",
            playbackId: playbackId ?? null,
            duration: event.data.duration
              ? Math.round(event.data.duration)
              : null,
            aspectRatio: event.data.aspect_ratio ?? null,
            thumbnailUrl: playbackId
              ? `https://image.mux.com/${playbackId}/thumbnail.jpg`
              : null,
            updatedAt: now,
          })
          .where(eq(video.muxAssetId, event.data.id));

        console.log(`Video ${event.data.id} is ready`);
        break;
      }

      case "video.asset.errored": {
        // Video processing failed
        const errorMessage = event.data.errors?.[0]?.message ?? "Unknown error";

        await db
          .update(video)
          .set({
            transcodingStatus: "errored",
            updatedAt: now,
          })
          .where(eq(video.muxAssetId, event.data.id));

        console.error(`Video ${event.data.id} errored: ${errorMessage}`);
        break;
      }

      case "video.upload.asset_created": {
        // Upload completed, asset created - update the asset ID
        if (event.data.upload_id) {
          await db
            .update(video)
            .set({
              muxAssetId: event.data.id,
              transcodingStatus: "processing",
              updatedAt: now,
            })
            .where(eq(video.muxUploadId, event.data.upload_id));

          console.log(
            `Upload ${event.data.upload_id} created asset ${event.data.id}`,
          );
        }
        break;
      }

      case "video.asset.deleted": {
        // Asset was deleted - you might want to clean up your database
        console.log(`Video asset ${event.data.id} was deleted`);
        break;
      }

      default:
        console.log(`Unhandled Mux webhook event: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing Mux webhook:", error);
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
