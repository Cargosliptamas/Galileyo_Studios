import crypto from "node:crypto";

/**
 * Bunny.net Stream Service
 * API Documentation: https://docs.bunny.net/stream
 *
 * Environment variables:
 * - ENABLE_BUNNY: Set to "true" to enable Bunny Stream
 * - BUNNY_STREAM_API_KEY: Your Bunny Stream library API key
 * - BUNNY_STREAM_LIBRARY_ID: Your Bunny Stream library ID
 * - BUNNY_STREAM_CDN_HOSTNAME: Your Bunny CDN hostname (e.g., vz-abc123.b-cdn.net)
 * - BUNNY_USE_TUS: Set to "true" for TUS resumable uploads, "false" for HTTP API (default: true)
 * - BUNNY_WEBHOOK_SECRET: Optional webhook secret for signature verification
 */

const BUNNY_API_BASE = "https://video.bunnycdn.com";
const BUNNY_TUS_ENDPOINT = "https://video.bunnycdn.com/tusupload";

/**
 * Check if Bunny Stream is enabled and configured
 */
export function isBunnyEnabled(): boolean {
  return (
    process.env.ENABLE_BUNNY === "true" &&
    !!process.env.BUNNY_STREAM_API_KEY &&
    !!process.env.BUNNY_STREAM_LIBRARY_ID
  );
}

/**
 * Check if TUS resumable uploads are enabled for Bunny
 * TUS is recommended for large files and unreliable connections
 * HTTP API is simpler but doesn't support resumable uploads
 *
 * Default: true (TUS enabled)
 */
export function isBunnyTusEnabled(): boolean {
  // Default to true if not explicitly set to "false"
  return process.env.BUNNY_USE_TUS !== "false";
}

/**
 * Get the Bunny upload mode
 */
export function getBunnyUploadMode(): "tus" | "http" {
  return isBunnyTusEnabled() ? "tus" : "http";
}

/**
 * Get the current video provider type
 */
export function getVideoProvider(): "bunny" | "mux" | "s3" {
  if (isBunnyEnabled()) {
    return "bunny";
  }
  if (
    process.env.ENABLE_MUX === "true" &&
    process.env.MUX_TOKEN_ID &&
    process.env.MUX_TOKEN_SECRET
  ) {
    return "mux";
  }
  return "s3";
}

function getBunnyConfig() {
  if (!isBunnyEnabled()) {
    throw new Error(
      "Bunny Stream is not enabled. Set ENABLE_BUNNY=true and provide BUNNY_STREAM_API_KEY and BUNNY_STREAM_LIBRARY_ID.",
    );
  }

  return {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    apiKey: process.env.BUNNY_STREAM_API_KEY!,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    libraryId: process.env.BUNNY_STREAM_LIBRARY_ID!,
    cdnHostname: process.env.BUNNY_STREAM_CDN_HOSTNAME,
    useTus: isBunnyTusEnabled(),
  };
}

export interface BunnyVideoResponse {
  videoLibraryId: number;
  guid: string;
  title: string;
  dateUploaded: string;
  views: number;
  isPublic: boolean;
  length: number;
  status: number;
  framerate: number;
  rotation: number;
  width: number;
  height: number;
  availableResolutions: string;
  thumbnailCount: number;
  encodeProgress: number;
  storageSize: number;
  captions: {
    srclang: string;
    label: string;
  }[];
  hasMP4Fallback: boolean;
  collectionId: string | null;
  thumbnailFileName: string;
  averageWatchTime: number;
  totalWatchTime: number;
  category: string;
  chapters: {
    title: string;
    start: number;
    end: number;
  }[];
  moments: {
    label: string;
    timestamp: number;
  }[];
  metaTags: {
    property: string;
    value: string;
  }[];
  transcodingMessages: {
    timeStamp: string;
    level: number;
    issueCode: number;
    message: string;
    value: string;
  }[];
}

export interface BunnyCreateVideoResult {
  videoId: string;
  libraryId: string;
}

export interface BunnyTusUploadCredentials {
  videoId: string;
  libraryId: string;
  tusEndpoint: string;
  expirationTime: number;
  signature: string;
}

export interface BunnyVideoAsset {
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
  embedUrl: string;
  hlsUrl: string | null;
}

