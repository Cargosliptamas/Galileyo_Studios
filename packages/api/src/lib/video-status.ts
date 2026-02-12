import type { BunnyVideoAsset } from "./bunny-service";
import type { VideoAsset } from "./video-service";
import {
  bunnyStatusToTranscodingStatus,
  BunnyWebhookStatus,
  getBunnyVideo,
} from "./bunny-service";

export type VideoTranscodingStatus =
  | "pending"
  | "processing"
  | "ready"
  | "errored";

export interface VideoMetadataUpdate {
  transcodingStatus: VideoTranscodingStatus;
  playbackId?: string | null;
  duration?: number | null;
  aspectRatio?: string | null;
  width?: number | null;
  height?: number | null;
  thumbnailUrl?: string | null;
}

function normalizeDuration(duration: number | null): number | null {
  if (duration === null) {
    return null;
  }
  return Math.round(duration);
}

export function buildBunnyAssetUpdate(
  asset: BunnyVideoAsset | null,
): VideoMetadataUpdate | null {
  if (!asset) {
    return null;
  }

  const transcodingStatus =
    asset.status === "ready"
      ? "ready"
      : asset.status === "errored"
        ? "errored"
        : "processing";

  return {
    transcodingStatus,
    playbackId: asset.playbackId ?? null,
    duration: normalizeDuration(asset.duration),
    aspectRatio: asset.aspectRatio,
    width: asset.resolution.width,
    height: asset.resolution.height,
    thumbnailUrl: asset.thumbnailUrl,
  };
}

export function buildMuxAssetUpdate(
  asset: VideoAsset | null,
): VideoMetadataUpdate | null {
  if (!asset) {
    return null;
  }

  const transcodingStatus =
    asset.status === "ready"
      ? "ready"
      : asset.status === "errored"
        ? "errored"
        : "processing";

  return {
    transcodingStatus,
    playbackId: asset.playbackId ?? null,
    duration: normalizeDuration(asset.duration),
    aspectRatio: asset.aspectRatio,
    width: asset.resolution.width,
    height: asset.resolution.height,
    thumbnailUrl: asset.thumbnailUrl,
  };
}

export function buildVideoUpdatePayload(
  update: VideoMetadataUpdate,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    transcodingStatus: update.transcodingStatus,
  };

  if (update.playbackId !== undefined) {
    payload.playbackId = update.playbackId;
  }
  if (update.duration !== undefined) {
    payload.duration = update.duration;
  }
  if (update.aspectRatio !== undefined) {
    payload.aspectRatio = update.aspectRatio;
  }
  if (update.width !== undefined) {
    payload.width = update.width;
  }
  if (update.height !== undefined) {
    payload.height = update.height;
  }
  if (update.thumbnailUrl !== undefined) {
    payload.thumbnailUrl = update.thumbnailUrl;
  }

  return payload;
}

export async function buildBunnyWebhookUpdate(
  videoGuid: string,
  status: BunnyWebhookStatus,
): Promise<VideoMetadataUpdate> {
  const transcodingStatus = bunnyStatusToTranscodingStatus(status);

  if (
    status === BunnyWebhookStatus.Finished ||
    status === BunnyWebhookStatus.ResolutionFinished
  ) {
    const asset = await getBunnyVideo(videoGuid);
    const assetUpdate = buildBunnyAssetUpdate(asset);
    if (assetUpdate) {
      return assetUpdate;
    }
  }

  return { transcodingStatus };
}
