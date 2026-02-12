import { env } from "~/env/client";

export function isVideoProxyEnabled(): boolean {
  return env.NEXT_PUBLIC_VIDEO_PROXY_ENABLED;
}

export function getVideoPlaybackProxyUrl(
  videoId: number,
  playbackId?: string | null,
  fallbackUrl?: string | null,
): string {
  if (!isVideoProxyEnabled()) {
    return fallbackUrl ?? "";
  }

  const format = playbackId ? "hls" : "mp4";
  return `/api/videos/${videoId}/playback?format=${format}`;
}

export function getVideoThumbnailProxyUrl(
  videoId: number,
  fallbackUrl?: string | null,
): string {
  if (!isVideoProxyEnabled()) {
    return fallbackUrl ?? "";
  }

  return `/api/videos/${videoId}/thumbnail`;
}