/**
 * Create a video object in Bunny Stream
 * This must be done before uploading the video file
 */
export async function createBunnyVideo(
  title: string,
  collectionId?: string,
): Promise<BunnyCreateVideoResult> {
  const config = getBunnyConfig();

  const response = await fetch(
    `${BUNNY_API_BASE}/library/${config.libraryId}/videos`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        AccessKey: config.apiKey,
      },
      body: JSON.stringify({
        title,
        ...(collectionId && { collectionId }),
      }),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create Bunny video: ${error}`);
  }

  const video = (await response.json()) as BunnyVideoResponse;

  return {
    videoId: video.guid,
    libraryId: config.libraryId,
  };
}

/**
 * Generate TUS upload credentials for direct client upload
 * This allows end-users to upload directly to Bunny Stream
 */
export function generateTusUploadCredentials(
  videoId: string,
  expirationSeconds = 86400, // 24 hours default
): BunnyTusUploadCredentials {
  const config = getBunnyConfig();
  const expirationTime = Math.floor(Date.now() / 1000) + expirationSeconds;

  // Generate SHA256 signature: libraryId + apiKey + expirationTime + videoId
  const signatureString = `${config.libraryId}${config.apiKey}${expirationTime}${videoId}`;
  const signature = crypto
    .createHash("sha256")
    .update(signatureString)
    .digest("hex");

  return {
    videoId,
    libraryId: config.libraryId,
    tusEndpoint: BUNNY_TUS_ENDPOINT,
    expirationTime,
    signature,
  };
}

/**
 * HTTP upload credentials (for non-TUS mode)
 * Client uploads to our server, which then proxies to Bunny
 */
export interface BunnyHttpUploadCredentials {
  videoId: string;
  libraryId: string;
  /** The upload endpoint on our server that proxies to Bunny */
  uploadEndpoint: string;
}

/**
 * Upload result type that varies based on upload mode
 */
export interface BunnyDirectUploadResult {
  videoId: string;
  libraryId: string;
  uploadMode: "tus" | "http";
  embedUrl: string;
  /** TUS credentials - only present when uploadMode is "tus" */
  tusCredentials?: BunnyTusUploadCredentials;
  /** HTTP upload info - only present when uploadMode is "http" */
  httpUpload?: BunnyHttpUploadCredentials;
}

/**
 * Create a direct upload for Bunny Stream
 * Returns video ID and upload credentials based on the configured upload mode
 *
 * Upload modes:
 * - TUS (default): Client uploads directly to Bunny using TUS resumable uploads
 *   - Better for large files and unreliable connections
 *   - Requires tus-js-client on the frontend
 * - HTTP: Client uploads to our server, which proxies to Bunny
 *   - Simpler implementation, no special client library needed
 *   - Not resumable, server memory/bandwidth overhead
 */
export async function createBunnyDirectUpload(
  title: string,
  collectionId?: string,
): Promise<BunnyDirectUploadResult> {
  const video = await createBunnyVideo(title, collectionId);
  const config = getBunnyConfig();
  const uploadMode = getBunnyUploadMode();
  const embedUrl = `https://iframe.mediadelivery.net/embed/${config.libraryId}/${video.videoId}`;

  if (uploadMode === "tus") {
    // TUS mode: Return TUS credentials for direct client upload
    const tusCredentials = generateTusUploadCredentials(video.videoId);
    return {
      videoId: video.videoId,
      libraryId: video.libraryId,
      uploadMode: "tus",
      embedUrl,
      tusCredentials,
    };
  }

  // HTTP mode: Return info for server-proxied upload
  return {
    videoId: video.videoId,
    libraryId: video.libraryId,
    uploadMode: "http",
    embedUrl,
    httpUpload: {
      videoId: video.videoId,
      libraryId: config.libraryId,
      // Client will POST to our API endpoint which proxies to Bunny
      uploadEndpoint: `/api/video/bunny-upload/${video.videoId}`,
    },
  };
}

/**
 * Upload a video file to Bunny Stream using the HTTP API
 * This is called server-side to proxy uploads from clients
 *
 * @see https://docs.bunny.net/stream/http-api
 *
 * @param videoId - The Bunny video GUID (from createBunnyVideo)
 * @param videoData - The video file as a Buffer or ReadableStream
 * @returns Success response from Bunny
 */
