import crypto from "node:crypto";
import Mux from "@mux/mux-node";

import type { BunnyTusUploadCredentials } from "./bunny-service";
import {
  createBunnyDirectUpload,
  deleteBunnyVideo,
  getBunnyPlaybackUrl,
  getBunnyThumbnailUrl,
  getBunnyVideo,
  getVideoProvider,
  isBunnyEnabled,
} from "./bunny-service";

// Re-export bunny service for direct access
export * from "./bunny-service";

/**
 * Video provider type - determines which service handles video transcoding
 * - "bunny": Bunny.net Stream (https://docs.bunny.net/stream)
 * - "mux": Mux Video (https://mux.com)
 * - "s3": S3-only storage, no transcoding
 */
export type VideoProviderType = "bunny" | "mux" | "s3";

/**
 * Check if Mux is enabled and configured
 */
export function isMuxEnabled(): boolean {
  return (
    process.env.ENABLE_MUX === "true" &&
    !!process.env.MUX_TOKEN_ID &&
    !!process.env.MUX_TOKEN_SECRET
  );
}

/**
 * Check if any video transcoding service is enabled
 */
export function isTranscodingEnabled(): boolean {
  return isMuxEnabled() || isBunnyEnabled();
}

/**
 * Get the currently active video provider
 */
export function getActiveVideoProvider(): VideoProviderType {
  return getVideoProvider();
}

// Initialize Mux client only if enabled
let muxClient: Mux | null = null;

function getMuxClient(): Mux {
  if (!isMuxEnabled()) {
    throw new Error(
      "Mux is not enabled. Set ENABLE_MUX=true and provide MUX_TOKEN_ID and MUX_TOKEN_SECRET.",
    );
  }

  muxClient ??= new Mux({
    tokenId: process.env.MUX_TOKEN_ID,
    tokenSecret: process.env.MUX_TOKEN_SECRET,
  });

  return muxClient;
}

export interface DirectUploadResult {
  uploadId: string;
  uploadUrl: string;
}

export interface VideoAsset {
  id: string;
  playbackId: string | null;
  status: "preparing" | "ready" | "errored";
  duration: number | null;
  aspectRatio: string | null;
  resolution: {
    width: number | null;
    height: number | null;
  };
  thumbnailUrl: string | null;
}

/**
 * Create a direct upload URL for Mux
 * Users can upload directly to Mux without going through our server
 * Returns null if Mux is not enabled
 */
export async function createDirectUpload(
  corsOrigin?: string,
): Promise<DirectUploadResult | null> {
  if (!isMuxEnabled()) {
    return null;
  }

  const client = getMuxClient();
  const upload = await client.video.uploads.create({
    cors_origin: corsOrigin ?? process.env.NEXT_PUBLIC_APP_URL ?? "*",
    new_asset_settings: {
      playback_policy: ["public"],
      encoding_tier: "baseline", // Use 'smart' for better quality at higher cost
    },
  });

  return {
    uploadId: upload.id,
    uploadUrl: upload.url,
  };
}

/**
 * Get the status of an upload
 * Returns null if Mux is not enabled
 */
export async function getUploadStatus(uploadId: string) {
  if (!isMuxEnabled()) {
    return null;
  }

  const client = getMuxClient();
  const upload = await client.video.uploads.retrieve(uploadId);

  return {
    status: upload.status,
    assetId: upload.asset_id,
    error: upload.error,
  };
}

/**
 * Get video asset details from Mux
 * Returns null if Mux is not enabled
 */
export async function getVideoAsset(
  assetId: string,
): Promise<VideoAsset | null> {
  if (!isMuxEnabled()) {
    return null;
  }

  const client = getMuxClient();
  const asset = await client.video.assets.retrieve(assetId);

  const playbackId = asset.playback_ids?.[0]?.id ?? null;

  return {
    id: asset.id,
    playbackId,
    status: asset.status,
    duration: asset.duration ?? null,
    aspectRatio: asset.aspect_ratio ?? null,
    resolution: {
      width:
        asset.resolution_tier === "1080p"
          ? 1920
          : asset.resolution_tier === "720p"
            ? 1280
            : null,
      height:
        asset.resolution_tier === "1080p"
          ? 1080
          : asset.resolution_tier === "720p"
            ? 720
            : null,
    },
    thumbnailUrl: playbackId
      ? `https://image.mux.com/${playbackId}/thumbnail.jpg`
      : null,
  };
}

/**
 * Delete a video asset from Mux
 * No-op if Mux is not enabled
 */
export async function deleteVideoAsset(assetId: string): Promise<void> {
  if (!isMuxEnabled()) {
    return;
  }

  const client = getMuxClient();
  await client.video.assets.delete(assetId);
}

/**
 * Get the HLS playback URL for a video
 */
export function getPlaybackUrl(playbackId: string): string {
  return `https://stream.mux.com/${playbackId}.m3u8`;
}

/**
 * Get thumbnail URL for a video at a specific time
 */
export function getThumbnailUrl(
  playbackId: string,
  options?: {
    time?: number;
    width?: number;
    height?: number;
    fit_mode?: "preserve" | "stretch" | "crop" | "smartcrop" | "pad";
  },
): string {
  const params = new URLSearchParams();

  if (options?.time !== undefined) {
    params.set("time", options.time.toString());
  }
  if (options?.width) {
    params.set("width", options.width.toString());
  }
  if (options?.height) {
    params.set("height", options.height.toString());
  }
  if (options?.fit_mode) {
    params.set("fit_mode", options.fit_mode);
  }

  const queryString = params.toString();
  return `https://image.mux.com/${playbackId}/thumbnail.jpg${queryString ? `?${queryString}` : ""}`;
}

