import { z } from "zod/v4";

// Video status enums
export const VideoS3Status = z.enum([
  "pending",
  "uploading",
  "uploaded",
  "failed",
]);
export const VideoTranscodingStatus = z.enum([
  "pending",
  "processing",
  "ready",
  "errored",
]);

export type VideoS3StatusType = z.infer<typeof VideoS3Status>;
export type VideoTranscodingStatusType = z.infer<typeof VideoTranscodingStatus>;

// Schema for creating a new video upload
export const CreateVideoUploadSchema = z.object({
  fileName: z.string().min(1),
  contentType: z.string().regex(/^video\//, "Must be a video content type"),
  fileSize: z
    .number()
    .positive()
    .max(500 * 1024 * 1024, "File size must be less than 500MB"),
  caption: z.string().max(500).optional(),
  subscriptionId: z.number().optional(), // If posting to an influencer feed
});

export type CreateVideoUploadInput = z.infer<typeof CreateVideoUploadSchema>;

// Schema for confirming upload completion
export const ConfirmVideoUploadSchema = z.object({
  videoId: z.number(),
  s3Completed: z.boolean(),
  muxUploadId: z.string().optional(),
});

export type ConfirmVideoUploadInput = z.infer<typeof ConfirmVideoUploadSchema>;

// Schema for listing videos
export const ListVideosSchema = z.object({
  limit: z.number().min(1).max(50).default(20),
  cursor: z.number().optional(),
  userId: z.number().optional(), // Filter by user
  subscriptionId: z.number().optional(), // Filter by subscription/influencer
  status: VideoTranscodingStatus.optional(), // Filter by status
});

export type ListVideosInput = z.infer<typeof ListVideosSchema>;

// Schema for getting a single video
export const GetVideoByIdSchema = z.object({
  id: z.number(),
});

export type GetVideoByIdInput = z.infer<typeof GetVideoByIdSchema>;

// Schema for deleting a video
export const DeleteVideoSchema = z.object({
  id: z.number(),
});

export type DeleteVideoInput = z.infer<typeof DeleteVideoSchema>;

// Schema for updating video transcoding status (webhook)
export const UpdateVideoStatusSchema = z.object({
  muxAssetId: z.string(),
  status: VideoTranscodingStatus,
  playbackId: z.string().optional(),
  duration: z.number().optional(),
  aspectRatio: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  error: z.string().optional(),
});

export type UpdateVideoStatusInput = z.infer<typeof UpdateVideoStatusSchema>;

// Video item returned from API
export interface VideoItem {
  id: number;
  userId: number;
  caption: string | null;

  // S3 storage
  s3Key: string | null;
  s3Url: string | null;
  s3Status: VideoS3StatusType;

  // Transcoding service
  muxAssetId: string | null;
  muxUploadId: string | null;
  playbackId: string | null;
  transcodingStatus: VideoTranscodingStatusType;

  // Video metadata
  duration: number | null;
  aspectRatio: string | null;
  thumbnailUrl: string | null;
  width: number | null;
  height: number | null;
  fileSize: number | null;

  // Playback URLs (computed)
  playbackUrl: string | null;

  // Engagement
  likeCount: number;
  commentCount: number;
  isLiked: boolean;

  // Creator info
  creator: {
    id: number;
    name: string;
    image: string | null;
    isVerified: boolean;
    isInfluencer: boolean;
  };

  // Timestamps
  createdAt: string;
  updatedAt: string | null;
}

// Response for upload URLs
export interface VideoUploadUrls {
  videoId: number;
  s3: {
    uploadUrl: string;
    key: string;
    publicUrl: string;
  };
  mux: {
    uploadUrl: string;
    uploadId: string;
  };
}

// ============================================
// Video Sharing Schemas
// ============================================

// Schema for sharing (reposting) a video
export const ShareVideoSchema = z.object({
  videoId: z.number(),
  caption: z.string().max(500).optional(),
});

export type ShareVideoInput = z.infer<typeof ShareVideoSchema>;

// Schema for unsharing a video
export const UnshareVideoSchema = z.object({
  videoId: z.number(),
});

export type UnshareVideoInput = z.infer<typeof UnshareVideoSchema>;

// Schema for toggling video shareability
export const ToggleShareabilitySchema = z.object({
  videoId: z.number(),
  allowSharing: z.boolean(),
});

export type ToggleShareabilityInput = z.infer<typeof ToggleShareabilitySchema>;

// Schema for getting shares of a video
export const GetVideoSharesSchema = z.object({
  videoId: z.number(),
  limit: z.number().min(1).max(50).default(20),
  cursor: z.number().optional(),
});

export type GetVideoSharesInput = z.infer<typeof GetVideoSharesSchema>;

// Schema for getting user's shared videos
export const GetUserSharesSchema = z.object({
  userId: z.number().optional(), // If not provided, use current user
  limit: z.number().min(1).max(50).default(20),
  cursor: z.number().optional(),
});

export type GetUserSharesInput = z.infer<typeof GetUserSharesSchema>;

// Schema for listing videos with reposts
export const ListVideosWithRepostsSchema = z.object({
  limit: z.number().min(1).max(50).default(20),
  cursor: z.number().nullish(),
  userId: z.number().optional(),
  subscriptionId: z.number().optional(),
  status: z.enum(["pending", "processing", "ready", "errored"]).optional(),
  includeReposts: z.boolean().default(true), // Include reposts in feed
});

export type ListVideosWithRepostsInput = z.infer<
  typeof ListVideosWithRepostsSchema
>;

// Video share item returned from API
export interface VideoShareItem {
  id: number;
  videoId: number;
  caption: string | null;
  createdAt: string;
  // Who shared the video
  sharedBy: {
    id: number;
    name: string;
    image: string | null;
    isInfluencer: boolean;
  };
  // Original video creator
  originalCreator: {
    id: number;
    name: string;
    image: string | null;
    isInfluencer: boolean;
  };
  // The video itself
  video: VideoItem;
}