export async function uploadBunnyVideoHttp(
  videoId: string,
  videoData: Buffer | ReadableStream<Uint8Array>,
): Promise<{ success: boolean; message: string }> {
  const config = getBunnyConfig();

  const response = await fetch(
    `${BUNNY_API_BASE}/library/${config.libraryId}/videos/${videoId}`,
    {
      method: "PUT",
      headers: {
        Accept: "application/json",
        AccessKey: config.apiKey,
      },
      body: videoData,
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to upload video to Bunny: ${error}`);
  }

  const result = (await response.json()) as {
    success: boolean;
    message: string;
  };
  return result;
}

/**
 * Get video details from Bunny Stream
 */
export async function getBunnyVideo(
  videoId: string,
): Promise<BunnyVideoAsset | null> {
  const config = getBunnyConfig();

  const response = await fetch(
    `${BUNNY_API_BASE}/library/${config.libraryId}/videos/${videoId}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        AccessKey: config.apiKey,
      },
    },
  );

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    const error = await response.text();
    throw new Error(`Failed to get Bunny video: ${error}`);
  }

  const video = (await response.json()) as BunnyVideoResponse;

  // Map Bunny status to our status
  // 0=Queued, 1=Processing, 2=Encoding, 3=Finished, 4=Resolution finished, 5=Failed
  let status: "preparing" | "ready" | "errored";
  if (video.status === 5) {
    status = "errored";
  } else if (video.status >= 3) {
    status = "ready";
  } else {
    status = "preparing";
  }

  // Calculate aspect ratio from width and height
  let aspectRatio: string | null = null;
  if (video.width && video.height) {
    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
    const divisor = gcd(video.width, video.height);
    aspectRatio = `${video.width / divisor}:${video.height / divisor}`;
  }

  // Construct URLs
  const cdnHostname =
    config.cdnHostname ?? `vz-${config.libraryId.substring(0, 8)}.b-cdn.net`;

  return {
    id: video.guid,
    playbackId: video.guid, // In Bunny, the video GUID is the playback ID
    status,
    duration: video.length > 0 ? video.length : null,
    aspectRatio,
    resolution: {
      width: video.width || null,
      height: video.height || null,
    },
    thumbnailUrl:
      status === "ready"
        ? `https://${cdnHostname}/${video.guid}/thumbnail.jpg`
        : null,
    embedUrl: `https://iframe.mediadelivery.net/embed/${config.libraryId}/${video.guid}`,
    hlsUrl:
      status === "ready"
        ? `https://${cdnHostname}/${video.guid}/playlist.m3u8`
        : null,
  };
}

/**
 * Delete a video from Bunny Stream
 */
export async function deleteBunnyVideo(videoId: string): Promise<void> {
  const config = getBunnyConfig();

  const response = await fetch(
    `${BUNNY_API_BASE}/library/${config.libraryId}/videos/${videoId}`,
    {
      method: "DELETE",
      headers: {
        AccessKey: config.apiKey,
      },
    },
  );

  if (!response.ok && response.status !== 404) {
    const error = await response.text();
    throw new Error(`Failed to delete Bunny video: ${error}`);
  }
}

/**
 * Get the HLS playback URL for a Bunny video
 */
export function getBunnyPlaybackUrl(videoId: string): string {
  const config = getBunnyConfig();
  const cdnHostname =
    config.cdnHostname ?? `vz-${config.libraryId.substring(0, 8)}.b-cdn.net`;

  return `https://${cdnHostname}/${videoId}/playlist.m3u8`;
}

/**
 * Get the embed URL for a Bunny video
 */
export function getBunnyEmbedUrl(videoId: string): string {
  const config = getBunnyConfig();
  return `https://iframe.mediadelivery.net/embed/${config.libraryId}/${videoId}`;
}

/**
 * Get thumbnail URL for a Bunny video
 */
export function getBunnyThumbnailUrl(
  videoId: string,
  options?: {
    time?: number; // Time in seconds
  },
): string {
  const config = getBunnyConfig();
  const cdnHostname =
    config.cdnHostname ?? `vz-${config.libraryId.substring(0, 8)}.b-cdn.net`;

  let url = `https://${cdnHostname}/${videoId}/thumbnail.jpg`;
  if (options?.time !== undefined) {
    url += `?time=${options.time}`;
  }

  return url;
}