/**
 * Get animated GIF URL for a video
 */
export function getAnimatedGifUrl(
  playbackId: string,
  options?: {
    start?: number;
    end?: number;
    width?: number;
    fps?: number;
  },
): string {
  const params = new URLSearchParams();

  if (options?.start !== undefined) {
    params.set("start", options.start.toString());
  }
  if (options?.end !== undefined) {
    params.set("end", options.end.toString());
  }
  if (options?.width) {
    params.set("width", options.width.toString());
  }
  if (options?.fps) {
    params.set("fps", options.fps.toString());
  }

  const queryString = params.toString();
  return `https://image.mux.com/${playbackId}/animated.gif${queryString ? `?${queryString}` : ""}`;
}

/**
 * Verify Mux webhook signature
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
): boolean {
  // Mux uses a simple HMAC-SHA256 signature
  // const crypto = require("crypto");
  const secret = process.env.MUX_WEBHOOK_SECRET;

  if (!secret) {
    console.warn("MUX_WEBHOOK_SECRET not configured");
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature),
  );
}

export { getMuxClient };

// ============================================================================
// Unified Video Provider Interface
// ============================================================================

/**
 * Unified result for creating a direct upload
 */
export interface UnifiedDirectUploadResult {
  provider: VideoProviderType;
  // Mux-specific fields
  muxUploadId?: string;
  muxUploadUrl?: string;
  // Bunny-specific fields
  bunnyVideoId?: string;
  bunnyTusCredentials?: BunnyTusUploadCredentials;
  bunnyEmbedUrl?: string;
}

/**
 * Unified video asset interface
 */
export interface UnifiedVideoAsset {
  provider: VideoProviderType;
  id: string;
  playbackId: string | null;
  status: "preparing" | "ready" | "errored";
  duration: number | null;
  aspectRatio: string | null;
  resolution: {
    width: number | null;
    height: number | null;
  };
  thumbnailUrl: string | null;
  playbackUrl: string | null;
  embedUrl?: string;
}

/**
 * Create a direct upload using the active video provider
 * Returns provider-specific upload credentials
 */
export async function createUnifiedDirectUpload(
  options: {
    title?: string;
    corsOrigin?: string;
    collectionId?: string;
  } = {},
): Promise<UnifiedDirectUploadResult | null> {
  const provider = getActiveVideoProvider();

  if (provider === "bunny") {
    const result = await createBunnyDirectUpload(
      options.title ?? "Untitled Video",
      options.collectionId,
    );

    return {
      provider: "bunny",
      bunnyVideoId: result.videoId,
      bunnyTusCredentials: result.tusCredentials,
      bunnyEmbedUrl: result.embedUrl,
    };
  }

  if (provider === "mux") {
    const result = await createDirectUpload(options.corsOrigin);
    if (!result) return null;

    return {
      provider: "mux",
      muxUploadId: result.uploadId,
      muxUploadUrl: result.uploadUrl,
    };
  }

  // S3-only mode - no transcoding upload
  return null;
}

/**
 * Get video asset details using the active provider
 */
export async function getUnifiedVideoAsset(
  assetId: string,
): Promise<UnifiedVideoAsset | null> {
  const provider = getActiveVideoProvider();

  if (provider === "bunny") {
    const asset = await getBunnyVideo(assetId);
    if (!asset) return null;

    return {
      provider: "bunny",
      id: asset.id,
      playbackId: asset.playbackId,
      status: asset.status,
      duration: asset.duration,
      aspectRatio: asset.aspectRatio,
      resolution: asset.resolution,
      thumbnailUrl: asset.thumbnailUrl,
      playbackUrl: asset.hlsUrl,
      embedUrl: asset.embedUrl,
    };
  }

  if (provider === "mux") {
    const asset = await getVideoAsset(assetId);
    if (!asset) return null;

    return {
      provider: "mux",
      id: asset.id,
      playbackId: asset.playbackId,
      status: asset.status,
      duration: asset.duration,
      aspectRatio: asset.aspectRatio,
      resolution: asset.resolution,
      thumbnailUrl: asset.thumbnailUrl,
      playbackUrl: asset.playbackId ? getPlaybackUrl(asset.playbackId) : null,
    };
  }

  return null;
}

/**
 * Delete video asset using the active provider
 */
export async function deleteUnifiedVideoAsset(assetId: string): Promise<void> {
  const provider = getActiveVideoProvider();

  if (provider === "bunny") {
    await deleteBunnyVideo(assetId);
    return;
  }

  if (provider === "mux") {
    await deleteVideoAsset(assetId);
    return;
  }
}

/**
 * Get unified playback URL for a video
 */
export function getUnifiedPlaybackUrl(playbackId: string): string {
  const provider = getActiveVideoProvider();

  if (provider === "bunny") {
    return getBunnyPlaybackUrl(playbackId);
  }

  // Mux is the default
  return getPlaybackUrl(playbackId);
}

/**
 * Get unified thumbnail URL for a video
 */
export function getUnifiedThumbnailUrl(
  playbackId: string,
  options?: {
    time?: number;
    width?: number;
    height?: number;
  },
): string {
  const provider = getActiveVideoProvider();

  if (provider === "bunny") {
    return getBunnyThumbnailUrl(playbackId, { time: options?.time });
  }

  // Mux is the default
  return getThumbnailUrl(playbackId, options);
}