/**
 * Get animated preview GIF URL for a Bunny video
 */
export function getBunnyPreviewUrl(videoId: string): string {
  const config = getBunnyConfig();
  const cdnHostname =
    config.cdnHostname ?? `vz-${config.libraryId.substring(0, 8)}.b-cdn.net`;

  return `https://${cdnHostname}/${videoId}/preview.webp`;
}

/**
 * Bunny webhook status codes
 */
export enum BunnyWebhookStatus {
  Queued = 0,
  Processing = 1,
  Encoding = 2,
  Finished = 3,
  ResolutionFinished = 4,
  Failed = 5,
  PresignedUploadStarted = 6,
  PresignedUploadFinished = 7,
  PresignedUploadFailed = 8,
  CaptionsGenerated = 9,
  TitleOrDescriptionGenerated = 10,
}

export interface BunnyWebhookPayload {
  VideoLibraryId: number;
  VideoGuid: string;
  Status: BunnyWebhookStatus;
}

/**
 * Parse and validate a Bunny webhook payload
 */
export function parseBunnyWebhook(body: string): BunnyWebhookPayload {
  const payload = JSON.parse(body) as BunnyWebhookPayload;

  if (
    typeof payload.VideoLibraryId !== "number" ||
    typeof payload.VideoGuid !== "string" ||
    typeof payload.Status !== "number"
  ) {
    throw new Error("Invalid Bunny webhook payload");
  }

  return payload;
}

/**
 * Convert Bunny webhook status to our transcoding status
 */
export function bunnyStatusToTranscodingStatus(
  status: BunnyWebhookStatus,
): "pending" | "processing" | "ready" | "errored" {
  switch (status) {
    case BunnyWebhookStatus.Queued:
      return "pending";
    case BunnyWebhookStatus.Processing:
    case BunnyWebhookStatus.Encoding:
    case BunnyWebhookStatus.PresignedUploadStarted:
    case BunnyWebhookStatus.PresignedUploadFinished:
    case BunnyWebhookStatus.ResolutionFinished:
      return "ready";
    case BunnyWebhookStatus.Finished:
    case BunnyWebhookStatus.CaptionsGenerated:
    case BunnyWebhookStatus.TitleOrDescriptionGenerated:
      return "ready";
    case BunnyWebhookStatus.Failed:
    case BunnyWebhookStatus.PresignedUploadFailed:
      return "errored";
    default:
      return "processing";
  }
}

/**
 * Fetch video from a remote URL (useful for importing existing videos)
 */
export async function fetchBunnyVideoFromUrl(
  url: string,
  title?: string,
): Promise<BunnyCreateVideoResult> {
  const config = getBunnyConfig();

  const response = await fetch(
    `${BUNNY_API_BASE}/library/${config.libraryId}/videos/fetch`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        AccessKey: config.apiKey,
      },
      body: JSON.stringify({
        url,
        ...(title && { title }),
      }),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch video from URL: ${error}`);
  }

  const video = (await response.json()) as BunnyVideoResponse;

  return {
    videoId: video.guid,
    libraryId: config.libraryId,
  };
}

/**
 * List videos in the library
 */
export async function listBunnyVideos(options?: {
  page?: number;
  itemsPerPage?: number;
  search?: string;
  collectionId?: string;
  orderBy?: "date" | "title";
}): Promise<{
  items: BunnyVideoResponse[];
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
}> {
  const config = getBunnyConfig();

  const params = new URLSearchParams();
  if (options?.page) params.set("page", options.page.toString());
  if (options?.itemsPerPage)
    params.set("itemsPerPage", options.itemsPerPage.toString());
  if (options?.search) params.set("search", options.search);
  if (options?.collectionId) params.set("collection", options.collectionId);
  if (options?.orderBy) params.set("orderBy", options.orderBy);

  const response = await fetch(
    `${BUNNY_API_BASE}/library/${config.libraryId}/videos?${params.toString()}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        AccessKey: config.apiKey,
      },
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to list Bunny videos: ${error}`);
  }

  const data = (await response.json()) as {
    items: BunnyVideoResponse[];
    totalItems: number;
    currentPage: number;
    itemsPerPage: number;
  };

  return data;
}
