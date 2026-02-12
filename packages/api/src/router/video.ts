import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, inArray, lt, or, sql } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { z } from "zod/v4";

import { db } from "@galileyo/db/client";
import {
  follower,
  hashtag,
  influencerPage,
  sound,
  soundFavorite,
  user,
  userSubscription,
  video,
  videoCollection,
  videoComment,
  videoCommentLike,
  videoDuetStitch,
  videoHashtag,
  videoLike,
  videoReaction,
  videoSave,
  videoShare,
  videoSound,
  videoView,
} from "@galileyo/db/schema";

import type { BunnyWebhookStatus } from "../lib/video-service";
import { deleteFromS3, getPresignedUploadUrl } from "../lib/s3";
import {
  createBunnyDirectUpload,
  createDirectUpload,
  deleteBunnyVideo,
  deleteVideoAsset,
  getActiveVideoProvider,
  getBunnyPlaybackUrl,
  getBunnyThumbnailUrl,
  getBunnyUploadMode,
  getBunnyVideo,
  getPlaybackUrl,
  getUnifiedPlaybackUrl,
  getUnifiedThumbnailUrl,
  getUploadStatus,
  getVideoAsset,
  // Bunny service imports
  isBunnyEnabled,
  isBunnyTusEnabled,
  isMuxEnabled,
  isTranscodingEnabled,
  uploadBunnyVideoHttp,
} from "../lib/video-service";
import {
  buildBunnyAssetUpdate,
  buildBunnyWebhookUpdate,
  buildMuxAssetUpdate,
  buildVideoUpdatePayload,
} from "../lib/video-status";
import { protectedProcedure, publicProcedure } from "../trpc";

// Input schemas (inline to avoid import issues during development)
const CreateVideoUploadSchema = z.object({
  fileName: z.string().min(1),
  contentType: z.string().regex(/^video\//, "Must be a video content type"),
  fileSize: z
    .number()
    .positive()
    .max(500 * 1024 * 1024, "File size must be less than 500MB"),
  caption: z.string().max(500).optional(),
  subscriptionId: z.number().optional(),
  userFeed: z.enum(["public", "friends"]).optional(),
});

const ConfirmVideoUploadSchema = z.object({
  videoId: z.number(),
  s3Completed: z.boolean(),
  muxUploadId: z.string().optional(),
  bunnyVideoId: z.string().optional(),
  userFeed: z.enum(["public", "friends"]).optional(),
  subscriptionId: z.number().optional(),
  caption: z.string().max(500).optional(),
});

const GetThumbnailUploadUrlSchema = z.object({
  videoId: z.number().int().positive(),
  fileName: z.string().min(1),
  contentType: z.string().regex(/^image\//, "Must be an image content type"),
});

const ConfirmThumbnailUploadSchema = z.object({
  videoId: z.number().int().positive(),
  thumbnailUrl: z.string().url(),
});

// Reaction schemas
const SetReactionSchema = z.object({
  videoId: z.number(),
  reactionId: z.number().min(1).max(6), // 1=like, 2=dislike, 3=laugh, 4=love, 5=fire, 6=disgust
});

const RemoveReactionSchema = z.object({
  videoId: z.number(),
});

const ListVideosSchema = z.object({
  limit: z.number().min(1).max(50).default(20),
  cursor: z.number().nullish(), // Accept null, undefined, or number for infinite query pagination
  userId: z.number().optional(),
  subscriptionId: z.number().optional(),
  status: z.enum(["pending", "processing", "ready", "errored"]).optional(),
  feedType: z.enum(["forYou", "following"]).default("forYou"),
});

const GetVideoByIdSchema = z.object({
  id: z.number(),
});

const DeleteVideoSchema = z.object({
  id: z.number(),
});

const UpdateVideoStatusSchema = z.object({
  muxAssetId: z.string().optional(),
  bunnyVideoId: z.string().optional(),
  status: z.enum(["pending", "processing", "ready", "errored"]),
  playbackId: z.string().optional(),
  duration: z.number().optional(),
  aspectRatio: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  thumbnailUrl: z.string().optional(),
  error: z.string().optional(),
});

// Bunny webhook schema
const BunnyWebhookSchema = z.object({
  VideoLibraryId: z.number(),
  VideoGuid: z.string(),
  Status: z.number(),
});

const CUSTOM_THUMBNAIL_KEY_PREFIX = "video-thumbnails/";

function isCustomThumbnailUrl(url: string | null | undefined): url is string {
  return typeof url === "string" && url.includes(CUSTOM_THUMBNAIL_KEY_PREFIX);
}

function resolveCustomThumbnailKey(
  thumbnailUrl: string | null | undefined,
): string | null {
  if (!thumbnailUrl) return null;

  try {
    const pathname = new URL(thumbnailUrl).pathname;
    const normalizedPath = pathname.startsWith("/")
      ? pathname.slice(1)
      : pathname;
    const prefixIndex = normalizedPath.indexOf(CUSTOM_THUMBNAIL_KEY_PREFIX);
    return prefixIndex >= 0 ? normalizedPath.slice(prefixIndex) : null;
  } catch {
    const prefixIndex = thumbnailUrl.indexOf(CUSTOM_THUMBNAIL_KEY_PREFIX);
    return prefixIndex >= 0 ? thumbnailUrl.slice(prefixIndex) : null;
  }
}

// Helper function to extract hashtags from text
function extractHashtags(text: string): string[] {
  const hashtagRegex = /#([a-zA-Z0-9_]+)/g;
  const matches = text.match(hashtagRegex);
  if (!matches) return [];

  // Remove # and deduplicate, convert to lowercase
  const hashtags = [
    ...new Set(matches.map((tag) => tag.slice(1).toLowerCase())),
  ];
  return hashtags.slice(0, 30); // Limit to 30 hashtags per video
}

// Helper function to process hashtags for a video
async function processVideoHashtags(
  videoId: number,
  caption: string | null,
): Promise<void> {
  if (!caption) return;

  const hashtags = extractHashtags(caption);
  if (hashtags.length === 0) return;

  const now = new Date().toISOString().slice(0, 19).replace("T", " ");

  for (const tagName of hashtags) {
    // Upsert hashtag (insert or update count)
    const [existingTag] = await db
      .select({ id: hashtag.id })
      .from(hashtag)
      .where(eq(hashtag.name, tagName));

    let hashtagId: number;

    if (existingTag) {
      hashtagId = existingTag.id;
      // Increment video count
      await db
        .update(hashtag)
        .set({
          videoCount: sql`${hashtag.videoCount} + 1`,
          updatedAt: now,
        })
        .where(eq(hashtag.id, hashtagId));
    } else {
      // Create new hashtag
      const [result] = await db.insert(hashtag).values({
        name: tagName,
        videoCount: 1,
        createdAt: now,
      });
      hashtagId = Number(result.insertId);
    }

    // Link video to hashtag
    try {
      await db.insert(videoHashtag).values({
        idVideo: videoId,
        idHashtag: hashtagId,
        createdAt: now,
      });
    } catch {
      // Ignore duplicate key errors (video already linked to hashtag)
    }
  }
}

export const videoRouter = {
  /**
   * Check if video transcoding is enabled and get provider info
   * Returns the active video provider (bunny, mux, or s3)
   */
  isMuxEnabled: publicProcedure.query(() => {
    const provider = getActiveVideoProvider();
    return {
      enabled: isTranscodingEnabled(),
      provider,
      muxEnabled: isMuxEnabled(),
      bunnyEnabled: isBunnyEnabled(),
      bunnyTusEnabled: isBunnyTusEnabled(),
      bunnyUploadMode: getBunnyUploadMode(),
    };
  }),

  /**
   * Get upload URLs for S3 (backup) and optionally Mux or Bunny (playback)
   * Returns presigned URLs for direct client uploads
   *
   * Provider priority (controlled by environment variables):
   * 1. Bunny Stream (ENABLE_BUNNY=true)
   *    - BUNNY_USE_TUS=true (default): TUS resumable uploads
   *    - BUNNY_USE_TUS=false: HTTP API (upload via server proxy)
   * 2. Mux (ENABLE_MUX=true) - Uses direct upload URLs
   * 3. S3-only - No transcoding, video is ready immediately
   */
  getUploadUrls: protectedProcedure
    .input(CreateVideoUploadSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = Number(ctx.session.user.id);
      const provider = getActiveVideoProvider();
      const muxEnabled = isMuxEnabled();
      const bunnyEnabled = isBunnyEnabled();
      const bunnyTusEnabled = isBunnyTusEnabled();
      const bunnyUploadMode = getBunnyUploadMode();

      // Generate S3 presigned URL (always needed as backup)
      const s3Upload = await getPresignedUploadUrl(
        userId,
        input.fileName,
        input.contentType,
      );

      // Generate provider-specific upload credentials
      let muxUpload: { uploadId: string; uploadUrl: string } | null = null;
      let bunnyUpload: {
        videoId: string;
        libraryId: string;
        uploadMode: "tus" | "http";
        embedUrl: string;
        // TUS-specific fields
        tusEndpoint?: string;
        expirationTime?: number;
        signature?: string;
        // HTTP-specific fields
        httpUploadEndpoint?: string;
      } | null = null;

      if (provider === "bunny") {
        // Create Bunny video and get upload credentials based on mode
        const bunnyResult = await createBunnyDirectUpload(
          input.caption ?? input.fileName,
        );

        bunnyUpload = {
          videoId: bunnyResult.videoId,
          libraryId: bunnyResult.libraryId,
          uploadMode: bunnyResult.uploadMode,
          embedUrl: bunnyResult.embedUrl,
        };

        if (bunnyResult.uploadMode === "tus" && bunnyResult.tusCredentials) {
          // TUS mode: Include TUS credentials for direct client upload
          bunnyUpload.tusEndpoint = bunnyResult.tusCredentials.tusEndpoint;
          bunnyUpload.expirationTime =
            bunnyResult.tusCredentials.expirationTime;
          bunnyUpload.signature = bunnyResult.tusCredentials.signature;
        } else if (
          bunnyResult.uploadMode === "http" &&
          bunnyResult.httpUpload
        ) {
          // HTTP mode: Include endpoint for server-proxied upload
          bunnyUpload.httpUploadEndpoint =
            bunnyResult.httpUpload.uploadEndpoint;
        }
      } else if (provider === "mux") {
        // Generate Mux direct upload URL
        muxUpload = await createDirectUpload(process.env.NEXT_PUBLIC_APP_URL);
      }

      // Create video record in database with pending status
      const now = new Date().toISOString().slice(0, 19).replace("T", " ");

      // If no transcoding provider is enabled, video is ready immediately after S3 upload
      const initialTranscodingStatus = isTranscodingEnabled()
        ? "pending"
        : "ready";

      const [result] = await db.insert(video).values({
        idUser: userId,
        idSubscription: input.subscriptionId ?? null,
        caption: input.caption ?? null,
        s3Key: s3Upload.key,
        s3Url: s3Upload.publicUrl,
        s3Status: "pending",
        muxUploadId: muxUpload?.uploadId ?? null,
        // Store Bunny video ID in playbackId field (it serves the same purpose)
        playbackId: bunnyUpload?.videoId ?? null,
        transcodingStatus: initialTranscodingStatus,
        fileSize: input.fileSize,
        createdAt: now,
      });

      const videoId = Number(result.insertId);

      return {
        videoId,
        provider,
        muxEnabled,
        bunnyEnabled,
        bunnyTusEnabled,
        bunnyUploadMode,
        s3: {
          uploadUrl: s3Upload.uploadUrl,
          key: s3Upload.key,
          publicUrl: s3Upload.publicUrl,
        },
        mux: muxUpload
          ? {
              uploadUrl: muxUpload.uploadUrl,
              uploadId: muxUpload.uploadId,
            }
          : null,
        bunny: bunnyUpload,
      };
    }),

  /**
   * Get a presigned upload URL for a custom video thumbnail
   */
  getThumbnailUploadUrl: protectedProcedure
    .input(GetThumbnailUploadUrlSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = Number(ctx.session.user.id);

      const [videoRecord] = await db
        .select({ id: video.id })
        .from(video)
        .where(and(eq(video.id, input.videoId), eq(video.idUser, userId)));

      if (!videoRecord) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found",
        });
      }

      const thumbnailUpload = await getPresignedUploadUrl(
        userId,
        input.fileName,
        input.contentType,
        3600,
        "video-thumbnails",
      );

      return {
        uploadUrl: thumbnailUpload.uploadUrl,
        key: thumbnailUpload.key,
        publicUrl: thumbnailUpload.publicUrl,
      };
    }),

  /**
   * Confirm custom thumbnail upload completion
   */
  confirmThumbnailUpload: protectedProcedure
    .input(ConfirmThumbnailUploadSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = Number(ctx.session.user.id);

      const [videoRecord] = await db
        .select({ id: video.id })
        .from(video)
        .where(and(eq(video.id, input.videoId), eq(video.idUser, userId)));

      if (!videoRecord) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found",
        });
      }

      const now = new Date().toISOString().slice(0, 19).replace("T", " ");
      await db
        .update(video)
        .set({
          thumbnailUrl: input.thumbnailUrl,
          updatedAt: now,
        })
        .where(eq(video.id, input.videoId));

      return {
        success: true,
        thumbnailUrl: input.thumbnailUrl,
      };
    }),

  /**
   * Confirm that upload has completed
   * Called by client after uploads finish
   */
  confirmUpload: protectedProcedure
    .input(ConfirmVideoUploadSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = Number(ctx.session.user.id);

      // Verify ownership
      const [existingVideo] = await db
        .select()
        .from(video)
        .where(and(eq(video.id, input.videoId), eq(video.idUser, userId)));

      if (!existingVideo) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found",
        });
      }

      const now = new Date().toISOString().slice(0, 19).replace("T", " ");
      const updates: Partial<typeof video.$inferInsert> = {
        updatedAt: now,
      };

      const provider = getActiveVideoProvider();

      // Update S3 status
      if (input.s3Completed) {
        updates.s3Status = "uploaded";

        // If no transcoding provider is enabled, mark as ready immediately
        if (!isTranscodingEnabled()) {
          updates.transcodingStatus = "ready";
        }
      }

      // Handle Bunny upload confirmation
      if (
        provider === "bunny" &&
        (input.bunnyVideoId || existingVideo.playbackId)
      ) {
        const bunnyVideoId = input.bunnyVideoId ?? existingVideo.playbackId;
        if (bunnyVideoId) {
          try {
            // Check Bunny video status
            const bunnyAsset = await getBunnyVideo(bunnyVideoId);

            const bunnyUpdate = buildBunnyAssetUpdate(bunnyAsset);
            if (bunnyUpdate) {
              updates.playbackId = bunnyVideoId;
              const bunnyPayload = buildVideoUpdatePayload(bunnyUpdate);
              if (isCustomThumbnailUrl(existingVideo.thumbnailUrl)) {
                delete bunnyPayload.thumbnailUrl;
              }
              Object.assign(updates, bunnyPayload);
            } else {
              updates.transcodingStatus = "processing";
            }
          } catch (error) {
            console.error("Error checking Bunny upload status:", error);
            // Don't throw - the upload might still be processing
            updates.transcodingStatus = "processing";
          }
        }
      }

      // Check Mux upload status and get asset ID (only if Mux is enabled)
      if (provider === "mux" && existingVideo.muxUploadId) {
        try {
          const uploadStatus = await getUploadStatus(existingVideo.muxUploadId);

          if (uploadStatus?.assetId) {
            updates.muxAssetId = uploadStatus.assetId;
            updates.transcodingStatus = "processing";
          } else if (uploadStatus?.error) {
            updates.transcodingStatus = "errored";
          }
        } catch (error) {
          console.error("Error checking Mux upload status:", error);
        }
      }

      await db.update(video).set(updates).where(eq(video.id, input.videoId));

      // Process hashtags from caption
      const captionToProcess = input.caption ?? existingVideo.caption;
      if (captionToProcess) {
        // Update caption if provided in confirm step
        if (input.caption && input.caption !== existingVideo.caption) {
          await db
            .update(video)
            .set({ caption: input.caption })
            .where(eq(video.id, input.videoId));
        }
        await processVideoHashtags(input.videoId, captionToProcess);
      }

      // Update subscription if provided
      if (input.subscriptionId) {
        await db
          .update(video)
          .set({ idSubscription: input.subscriptionId })
          .where(eq(video.id, input.videoId));
      }

      // Create sms_pool record so the video appears in the text-based feed
      try {
        // const smsBody =
        //   captionToProcess ?? "Shared a video";
        // const smsNow = new Date()
        //   .toISOString()
        //   .slice(0, 19)
        //   .replace("T", " ");

        // const smsPoolValues: typeof smsPool.$inferInsert = {
        //   idUser: userId,
        //   body: smsBody,
        //   status: 1,
        //   createdAt: smsNow,
        //   morphClass: "video",
        //   morphId: input.videoId,
        // };

        // // Link to subscription/follower list based on feed selection
        // if (input.subscriptionId) {
        //   smsPoolValues.idSubscription = input.subscriptionId;
        // }

        // if (input.userFeed === "friends") {
        //   // For friends-only posts, we don't set a subscription
        //   // The feed router handles friends-only filtering
        //   smsPoolValues.purpose = 2; // friends-only purpose
        // }

        // const [smsResult] = await db.insert(smsPool).values(smsPoolValues);
        // const newSmsPoolId = Number(smsResult.insertId);

        // // Link video to sms_pool
        // if (newSmsPoolId) {
        //   await db
        //     .update(video)
        //     .set({ idSmsPool: newSmsPoolId })
        //     .where(eq(video.id, input.videoId));
        // }

        const feedData: {
          text: string;
          uuid: string;
          videoId?: number;
          subscriptions?: number[];
          user_feed?: "friends" | "public";
        } = {
          text: captionToProcess ?? "Shared a video",
          uuid: uuid(),
          videoId: input.videoId,
        };

        if (input.subscriptionId) {
          feedData.subscriptions = [input.subscriptionId];
        } else {
          feedData.subscriptions = [];
          feedData.user_feed = input.userFeed ?? "public";
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/all-send-form/send`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${ctx.session.session.token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(feedData),
          },
        );

        const responseJson = (await response.json()) as {
          status: "success" | "error";
        };

        if (responseJson.status !== "success") {
          throw new Error("Failed to send video to text feed.");
        }
      } catch (error) {
        console.error("Error creating sms_pool for video:", error);
        // Don't fail the upload if sms_pool creation fails
      }

      return { success: true };
    }),

  /**
   * Get video transcoding status
   * Called by client to poll for processing completion
   * Supports both Mux and Bunny providers
   */
  getStatus: protectedProcedure
    .input(GetVideoByIdSchema)
    .query(async ({ input }) => {
      const provider = getActiveVideoProvider();

      const [videoRecord] = await db
        .select({
          id: video.id,
          s3Status: video.s3Status,
          s3Url: video.s3Url,
          transcodingStatus: video.transcodingStatus,
          playbackId: video.playbackId,
          thumbnailUrl: video.thumbnailUrl,
          duration: video.duration,
          muxAssetId: video.muxAssetId,
          muxUploadId: video.muxUploadId,
        })
        .from(video)
        .where(eq(video.id, input.id));

      if (!videoRecord) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found",
        });
      }

      // If no transcoding provider is enabled, video is ready when S3 upload is complete
      if (!isTranscodingEnabled()) {
        return {
          ...videoRecord,
          provider: "s3" as const,
          muxEnabled: false,
          bunnyEnabled: false,
        };
      }

      // Handle Bunny status check
      if (provider === "bunny" && videoRecord.playbackId) {
        // If still processing, check Bunny for updates
        if (
          videoRecord.transcodingStatus === "processing" ||
          videoRecord.transcodingStatus === "pending"
        ) {
          try {
            const bunnyAsset = await getBunnyVideo(videoRecord.playbackId);
            const bunnyUpdate = buildBunnyAssetUpdate(bunnyAsset);

            if (bunnyUpdate?.transcodingStatus === "ready") {
              const thumbnailUrl = isCustomThumbnailUrl(
                videoRecord.thumbnailUrl,
              )
                ? videoRecord.thumbnailUrl
                : (bunnyUpdate.thumbnailUrl ?? null);

              // Update database with video metadata
              const now = new Date()
                .toISOString()
                .slice(0, 19)
                .replace("T", " ");
              await db
                .update(video)
                .set({
                  transcodingStatus: bunnyUpdate.transcodingStatus,
                  duration: bunnyUpdate.duration ?? null,
                  aspectRatio: bunnyUpdate.aspectRatio ?? null,
                  thumbnailUrl,
                  width: bunnyUpdate.width ?? null,
                  height: bunnyUpdate.height ?? null,
                  updatedAt: now,
                })
                .where(eq(video.id, input.id));

              return {
                ...videoRecord,
                provider: "bunny" as const,
                muxEnabled: false,
                bunnyEnabled: true,
                transcodingStatus: "ready" as const,
                thumbnailUrl,
                duration: bunnyUpdate.duration ?? null,
                playbackUrl: bunnyAsset?.hlsUrl ?? null,
                embedUrl: bunnyAsset?.embedUrl ?? null,
              };
            } else if (bunnyUpdate?.transcodingStatus === "errored") {
              const now = new Date()
                .toISOString()
                .slice(0, 19)
                .replace("T", " ");
              await db
                .update(video)
                .set({
                  transcodingStatus: bunnyUpdate.transcodingStatus,
                  updatedAt: now,
                })
                .where(eq(video.id, input.id));

              return {
                ...videoRecord,
                provider: "bunny" as const,
                muxEnabled: false,
                bunnyEnabled: true,
                transcodingStatus: "errored" as const,
              };
            }
          } catch (error) {
            console.error("Error checking Bunny asset status:", error);
          }
        }

        // Return current state for Bunny
        return {
          ...videoRecord,
          provider: "bunny" as const,
          muxEnabled: false,
          bunnyEnabled: true,
          playbackUrl: videoRecord.playbackId
            ? getBunnyPlaybackUrl(videoRecord.playbackId)
            : null,
        };
      }

      // Handle Mux status check (existing logic)
      if (provider === "mux") {
        if (
          videoRecord.transcodingStatus === "pending" &&
          videoRecord.muxUploadId &&
          !videoRecord.muxAssetId
        ) {
          try {
            const uploadStatus = await getUploadStatus(videoRecord.muxUploadId);
            if (uploadStatus?.assetId) {
              const now = new Date()
                .toISOString()
                .slice(0, 19)
                .replace("T", " ");
              await db
                .update(video)
                .set({
                  muxAssetId: uploadStatus.assetId,
                  transcodingStatus: "processing",
                  updatedAt: now,
                })
                .where(eq(video.id, input.id));
              return {
                ...videoRecord,
                provider: "mux" as const,
                muxEnabled: true,
                bunnyEnabled: false,
                muxAssetId: uploadStatus.assetId,
                transcodingStatus: "processing" as const,
              };
            }
            if (uploadStatus?.error) {
              const now = new Date()
                .toISOString()
                .slice(0, 19)
                .replace("T", " ");
              await db
                .update(video)
                .set({
                  transcodingStatus: "errored",
                  updatedAt: now,
                })
                .where(eq(video.id, input.id));
              return {
                ...videoRecord,
                provider: "mux" as const,
                muxEnabled: true,
                bunnyEnabled: false,
                transcodingStatus: "errored" as const,
              };
            }
          } catch (error) {
            console.error("Error checking Mux upload status:", error);
          }
        }

        // If still processing, check Mux for updates
        if (
          videoRecord.transcodingStatus === "processing" &&
          !videoRecord.playbackId &&
          videoRecord.muxAssetId
        ) {
          try {
            const asset = await getVideoAsset(videoRecord.muxAssetId);
            const muxUpdate = buildMuxAssetUpdate(asset);

            if (
              muxUpdate?.transcodingStatus === "ready" &&
              muxUpdate.playbackId
            ) {
              const thumbnailUrl = isCustomThumbnailUrl(
                videoRecord.thumbnailUrl,
              )
                ? videoRecord.thumbnailUrl
                : (muxUpdate.thumbnailUrl ?? null);

              // Update database with video metadata
              const now = new Date()
                .toISOString()
                .slice(0, 19)
                .replace("T", " ");
              await db
                .update(video)
                .set({
                  playbackId: muxUpdate.playbackId,
                  transcodingStatus: muxUpdate.transcodingStatus,
                  duration: muxUpdate.duration ?? null,
                  aspectRatio: muxUpdate.aspectRatio ?? null,
                  thumbnailUrl,
                  width: muxUpdate.width ?? null,
                  height: muxUpdate.height ?? null,
                  updatedAt: now,
                })
                .where(eq(video.id, input.id));

              return {
                ...videoRecord,
                provider: "mux" as const,
                muxEnabled: true,
                bunnyEnabled: false,
                transcodingStatus: "ready" as const,
                playbackId: muxUpdate.playbackId,
                thumbnailUrl,
                duration: muxUpdate.duration ?? null,
              };
            } else if (muxUpdate?.transcodingStatus === "errored") {
              const now = new Date()
                .toISOString()
                .slice(0, 19)
                .replace("T", " ");
              await db
                .update(video)
                .set({
                  transcodingStatus: muxUpdate.transcodingStatus,
                  updatedAt: now,
                })
                .where(eq(video.id, input.id));

              return {
                ...videoRecord,
                provider: "mux" as const,
                muxEnabled: true,
                bunnyEnabled: false,
                transcodingStatus: "errored" as const,
              };
            }
          } catch (error) {
            console.error("Error checking Mux asset status:", error);
          }
        }

        return {
          ...videoRecord,
          provider: "mux" as const,
          muxEnabled: true,
          bunnyEnabled: false,
        };
      }

      return {
        ...videoRecord,
        provider,
        muxEnabled: isMuxEnabled(),
        bunnyEnabled: isBunnyEnabled(),
      };
    }),

  /**
   * List videos with infinite scroll
   */
  list: protectedProcedure
    .input(ListVideosSchema)
    .query(async ({ ctx, input }) => {
      const currentUserId = Number(ctx.session.user.id);
      let followedUserIds: number[] = [];
      let followedSubscriptionIds: number[] = [];

      // Base conditions: ready videos that are published (or NULL for backwards compatibility)
      // Note: publishStatus filter is commented out until migration is run
      const conditions = [
        eq(video.transcodingStatus, "ready"),
        // sql`(${video.publishStatus} = 'published' OR ${video.publishStatus} IS NULL)`,
      ];

      if (input.userId) {
        conditions.push(eq(video.idUser, input.userId));
      }

      if (input.subscriptionId) {
        conditions.push(eq(video.idSubscription, input.subscriptionId));
      }

      if (input.status) {
        conditions.shift(); // Remove the default "ready" condition (first item)
        conditions.unshift(eq(video.transcodingStatus, input.status));
      }

      // Load current user's follows/subscriptions for filtering and UI state
      if (input.feedType === "following" && currentUserId) {
        const [followedUsers, followedSubscriptions] = await Promise.all([
          db
            .select({ idUserLeader: follower.idUserLeader })
            .from(follower)
            .where(
              and(
                eq(follower.idUserFollower, currentUserId),
                eq(follower.isActive, 1),
              ),
            ),
          db
            .select({ idSubscription: userSubscription.idSubscription })
            .from(userSubscription)
            .where(eq(userSubscription.idUser, currentUserId)),
        ]);

        followedUserIds = followedUsers.map((f) => f.idUserLeader);
        followedSubscriptionIds = followedSubscriptions.map(
          (s) => s.idSubscription,
        );

        if (
          followedUserIds.length === 0 &&
          followedSubscriptionIds.length === 0
        ) {
          // User doesn't follow anyone/subscriptions, return empty list
          return {
            muxEnabled: isMuxEnabled(),
            items: [],
            nextCursor: null,
            nextVideoId: null,
            feedType: input.feedType,
          };
        }

        if (followedUserIds.length > 0 && followedSubscriptionIds.length > 0) {
          const followCondition = or(
            inArray(video.idUser, followedUserIds),
            inArray(video.idSubscription, followedSubscriptionIds),
          );
          if (followCondition) {
            conditions.push(followCondition);
          }
        } else if (followedUserIds.length > 0) {
          conditions.push(inArray(video.idUser, followedUserIds));
        } else if (followedSubscriptionIds.length > 0) {
          conditions.push(
            inArray(video.idSubscription, followedSubscriptionIds),
          );
        }
      } else if (currentUserId) {
        // Used to set "isFollowing" state on For You cards with subscription creators
        const followedSubscriptions = await db
          .select({ idSubscription: userSubscription.idSubscription })
          .from(userSubscription)
          .where(eq(userSubscription.idUser, currentUserId));
        followedSubscriptionIds = followedSubscriptions.map(
          (s) => s.idSubscription,
        );
      }

      if (input.cursor) {
        conditions.push(lt(video.id, input.cursor));
      }

      // Build the query with uploader and influencer-page joins
      const videos = await db
        .select({
          id: video.id,
          idUser: video.idUser,
          idSubscription: video.idSubscription,
          caption: video.caption,
          s3Key: video.s3Key,
          s3Url: video.s3Url,
          s3Status: video.s3Status,
          muxAssetId: video.muxAssetId,
          muxUploadId: video.muxUploadId,
          playbackId: video.playbackId,
          transcodingStatus: video.transcodingStatus,
          duration: video.duration,
          aspectRatio: video.aspectRatio,
          thumbnailUrl: video.thumbnailUrl,
          width: video.width,
          height: video.height,
          fileSize: video.fileSize,
          likeCount: video.likeCount,
          commentCount: video.commentCount,
          viewCount: video.viewCount,
          shareCount: video.shareCount,
          allowSharing: video.allowSharing,
          createdAt: video.createdAt,
          updatedAt: video.updatedAt,
          // Uploader info
          userName:
            sql<string>`CONCAT(${user.firstName}, ' ', COALESCE(${user.lastName}, ''))`.as(
              "userName",
            ),
          userImage: user.image,
          userIsInfluencer: user.isInfluencer,
          // Influencer page info from the subscribed feed
          influencerPageId: influencerPage.id,
          influencerPageTitle: influencerPage.title,
          influencerPageImage: influencerPage.image,
        })
        .from(video)
        .innerJoin(user, eq(video.idUser, user.id))
        .leftJoin(
          influencerPage,
          eq(video.idSubscription, influencerPage.idSubscription),
        )
        .where(and(...conditions))
        .orderBy(desc(video.id))
        .limit(input.limit + 1);

      const hasMore = videos.length > input.limit;
      const items = hasMore ? videos.slice(0, input.limit) : videos;
      const nextVideoId = hasMore ? (videos[input.limit]?.id ?? null) : null;
      const nextCursor = hasMore ? (items[items.length - 1]?.id ?? null) : null;

      // Check if user has liked each video
      let likedVideoIds: number[] = [];
      if (currentUserId && items.length > 0) {
        const likes = await db
          .select({ idVideo: videoLike.idVideo })
          .from(videoLike)
          .where(
            and(
              eq(videoLike.idUser, currentUserId),
              sql`${videoLike.idVideo} IN (${sql.join(
                items.map((v: { id: number }) => sql`${v.id}`),
                sql`, `,
              )})`,
            ),
          );
        likedVideoIds = likes.map((l: { idVideo: number }) => l.idVideo);
      }

      // Check if user has shared each video
      let sharedVideoIds: number[] = [];
      if (currentUserId && items.length > 0) {
        const shares = await db
          .select({ idVideo: videoShare.idVideo })
          .from(videoShare)
          .where(
            and(
              eq(videoShare.idUser, currentUserId),
              sql`${videoShare.idVideo} IN (${sql.join(
                items.map((v: { id: number }) => sql`${v.id}`),
                sql`, `,
              )})`,
            ),
          );
        sharedVideoIds = shares.map((s: { idVideo: number }) => s.idVideo);
      }

      // Get user's reactions for each video
      let userReactions: { idVideo: number; idReaction: number }[] = [];
      if (currentUserId && items.length > 0) {
        userReactions = await db
          .select({
            idVideo: videoReaction.idVideo,
            idReaction: videoReaction.idReaction,
          })
          .from(videoReaction)
          .where(
            and(
              eq(videoReaction.idUser, currentUserId),
              sql`${videoReaction.idVideo} IN (${sql.join(
                items.map((v: { id: number }) => sql`${v.id}`),
                sql`, `,
              )})`,
            ),
          );
      }

      // Get reaction counts per video
      let reactionCounts: {
        idVideo: number;
        idReaction: number;
        count: number;
      }[] = [];
      if (items.length > 0) {
        reactionCounts = await db
          .select({
            idVideo: videoReaction.idVideo,
            idReaction: videoReaction.idReaction,
            count: sql<number>`COUNT(*)`.as("count"),
          })
          .from(videoReaction)
          .where(
            sql`${videoReaction.idVideo} IN (${sql.join(
              items.map((v: { id: number }) => sql`${v.id}`),
              sql`, `,
            )})`,
          )
          .groupBy(videoReaction.idVideo, videoReaction.idReaction);
      }

      const muxEnabled = isMuxEnabled();

      return {
        muxEnabled,
        items: items.map((v) => {
          const userReaction = userReactions.find((r) => r.idVideo === v.id);
          const videoReactionCounts = reactionCounts
            .filter((r) => r.idVideo === v.id)
            .map((r) => ({
              id: String(r.idReaction),
              cnt: r.count,
            }));
          const creatorId = v.idUser;
          const creatorName =
            v.idSubscription && v.influencerPageTitle
              ? v.influencerPageTitle.trim()
              : v.userName.trim();
          const creatorImage =
            v.idSubscription && v.influencerPageImage
              ? v.influencerPageImage
              : v.userImage;
          const creatorIsInfluencer =
            v.idSubscription && v.influencerPageId
              ? true
              : v.userIsInfluencer === 1;
          const isFollowingBySubscription = v.idSubscription
            ? followedSubscriptionIds.includes(v.idSubscription)
            : false;
          const isFollowingByUser = followedUserIds.includes(v.idUser);

          return {
            id: v.id,
            userId: v.idUser,
            caption: v.caption,
            s3Key: v.s3Key,
            s3Url: v.s3Url,
            s3Status: v.s3Status as
              | "pending"
              | "uploading"
              | "uploaded"
              | "failed",
            muxAssetId: v.muxAssetId,
            muxUploadId: v.muxUploadId,
            playbackId: v.playbackId,
            transcodingStatus: v.transcodingStatus as
              | "pending"
              | "processing"
              | "ready"
              | "errored",
            duration: v.duration,
            aspectRatio: v.aspectRatio,
            thumbnailUrl: v.thumbnailUrl,
            width: v.width,
            height: v.height,
            fileSize: v.fileSize,
            likeCount: v.likeCount ?? 0,
            commentCount: v.commentCount ?? 0,
            shareCount: v.shareCount ?? 0,
            allowSharing: v.allowSharing === 1,
            isLiked: likedVideoIds.includes(v.id),
            isShared: sharedVideoIds.includes(v.id),
            isFollowing: isFollowingBySubscription || isFollowingByUser,
            userReactionId: userReaction?.idReaction ?? null,
            reactions: videoReactionCounts,
            // Use Mux playback URL if available, fallback to S3 URL
            playbackUrl: v.playbackId ? getPlaybackUrl(v.playbackId) : v.s3Url,
            creator: {
              id: creatorId,
              name: creatorName,
              image: creatorImage,
              isVerified: false, // TODO: Add verification status
              isInfluencer: creatorIsInfluencer,
              subscriptionId: v.idSubscription,
            },
            createdAt: v.createdAt,
            updatedAt: v.updatedAt,
          };
        }),
        nextCursor,
        nextVideoId,
        feedType: input.feedType,
      };
    }),

  /**
   * Get a single video by ID
   */
  getById: protectedProcedure
    .input(GetVideoByIdSchema)
    .query(async ({ ctx, input }) => {
      const currentUserId = Number(ctx.session.user.id);

      const [videoRecord] = await db
        .select({
          id: video.id,
          idUser: video.idUser,
          idSubscription: video.idSubscription,
          caption: video.caption,
          s3Key: video.s3Key,
          s3Url: video.s3Url,
          s3Status: video.s3Status,
          muxAssetId: video.muxAssetId,
          muxUploadId: video.muxUploadId,
          playbackId: video.playbackId,
          transcodingStatus: video.transcodingStatus,
          duration: video.duration,
          aspectRatio: video.aspectRatio,
          thumbnailUrl: video.thumbnailUrl,
          width: video.width,
          height: video.height,
          fileSize: video.fileSize,
          likeCount: video.likeCount,
          commentCount: video.commentCount,
          viewCount: video.viewCount,
          createdAt: video.createdAt,
          updatedAt: video.updatedAt,
          userName:
            sql<string>`CONCAT(${user.firstName}, ' ', COALESCE(${user.lastName}, ''))`.as(
              "userName",
            ),
          userImage: user.image,
          userIsInfluencer: user.isInfluencer,
          influencerPageId: influencerPage.id,
          influencerPageTitle: influencerPage.title,
          influencerPageImage: influencerPage.image,
        })
        .from(video)
        .innerJoin(user, eq(video.idUser, user.id))
        .leftJoin(
          influencerPage,
          eq(video.idSubscription, influencerPage.idSubscription),
        )
        .where(eq(video.id, input.id));

      if (!videoRecord) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found",
        });
      }

      // Check if current user liked this video
      let isLiked = false;
      if (currentUserId) {
        const [like] = await db
          .select()
          .from(videoLike)
          .where(
            and(
              eq(videoLike.idVideo, input.id),
              eq(videoLike.idUser, currentUserId),
            ),
          );
        isLiked = !!like;
      }

      const creatorId = videoRecord.idUser;
      const creatorName =
        videoRecord.idSubscription && videoRecord.influencerPageTitle
          ? videoRecord.influencerPageTitle.trim()
          : videoRecord.userName.trim();
      const creatorImage =
        videoRecord.idSubscription && videoRecord.influencerPageImage
          ? videoRecord.influencerPageImage
          : videoRecord.userImage;
      const creatorIsInfluencer =
        videoRecord.idSubscription && videoRecord.influencerPageId
          ? true
          : videoRecord.userIsInfluencer === 1;

      return {
        id: videoRecord.id,
        userId: videoRecord.idUser,
        caption: videoRecord.caption,
        s3Key: videoRecord.s3Key,
        s3Url: videoRecord.s3Url,
        s3Status: videoRecord.s3Status as
          | "pending"
          | "uploading"
          | "uploaded"
          | "failed",
        muxAssetId: videoRecord.muxAssetId,
        muxUploadId: videoRecord.muxUploadId,
        playbackId: videoRecord.playbackId,
        transcodingStatus: videoRecord.transcodingStatus as
          | "pending"
          | "processing"
          | "ready"
          | "errored",
        duration: videoRecord.duration,
        aspectRatio: videoRecord.aspectRatio,
        thumbnailUrl: videoRecord.thumbnailUrl,
        width: videoRecord.width,
        height: videoRecord.height,
        fileSize: videoRecord.fileSize,
        likeCount: videoRecord.likeCount ?? 0,
        commentCount: videoRecord.commentCount ?? 0,
        isLiked,
        muxEnabled: isMuxEnabled(),
        // Use Mux playback URL if available, fallback to S3 URL
        playbackUrl: videoRecord.playbackId
          ? getPlaybackUrl(videoRecord.playbackId)
          : videoRecord.s3Url,
        creator: {
          id: creatorId,
          name: creatorName,
          image: creatorImage,
          isVerified: false,
          isInfluencer: creatorIsInfluencer,
          subscriptionId: videoRecord.idSubscription,
        },
        createdAt: videoRecord.createdAt,
        updatedAt: videoRecord.updatedAt,
      };
    }),

  /**
   * Get provider-specific playback and thumbnail sources for server-side proxying.
   * This is intended for Next.js route handlers, not direct client playback.
   */
  getPlaybackSource: protectedProcedure
    .input(GetVideoByIdSchema)
    .query(async ({ input }) => {
      const [videoRecord] = await db
        .select({
          id: video.id,
          s3Url: video.s3Url,
          playbackId: video.playbackId,
          transcodingStatus: video.transcodingStatus,
          thumbnailUrl: video.thumbnailUrl,
        })
        .from(video)
        .where(eq(video.id, input.id));

      if (!videoRecord) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found",
        });
      }

      return {
        id: videoRecord.id,
        playbackId: videoRecord.playbackId,
        transcodingStatus: videoRecord.transcodingStatus as
          | "pending"
          | "processing"
          | "ready"
          | "errored",
        hlsUrl: videoRecord.playbackId
          ? getUnifiedPlaybackUrl(videoRecord.playbackId)
          : null,
        mp4Url: videoRecord.s3Url,
        thumbnailUrl:
          videoRecord.thumbnailUrl ??
          (videoRecord.playbackId
            ? getUnifiedThumbnailUrl(videoRecord.playbackId)
            : null),
      };
    }),

  /**
   * Like/unlike a video
   */
  toggleLike: protectedProcedure
    .input(GetVideoByIdSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = Number(ctx.session.user.id);

      // Check if already liked
      const [existingLike] = await db
        .select()
        .from(videoLike)
        .where(
          and(eq(videoLike.idVideo, input.id), eq(videoLike.idUser, userId)),
        );

      const now = new Date().toISOString().slice(0, 19).replace("T", " ");

      if (existingLike) {
        // Unlike
        await db
          .delete(videoLike)
          .where(
            and(eq(videoLike.idVideo, input.id), eq(videoLike.idUser, userId)),
          );

        // Decrement like count
        await db
          .update(video)
          .set({
            likeCount: sql`${video.likeCount} - 1`,
            updatedAt: now,
          })
          .where(eq(video.id, input.id));

        return { liked: false };
      } else {
        // Like
        await db.insert(videoLike).values({
          idVideo: input.id,
          idUser: userId,
          createdAt: now,
        });

        // Increment like count
        await db
          .update(video)
          .set({
            likeCount: sql`${video.likeCount} + 1`,
            updatedAt: now,
          })
          .where(eq(video.id, input.id));

        return { liked: true };
      }
    }),

  /**
   * Set a reaction on a video (replaces any existing reaction)
   * Supports 6 reaction types: 1=like, 2=dislike, 3=laugh, 4=love, 5=fire, 6=disgust
   */
  setReaction: protectedProcedure
    .input(SetReactionSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = Number(ctx.session.user.id);
      const now = new Date().toISOString().slice(0, 19).replace("T", " ");

      // Check for existing reaction
      const [existing] = await db
        .select()
        .from(videoReaction)
        .where(
          and(
            eq(videoReaction.idVideo, input.videoId),
            eq(videoReaction.idUser, userId),
          ),
        );

      if (existing) {
        if (existing.idReaction === input.reactionId) {
          // Same reaction - remove it (toggle off)
          await db
            .delete(videoReaction)
            .where(
              and(
                eq(videoReaction.idVideo, input.videoId),
                eq(videoReaction.idUser, userId),
              ),
            );

          // Decrement like count (we track total reactions in likeCount for backwards compat)
          await db
            .update(video)
            .set({
              likeCount: sql`GREATEST(${video.likeCount} - 1, 0)`,
              updatedAt: now,
            })
            .where(eq(video.id, input.videoId));

          return { reactionId: null, removed: true };
        }

        // Different reaction - update it
        await db
          .update(videoReaction)
          .set({ idReaction: input.reactionId, createdAt: now })
          .where(
            and(
              eq(videoReaction.idVideo, input.videoId),
              eq(videoReaction.idUser, userId),
            ),
          );

        return { reactionId: input.reactionId, removed: false };
      }

      // No existing reaction - insert new
      await db.insert(videoReaction).values({
        idVideo: input.videoId,
        idUser: userId,
        idReaction: input.reactionId,
        createdAt: now,
      });

      // Also insert into videoLike for backwards compatibility if reaction is "like" (1) or "love" (4)
      if (input.reactionId === 1 || input.reactionId === 4) {
        try {
          await db.insert(videoLike).values({
            idVideo: input.videoId,
            idUser: userId,
            createdAt: now,
          });
        } catch {
          // Ignore duplicate
        }
      }

      // Increment like count
      await db
        .update(video)
        .set({
          likeCount: sql`${video.likeCount} + 1`,
          updatedAt: now,
        })
        .where(eq(video.id, input.videoId));

      return { reactionId: input.reactionId, removed: false };
    }),

  /**
   * Remove reaction from a video
   */
  removeReaction: protectedProcedure
    .input(RemoveReactionSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = Number(ctx.session.user.id);
      const now = new Date().toISOString().slice(0, 19).replace("T", " ");

      const [existing] = await db
        .select()
        .from(videoReaction)
        .where(
          and(
            eq(videoReaction.idVideo, input.videoId),
            eq(videoReaction.idUser, userId),
          ),
        );

      if (!existing) {
        return { removed: false };
      }

      await db
        .delete(videoReaction)
        .where(
          and(
            eq(videoReaction.idVideo, input.videoId),
            eq(videoReaction.idUser, userId),
          ),
        );

      // Also remove from videoLike for backwards compat
      await db
        .delete(videoLike)
        .where(
          and(
            eq(videoLike.idVideo, input.videoId),
            eq(videoLike.idUser, userId),
          ),
        );

      // Decrement like count
      await db
        .update(video)
        .set({
          likeCount: sql`GREATEST(${video.likeCount} - 1, 0)`,
          updatedAt: now,
        })
        .where(eq(video.id, input.videoId));

      return { removed: true };
    }),

  /**
   * Get reaction counts for a video
   */
  getReactions: protectedProcedure
    .input(GetVideoByIdSchema)
    .query(async ({ ctx, input }) => {
      const userId = Number(ctx.session.user.id);

      // Get all reactions for this video grouped by type
      const reactionCounts = await db
        .select({
          idReaction: videoReaction.idReaction,
          count: sql<number>`COUNT(*)`.as("count"),
        })
        .from(videoReaction)
        .where(eq(videoReaction.idVideo, input.id))
        .groupBy(videoReaction.idReaction);

      // Get current user's reaction
      const [userReaction] = await db
        .select({ idReaction: videoReaction.idReaction })
        .from(videoReaction)
        .where(
          and(
            eq(videoReaction.idVideo, input.id),
            eq(videoReaction.idUser, userId),
          ),
        );

      return {
        reactions: reactionCounts.map((r) => ({
          id: String(r.idReaction),
          cnt: r.count,
        })),
        userReactionId: userReaction?.idReaction ?? null,
      };
    }),

  /**
   * Record a video view
   */
  recordView: protectedProcedure
    .input(
      z.object({
        videoId: z.number(),
        watchDuration: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = Number(ctx.session.user.id);
      const now = new Date().toISOString().slice(0, 19).replace("T", " ");

      const [videoRecord] = await db
        .select({ idUser: video.idUser })
        .from(video)
        .where(eq(video.id, input.videoId));
      if (!videoRecord) {
        return { success: false };
      }

      if (videoRecord.idUser === userId) {
        return { success: true };
      }

      await db.insert(videoView).values({
        idVideo: input.videoId,
        idUser: userId,
        watchDuration: input.watchDuration ?? null,
        createdAt: now,
      });

      // Increment view count
      await db
        .update(video)
        .set({
          viewCount: sql`${video.viewCount} + 1`,
          updatedAt: now,
        })
        .where(eq(video.id, input.videoId));

      return { success: true };
    }),

  /**
   * Delete a video (owner only)
   */
  delete: protectedProcedure
    .input(DeleteVideoSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = Number(ctx.session.user.id);

      // Verify ownership
      const [existingVideo] = await db
        .select()
        .from(video)
        .where(and(eq(video.id, input.id), eq(video.idUser, userId)));

      if (!existingVideo) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found or you don't have permission to delete it",
        });
      }

      // Delete from S3
      if (existingVideo.s3Key) {
        try {
          await deleteFromS3(existingVideo.s3Key);
        } catch (error) {
          console.error("Error deleting from S3:", error);
        }
      }

      const customThumbnailKey = resolveCustomThumbnailKey(
        existingVideo.thumbnailUrl,
      );
      if (customThumbnailKey) {
        try {
          await deleteFromS3(customThumbnailKey);
        } catch (error) {
          console.error("Error deleting thumbnail from S3:", error);
        }
      }

      // Delete from Mux (if Mux asset exists)
      if (existingVideo.muxAssetId) {
        try {
          await deleteVideoAsset(existingVideo.muxAssetId);
        } catch (error) {
          console.error("Error deleting from Mux:", error);
        }
      }

      // Delete from Bunny (if Bunny video exists and provider is Bunny)
      // For Bunny, the playbackId is the Bunny video GUID
      const provider = getActiveVideoProvider();
      if (
        provider === "bunny" &&
        existingVideo.playbackId &&
        !existingVideo.muxAssetId
      ) {
        try {
          await deleteBunnyVideo(existingVideo.playbackId);
        } catch (error) {
          console.error("Error deleting from Bunny:", error);
        }
      }

      // Delete from database (cascades to likes and views)
      await db.delete(video).where(eq(video.id, input.id));

      return { success: true };
    }),

  /**
   * Update video status (called by webhook or polling)
   * Supports both Mux (via muxAssetId) and Bunny (via bunnyVideoId/playbackId)
   */
  updateTranscodingStatus: protectedProcedure
    .input(UpdateVideoStatusSchema)
    .mutation(async ({ input }) => {
      const now = new Date().toISOString().slice(0, 19).replace("T", " ");

      // Determine which identifier to use for the update
      const whereCondition = input.muxAssetId
        ? eq(video.muxAssetId, input.muxAssetId)
        : input.bunnyVideoId
          ? eq(video.playbackId, input.bunnyVideoId)
          : null;

      if (!whereCondition) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Either muxAssetId or bunnyVideoId is required",
        });
      }

      const [existingVideo] = await db
        .select({
          id: video.id,
          thumbnailUrl: video.thumbnailUrl,
        })
        .from(video)
        .where(whereCondition);

      if (!existingVideo) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found",
        });
      }

      // Determine thumbnail URL based on provider
      let thumbnailUrl = input.thumbnailUrl;
      if (!thumbnailUrl && input.playbackId) {
        if (input.muxAssetId) {
          // Mux thumbnail
          thumbnailUrl = `https://image.mux.com/${input.playbackId}/thumbnail.jpg`;
        } else if (input.bunnyVideoId) {
          // Bunny thumbnail - will be set by the service
          thumbnailUrl = getBunnyThumbnailUrl(input.bunnyVideoId);
        }
      }

      if (isCustomThumbnailUrl(existingVideo.thumbnailUrl)) {
        thumbnailUrl = existingVideo.thumbnailUrl;
      }

      await db
        .update(video)
        .set({
          transcodingStatus: input.status,
          playbackId: input.playbackId ?? undefined,
          duration: input.duration ?? undefined,
          aspectRatio: input.aspectRatio ?? undefined,
          width: input.width ?? undefined,
          height: input.height ?? undefined,
          thumbnailUrl,
          updatedAt: now,
        })
        .where(whereCondition);

      return { success: true };
    }),

  /**
   * Handle Bunny Stream webhook callbacks
   * Called by Bunny when video status changes
   *
   * Webhook statuses:
   * - 0: Queued
   * - 1: Processing
   * - 2: Encoding
   * - 3: Finished
   * - 4: Resolution finished
   * - 5: Failed
   * - 6-8: Presigned upload states
   * - 9: Captions generated
   * - 10: Title/description generated
   */
  handleBunnyWebhook: publicProcedure
    .input(BunnyWebhookSchema)
    .mutation(async ({ input }) => {
      const now = new Date().toISOString().slice(0, 19).replace("T", " ");
      const videoGuid = input.VideoGuid;
      const status = input.Status as BunnyWebhookStatus;

      // Find the video by Bunny video ID (stored in playbackId)
      const [existingVideo] = await db
        .select()
        .from(video)
        .where(eq(video.playbackId, videoGuid));

      if (!existingVideo) {
        console.warn(`Bunny webhook: Video not found for GUID ${videoGuid}`);
        return { success: false, message: "Video not found" };
      }

      const update = await buildBunnyWebhookUpdate(videoGuid, status);
      const updatePayload: Partial<typeof video.$inferInsert> = {
        updatedAt: now,
        ...buildVideoUpdatePayload(update),
      };

      if (isCustomThumbnailUrl(existingVideo.thumbnailUrl)) {
        delete updatePayload.thumbnailUrl;
      }

      await db
        .update(video)
        .set(updatePayload)
        .where(eq(video.playbackId, videoGuid));

      return { success: true, status: update.transcodingStatus };
    }),

  /**
   * Upload video to Bunny Stream using HTTP API (server-side proxy)
   * Used when BUNNY_USE_TUS=false
   *
   * This endpoint receives the video file from the client and uploads it to Bunny.
   * The client should use FormData with a 'file' field containing the video.
   *
   * @see https://docs.bunny.net/stream/http-api
   */
  uploadBunnyHttp: protectedProcedure
    .input(
      z.object({
        videoId: z.number(),
        bunnyVideoId: z.string(),
        // Video data as base64 (for tRPC compatibility)
        // In production, you might want to use a separate HTTP endpoint for file uploads
        videoDataBase64: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = Number(ctx.session.user.id);

      // Verify ownership
      const [existingVideo] = await db
        .select()
        .from(video)
        .where(and(eq(video.id, input.videoId), eq(video.idUser, userId)));

      if (!existingVideo) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found",
        });
      }

      // Verify the Bunny video ID matches
      if (existingVideo.playbackId !== input.bunnyVideoId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Bunny video ID mismatch",
        });
      }

      // Verify Bunny HTTP mode is enabled
      if (!isBunnyEnabled() || isBunnyTusEnabled()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Bunny HTTP upload is not enabled. Set BUNNY_USE_TUS=false",
        });
      }

      try {
        // Convert base64 to Buffer
        const videoBuffer = Buffer.from(input.videoDataBase64, "base64");

        // Upload to Bunny using HTTP API
        const result = await uploadBunnyVideoHttp(
          input.bunnyVideoId,
          videoBuffer,
        );

        // Update video status to processing
        const now = new Date().toISOString().slice(0, 19).replace("T", " ");
        await db
          .update(video)
          .set({
            transcodingStatus: "processing",
            updatedAt: now,
          })
          .where(eq(video.id, input.videoId));

        return {
          success: result.success,
          message: result.message,
        };
      } catch (error) {
        console.error("Error uploading to Bunny:", error);

        // Update video status to errored
        const now = new Date().toISOString().slice(0, 19).replace("T", " ");
        await db
          .update(video)
          .set({
            transcodingStatus: "errored",
            updatedAt: now,
          })
          .where(eq(video.id, input.videoId));

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to upload video to Bunny",
        });
      }
    }),

  // ============================================
  // Video Sharing (Repost) Endpoints
  // ============================================

  /**
   * Share (repost) a video to your followers
   */
  share: protectedProcedure
    .input(
      z.object({
        videoId: z.number(),
        caption: z.string().max(500).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = Number(ctx.session.user.id);

      // Get the video to verify it exists and check shareability
      const [videoRecord] = await db
        .select()
        .from(video)
        .where(eq(video.id, input.videoId));

      if (!videoRecord) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found",
        });
      }

      // Check if sharing is allowed
      if (videoRecord.allowSharing === 0) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Sharing is disabled for this video",
        });
      }

      // Can't share your own video
      // if (videoRecord.idUser === userId) {
      //   throw new TRPCError({
      //     code: "BAD_REQUEST",
      //     message: "You cannot share your own video",
      //   });
      // }

      // Check if already shared
      const [existingShare] = await db
        .select()
        .from(videoShare)
        .where(
          and(
            eq(videoShare.idVideo, input.videoId),
            eq(videoShare.idUser, userId),
          ),
        );

      if (existingShare) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "You have already shared this video",
        });
      }

      const now = new Date().toISOString().slice(0, 19).replace("T", " ");

      // Create share record
      await db.insert(videoShare).values({
        idVideo: input.videoId,
        idUser: userId,
        idOriginalUser: videoRecord.idUser,
        caption: input.caption ?? null,
        createdAt: now,
      });

      // Increment share count on video
      await db
        .update(video)
        .set({
          shareCount: sql`${video.shareCount} + 1`,
          updatedAt: now,
        })
        .where(eq(video.id, input.videoId));

      return { success: true, shared: true };
    }),

  /**
   * Remove a share (unshare/unrepost)
   */
  unshare: protectedProcedure
    .input(
      z.object({
        videoId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = Number(ctx.session.user.id);

      // Check if share exists
      const [existingShare] = await db
        .select()
        .from(videoShare)
        .where(
          and(
            eq(videoShare.idVideo, input.videoId),
            eq(videoShare.idUser, userId),
          ),
        );

      if (!existingShare) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Share not found",
        });
      }

      const now = new Date().toISOString().slice(0, 19).replace("T", " ");

      // Delete share record
      await db
        .delete(videoShare)
        .where(
          and(
            eq(videoShare.idVideo, input.videoId),
            eq(videoShare.idUser, userId),
          ),
        );

      // Decrement share count on video
      await db
        .update(video)
        .set({
          shareCount: sql`GREATEST(${video.shareCount} - 1, 0)`,
          updatedAt: now,
        })
        .where(eq(video.id, input.videoId));

      return { success: true, shared: false };
    }),

  /**
   * Toggle video shareability (creator control)
   */
  toggleShareability: protectedProcedure
    .input(
      z.object({
        videoId: z.number(),
        allowSharing: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = Number(ctx.session.user.id);

      // Verify ownership
      const [videoRecord] = await db
        .select()
        .from(video)
        .where(and(eq(video.id, input.videoId), eq(video.idUser, userId)));

      if (!videoRecord) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found or you don't have permission",
        });
      }

      const now = new Date().toISOString().slice(0, 19).replace("T", " ");

      await db
        .update(video)
        .set({
          allowSharing: input.allowSharing ? 1 : 0,
          updatedAt: now,
        })
        .where(eq(video.id, input.videoId));

      return { success: true, allowSharing: input.allowSharing };
    }),

  /**
   * Get videos shared by a user (for profile shares tab)
   */
  getSharesByUser: protectedProcedure
    .input(
      z.object({
        userId: z.number().optional(),
        limit: z.number().min(1).max(50).default(20),
        cursor: z.number().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const targetUserId = input.userId ?? Number(ctx.session.user.id);

      if (!targetUserId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User ID required",
        });
      }

      const currentUserId = Number(ctx.session.user.id);

      // Get shares with video and user info
      const shares = await db
        .select({
          shareId: videoShare.id,
          shareCaption: videoShare.caption,
          shareCreatedAt: videoShare.createdAt,
          // Video info
          videoId: video.id,
          videoCaption: video.caption,
          videoS3Url: video.s3Url,
          videoPlaybackId: video.playbackId,
          videoThumbnailUrl: video.thumbnailUrl,
          videoDuration: video.duration,
          videoLikeCount: video.likeCount,
          videoCommentCount: video.commentCount,
          videoShareCount: video.shareCount,
          videoCreatedAt: video.createdAt,
          // Original creator info
          originalUserId: user.id,
          originalUserName:
            sql<string>`CONCAT(${user.firstName}, ' ', COALESCE(${user.lastName}, ''))`.as(
              "originalUserName",
            ),
          originalUserImage: user.image,
          originalUserIsInfluencer: user.isInfluencer,
        })
        .from(videoShare)
        .innerJoin(video, eq(videoShare.idVideo, video.id))
        .innerJoin(user, eq(video.idUser, user.id))
        .where(eq(videoShare.idUser, targetUserId))
        .orderBy(desc(videoShare.createdAt))
        .limit(input.limit + 1)
        .offset(input.cursor ? (input.cursor - 1) * input.limit : 0);

      // Check if current user has liked these videos
      let likedVideoIds: number[] = [];
      if (currentUserId && shares.length > 0) {
        const videoIds = shares.map((s) => s.videoId);
        const likes = await db
          .select({ idVideo: videoLike.idVideo })
          .from(videoLike)
          .where(
            and(
              eq(videoLike.idUser, currentUserId),
              sql`${videoLike.idVideo} IN (${sql.join(
                videoIds.map((id) => sql`${id}`),
                sql`, `,
              )})`,
            ),
          );
        likedVideoIds = likes.map((l) => l.idVideo);
      }

      // Check if current user has shared these videos
      let sharedVideoIds: number[] = [];
      if (currentUserId && shares.length > 0) {
        const videoIds = shares.map((s) => s.videoId);
        const userShares = await db
          .select({ idVideo: videoShare.idVideo })
          .from(videoShare)
          .where(
            and(
              eq(videoShare.idUser, currentUserId),
              sql`${videoShare.idVideo} IN (${sql.join(
                videoIds.map((id) => sql`${id}`),
                sql`, `,
              )})`,
            ),
          );
        sharedVideoIds = userShares.map((s) => s.idVideo);
      }

      const hasMore = shares.length > input.limit;
      const items = hasMore ? shares.slice(0, -1) : shares;

      const muxEnabled = isMuxEnabled();

      return {
        items: items.map((s) => ({
          shareId: s.shareId,
          shareCaption: s.shareCaption,
          shareCreatedAt: s.shareCreatedAt,
          video: {
            id: s.videoId,
            caption: s.videoCaption,
            playbackUrl: s.videoPlaybackId
              ? getPlaybackUrl(s.videoPlaybackId)
              : s.videoS3Url,
            thumbnailUrl: s.videoThumbnailUrl,
            duration: s.videoDuration,
            likeCount: s.videoLikeCount ?? 0,
            commentCount: s.videoCommentCount ?? 0,
            shareCount: s.videoShareCount ?? 0,
            isLiked: likedVideoIds.includes(s.videoId),
            isShared: sharedVideoIds.includes(s.videoId),
            createdAt: s.videoCreatedAt,
            creator: {
              id: s.originalUserId,
              name: s.originalUserName.trim(),
              image: s.originalUserImage,
              isInfluencer: s.originalUserIsInfluencer === 1,
            },
          },
        })),
        nextCursor: hasMore ? (input.cursor ?? 1) + 1 : null,
        muxEnabled,
      };
    }),

  /**
   * Get users who shared a specific video
   */
  getSharesOfVideo: protectedProcedure
    .input(
      z.object({
        videoId: z.number(),
        limit: z.number().min(1).max(50).default(20),
        cursor: z.number().nullish(),
      }),
    )
    .query(async ({ input }) => {
      const shares = await db
        .select({
          shareId: videoShare.id,
          shareCaption: videoShare.caption,
          shareCreatedAt: videoShare.createdAt,
          userId: user.id,
          userName:
            sql<string>`CONCAT(${user.firstName}, ' ', COALESCE(${user.lastName}, ''))`.as(
              "userName",
            ),
          userImage: user.image,
          userIsInfluencer: user.isInfluencer,
        })
        .from(videoShare)
        .innerJoin(user, eq(videoShare.idUser, user.id))
        .where(eq(videoShare.idVideo, input.videoId))
        .orderBy(desc(videoShare.createdAt))
        .limit(input.limit + 1)
        .offset(input.cursor ? (input.cursor - 1) * input.limit : 0);

      const hasMore = shares.length > input.limit;
      const items = hasMore ? shares.slice(0, -1) : shares;

      return {
        items: items.map((s) => ({
          shareId: s.shareId,
          caption: s.shareCaption,
          createdAt: s.shareCreatedAt,
          user: {
            id: s.userId,
            name: s.userName.trim(),
            image: s.userImage,
            isInfluencer: s.userIsInfluencer === 1,
          },
        })),
        nextCursor: hasMore ? (input.cursor ?? 1) + 1 : null,
      };
    }),

  /**
   * Check if user has shared a video
   */
  hasShared: protectedProcedure
    .input(
      z.object({
        videoId: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = Number(ctx.session.user.id);

      const [existingShare] = await db
        .select()
        .from(videoShare)
        .where(
          and(
            eq(videoShare.idVideo, input.videoId),
            eq(videoShare.idUser, userId),
          ),
        );

      return { hasShared: !!existingShare };
    }),

  // ============================================
  // Video Comments Endpoints
  // ============================================

  /**
   * Create a comment on a video
   */
  createComment: protectedProcedure
    .input(
      z.object({
        videoId: z.number(),
        content: z.string().min(1).max(1000),
        parentId: z.number().optional(), // For replies
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = Number(ctx.session.user.id);

      // Verify video exists
      const [videoRecord] = await db
        .select({ id: video.id })
        .from(video)
        .where(eq(video.id, input.videoId));

      if (!videoRecord) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found",
        });
      }

      // If this is a reply, verify parent comment exists and belongs to same video
      if (input.parentId) {
        const [parentComment] = await db
          .select({ id: videoComment.id, idVideo: videoComment.idVideo })
          .from(videoComment)
          .where(eq(videoComment.id, input.parentId));

        if (!parentComment) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Parent comment not found",
          });
        }

        if (parentComment.idVideo !== input.videoId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Parent comment does not belong to this video",
          });
        }
      }

      const now = new Date().toISOString().slice(0, 19).replace("T", " ");

      // Insert comment
      const [result] = await db.insert(videoComment).values({
        idVideo: input.videoId,
        idUser: userId,
        idParent: input.parentId ?? null,
        content: input.content,
        createdAt: now,
      });

      const commentId = Number(result.insertId);

      // Update reply count on parent if this is a reply
      if (input.parentId) {
        await db
          .update(videoComment)
          .set({
            replyCount: sql`${videoComment.replyCount} + 1`,
            updatedAt: now,
          })
          .where(eq(videoComment.id, input.parentId));
      }

      // Update comment count on video
      await db
        .update(video)
        .set({
          commentCount: sql`${video.commentCount} + 1`,
          updatedAt: now,
        })
        .where(eq(video.id, input.videoId));

      // Get user info to return with comment
      const [userRecord] = await db
        .select({
          firstName: user.firstName,
          lastName: user.lastName,
          image: user.image,
          isInfluencer: user.isInfluencer,
        })
        .from(user)
        .where(eq(user.id, userId));

      return {
        id: commentId,
        videoId: input.videoId,
        userId,
        parentId: input.parentId ?? null,
        content: input.content,
        likeCount: 0,
        replyCount: 0,
        isPinned: false,
        isHearted: false,
        isLiked: false,
        createdAt: now,
        user: {
          id: userId,
          name: `${userRecord?.firstName ?? ""} ${userRecord?.lastName ?? ""}`.trim(),
          image: userRecord?.image ?? null,
          isInfluencer: userRecord?.isInfluencer === 1,
        },
      };
    }),

  /**
   * Get comments for a video with pagination
   */
  getComments: protectedProcedure
    .input(
      z.object({
        videoId: z.number(),
        limit: z.number().min(1).max(50).default(20),
        cursor: z.number().nullish(),
        sortBy: z.enum(["newest", "oldest", "popular"]).default("newest"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const currentUserId = Number(ctx.session.user.id);

      // Build order by based on sort
      const orderBy =
        input.sortBy === "oldest"
          ? videoComment.createdAt
          : input.sortBy === "popular"
            ? desc(videoComment.likeCount)
            : desc(videoComment.createdAt);

      // Get top-level comments only (no parent)
      const comments = await db
        .select({
          id: videoComment.id,
          idVideo: videoComment.idVideo,
          idUser: videoComment.idUser,
          idParent: videoComment.idParent,
          content: videoComment.content,
          likeCount: videoComment.likeCount,
          replyCount: videoComment.replyCount,
          isPinned: videoComment.isPinned,
          isHearted: videoComment.isHearted,
          createdAt: videoComment.createdAt,
          userName:
            sql<string>`CONCAT(${user.firstName}, ' ', COALESCE(${user.lastName}, ''))`.as(
              "userName",
            ),
          userImage: user.image,
          userIsInfluencer: user.isInfluencer,
        })
        .from(videoComment)
        .innerJoin(user, eq(videoComment.idUser, user.id))
        .where(
          and(
            eq(videoComment.idVideo, input.videoId),
            sql`${videoComment.idParent} IS NULL`,
          ),
        )
        .orderBy(desc(videoComment.isPinned), orderBy)
        .limit(input.limit + 1)
        .offset(input.cursor ? (input.cursor - 1) * input.limit : 0);

      // Check which comments current user has liked
      let likedCommentIds: number[] = [];
      if (currentUserId && comments.length > 0) {
        const likes = await db
          .select({ idComment: videoCommentLike.idComment })
          .from(videoCommentLike)
          .where(
            and(
              eq(videoCommentLike.idUser, currentUserId),
              sql`${videoCommentLike.idComment} IN (${sql.join(
                comments.map((c) => sql`${c.id}`),
                sql`, `,
              )})`,
            ),
          );
        likedCommentIds = likes.map((l) => l.idComment);
      }

      const hasMore = comments.length > input.limit;
      const items = hasMore ? comments.slice(0, -1) : comments;

      return {
        items: items.map((c) => ({
          id: c.id,
          videoId: c.idVideo,
          userId: c.idUser,
          parentId: c.idParent,
          content: c.content,
          likeCount: c.likeCount ?? 0,
          replyCount: c.replyCount ?? 0,
          isPinned: c.isPinned === 1,
          isHearted: c.isHearted === 1,
          isLiked: likedCommentIds.includes(c.id),
          createdAt: c.createdAt,
          user: {
            id: c.idUser,
            name: c.userName.trim(),
            image: c.userImage,
            isInfluencer: c.userIsInfluencer === 1,
          },
        })),
        nextCursor: hasMore ? (input.cursor ?? 1) + 1 : null,
      };
    }),

  /**
   * Get replies to a comment
   */
  getCommentReplies: protectedProcedure
    .input(
      z.object({
        commentId: z.number(),
        limit: z.number().min(1).max(50).default(10),
        cursor: z.number().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const currentUserId = Number(ctx.session.user.id);

      const replies = await db
        .select({
          id: videoComment.id,
          idVideo: videoComment.idVideo,
          idUser: videoComment.idUser,
          idParent: videoComment.idParent,
          content: videoComment.content,
          likeCount: videoComment.likeCount,
          replyCount: videoComment.replyCount,
          isPinned: videoComment.isPinned,
          isHearted: videoComment.isHearted,
          createdAt: videoComment.createdAt,
          userName:
            sql<string>`CONCAT(${user.firstName}, ' ', COALESCE(${user.lastName}, ''))`.as(
              "userName",
            ),
          userImage: user.image,
          userIsInfluencer: user.isInfluencer,
        })
        .from(videoComment)
        .innerJoin(user, eq(videoComment.idUser, user.id))
        .where(eq(videoComment.idParent, input.commentId))
        .orderBy(videoComment.createdAt) // Oldest first for replies
        .limit(input.limit + 1)
        .offset(input.cursor ? (input.cursor - 1) * input.limit : 0);

      // Check which replies current user has liked
      let likedCommentIds: number[] = [];
      if (currentUserId && replies.length > 0) {
        const likes = await db
          .select({ idComment: videoCommentLike.idComment })
          .from(videoCommentLike)
          .where(
            and(
              eq(videoCommentLike.idUser, currentUserId),
              sql`${videoCommentLike.idComment} IN (${sql.join(
                replies.map((c) => sql`${c.id}`),
                sql`, `,
              )})`,
            ),
          );
        likedCommentIds = likes.map((l) => l.idComment);
      }

      const hasMore = replies.length > input.limit;
      const items = hasMore ? replies.slice(0, -1) : replies;

      return {
        items: items.map((c) => ({
          id: c.id,
          videoId: c.idVideo,
          userId: c.idUser,
          parentId: c.idParent,
          content: c.content,
          likeCount: c.likeCount ?? 0,
          replyCount: c.replyCount ?? 0,
          isPinned: c.isPinned === 1,
          isHearted: c.isHearted === 1,
          isLiked: likedCommentIds.includes(c.id),
          createdAt: c.createdAt,
          user: {
            id: c.idUser,
            name: c.userName.trim(),
            image: c.userImage,
            isInfluencer: c.userIsInfluencer === 1,
          },
        })),
        nextCursor: hasMore ? (input.cursor ?? 1) + 1 : null,
      };
    }),

  /**
   * Delete a comment (owner only)
   */
  deleteComment: protectedProcedure
    .input(
      z.object({
        commentId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = Number(ctx.session.user.id);

      // Get the comment
      const [comment] = await db
        .select()
        .from(videoComment)
        .where(eq(videoComment.id, input.commentId));

      if (!comment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Comment not found",
        });
      }

      // Check if user owns the comment or the video
      const [videoRecord] = await db
        .select({ idUser: video.idUser })
        .from(video)
        .where(eq(video.id, comment.idVideo));

      if (comment.idUser !== userId && videoRecord?.idUser !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to delete this comment",
        });
      }

      const now = new Date().toISOString().slice(0, 19).replace("T", " ");

      // Delete all replies to this comment
      const replies = await db
        .select({ id: videoComment.id })
        .from(videoComment)
        .where(eq(videoComment.idParent, input.commentId));

      const replyCount = replies.length;

      if (replyCount > 0) {
        // Delete likes on replies
        await db.delete(videoCommentLike).where(
          sql`${videoCommentLike.idComment} IN (${sql.join(
            replies.map((r) => sql`${r.id}`),
            sql`, `,
          )})`,
        );

        // Delete replies
        await db
          .delete(videoComment)
          .where(eq(videoComment.idParent, input.commentId));
      }

      // Delete likes on the comment
      await db
        .delete(videoCommentLike)
        .where(eq(videoCommentLike.idComment, input.commentId));

      // Delete the comment
      await db.delete(videoComment).where(eq(videoComment.id, input.commentId));

      // Update parent reply count if this was a reply
      if (comment.idParent) {
        await db
          .update(videoComment)
          .set({
            replyCount: sql`GREATEST(${videoComment.replyCount} - 1, 0)`,
            updatedAt: now,
          })
          .where(eq(videoComment.id, comment.idParent));
      }

      // Update video comment count (including deleted replies)
      const totalDeleted = 1 + replyCount;
      await db
        .update(video)
        .set({
          commentCount: sql`GREATEST(${video.commentCount} - ${totalDeleted}, 0)`,
          updatedAt: now,
        })
        .where(eq(video.id, comment.idVideo));

      return { success: true };
    }),

  /**
   * Like/unlike a comment
   */
  toggleCommentLike: protectedProcedure
    .input(
      z.object({
        commentId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = Number(ctx.session.user.id);

      // Check if already liked
      const [existingLike] = await db
        .select()
        .from(videoCommentLike)
        .where(
          and(
            eq(videoCommentLike.idComment, input.commentId),
            eq(videoCommentLike.idUser, userId),
          ),
        );

      const now = new Date().toISOString().slice(0, 19).replace("T", " ");

      if (existingLike) {
        // Unlike
        await db
          .delete(videoCommentLike)
          .where(
            and(
              eq(videoCommentLike.idComment, input.commentId),
              eq(videoCommentLike.idUser, userId),
            ),
          );

        await db
          .update(videoComment)
          .set({
            likeCount: sql`GREATEST(${videoComment.likeCount} - 1, 0)`,
            updatedAt: now,
          })
          .where(eq(videoComment.id, input.commentId));

        return { liked: false };
      } else {
        // Like
        await db.insert(videoCommentLike).values({
          idComment: input.commentId,
          idUser: userId,
          createdAt: now,
        });

        await db
          .update(videoComment)
          .set({
            likeCount: sql`${videoComment.likeCount} + 1`,
            updatedAt: now,
          })
          .where(eq(videoComment.id, input.commentId));

        return { liked: true };
      }
    }),

  /**
   * Pin/unpin a comment (video owner only)
   */
  togglePinComment: protectedProcedure
    .input(
      z.object({
        commentId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = Number(ctx.session.user.id);

      // Get the comment and video
      const [comment] = await db
        .select({
          id: videoComment.id,
          idVideo: videoComment.idVideo,
          isPinned: videoComment.isPinned,
        })
        .from(videoComment)
        .where(eq(videoComment.id, input.commentId));

      if (!comment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Comment not found",
        });
      }

      // Check if user owns the video
      const [videoRecord] = await db
        .select({ idUser: video.idUser })
        .from(video)
        .where(eq(video.id, comment.idVideo));

      if (videoRecord?.idUser !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the video owner can pin comments",
        });
      }

      const now = new Date().toISOString().slice(0, 19).replace("T", " ");
      const newPinned = comment.isPinned === 1 ? 0 : 1;

      // If pinning, unpin any other pinned comment on this video
      if (newPinned === 1) {
        await db
          .update(videoComment)
          .set({ isPinned: 0, updatedAt: now })
          .where(
            and(
              eq(videoComment.idVideo, comment.idVideo),
              eq(videoComment.isPinned, 1),
            ),
          );
      }

      await db
        .update(videoComment)
        .set({ isPinned: newPinned, updatedAt: now })
        .where(eq(videoComment.id, input.commentId));

      return { pinned: newPinned === 1 };
    }),

  /**
   * Heart a comment (video owner only - shows special creator heart)
   */
  toggleHeartComment: protectedProcedure
    .input(
      z.object({
        commentId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = Number(ctx.session.user.id);

      // Get the comment and video
      const [comment] = await db
        .select({
          id: videoComment.id,
          idVideo: videoComment.idVideo,
          isHearted: videoComment.isHearted,
        })
        .from(videoComment)
        .where(eq(videoComment.id, input.commentId));

      if (!comment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Comment not found",
        });
      }

      // Check if user owns the video
      const [videoRecord] = await db
        .select({ idUser: video.idUser })
        .from(video)
        .where(eq(video.id, comment.idVideo));

      if (videoRecord?.idUser !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the video owner can heart comments",
        });
      }

      const now = new Date().toISOString().slice(0, 19).replace("T", " ");
      const newHearted = comment.isHearted === 1 ? 0 : 1;

      await db
        .update(videoComment)
        .set({ isHearted: newHearted, updatedAt: now })
        .where(eq(videoComment.id, input.commentId));

      return { hearted: newHearted === 1 };
    }),

  // ============================================
  // Hashtag Endpoints
  // ============================================

  /**
   * Get trending hashtags
   */
  getTrendingHashtags: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
      }),
    )
    .query(async ({ input }) => {
      const tags = await db
        .select({
          id: hashtag.id,
          name: hashtag.name,
          videoCount: hashtag.videoCount,
          viewCount: hashtag.viewCount,
        })
        .from(hashtag)
        .orderBy(desc(hashtag.videoCount))
        .limit(input.limit);

      return {
        items: tags.map((t) => ({
          id: t.id,
          name: t.name,
          videoCount: t.videoCount ?? 0,
          viewCount: t.viewCount ?? 0,
        })),
      };
    }),

  /**
   * Search hashtags
   */
  searchHashtags: publicProcedure
    .input(
      z.object({
        query: z.string().min(1).max(100),
        limit: z.number().min(1).max(50).default(20),
      }),
    )
    .query(async ({ input }) => {
      // Remove # if present
      const searchTerm = input.query.startsWith("#")
        ? input.query.slice(1)
        : input.query;

      const tags = await db
        .select({
          id: hashtag.id,
          name: hashtag.name,
          videoCount: hashtag.videoCount,
          viewCount: hashtag.viewCount,
        })
        .from(hashtag)
        .where(sql`${hashtag.name} LIKE ${`${searchTerm}%`}`)
        .orderBy(desc(hashtag.videoCount))
        .limit(input.limit);

      return {
        items: tags.map((t) => ({
          id: t.id,
          name: t.name,
          videoCount: t.videoCount ?? 0,
          viewCount: t.viewCount ?? 0,
        })),
      };
    }),

  /**
   * Get videos by hashtag
   */
  getVideosByHashtag: protectedProcedure
    .input(
      z.object({
        hashtag: z.string().min(1).max(100),
        limit: z.number().min(1).max(50).default(20),
        cursor: z.number().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const currentUserId = Number(ctx.session.user.id);

      // Remove # if present
      const tagName = input.hashtag.startsWith("#")
        ? input.hashtag.slice(1).toLowerCase()
        : input.hashtag.toLowerCase();

      // Find the hashtag
      const [tag] = await db
        .select({ id: hashtag.id, videoCount: hashtag.videoCount })
        .from(hashtag)
        .where(eq(hashtag.name, tagName));

      if (!tag) {
        return {
          hashtag: {
            name: tagName,
            videoCount: 0,
            viewCount: 0,
          },
          items: [],
          nextCursor: null,
          muxEnabled: isMuxEnabled(),
        };
      }

      // Get videos with this hashtag
      const videos = await db
        .select({
          id: video.id,
          idUser: video.idUser,
          caption: video.caption,
          s3Url: video.s3Url,
          playbackId: video.playbackId,
          thumbnailUrl: video.thumbnailUrl,
          duration: video.duration,
          likeCount: video.likeCount,
          commentCount: video.commentCount,
          shareCount: video.shareCount,
          viewCount: video.viewCount,
          allowSharing: video.allowSharing,
          createdAt: video.createdAt,
          userName:
            sql<string>`CONCAT(${user.firstName}, ' ', COALESCE(${user.lastName}, ''))`.as(
              "userName",
            ),
          userImage: user.image,
          userIsInfluencer: user.isInfluencer,
        })
        .from(video)
        .innerJoin(videoHashtag, eq(video.id, videoHashtag.idVideo))
        .innerJoin(user, eq(video.idUser, user.id))
        .where(
          and(
            eq(videoHashtag.idHashtag, tag.id),
            eq(video.transcodingStatus, "ready"),
            // sql`(${video.publishStatus} = 'published' OR ${video.publishStatus} IS NULL)`,
          ),
        )
        .orderBy(desc(video.createdAt))
        .limit(input.limit + 1)
        .offset(input.cursor ? (input.cursor - 1) * input.limit : 0);

      // Check which videos current user has liked
      let likedVideoIds: number[] = [];
      if (currentUserId && videos.length > 0) {
        const likes = await db
          .select({ idVideo: videoLike.idVideo })
          .from(videoLike)
          .where(
            and(
              eq(videoLike.idUser, currentUserId),
              sql`${videoLike.idVideo} IN (${sql.join(
                videos.map((v) => sql`${v.id}`),
                sql`, `,
              )})`,
            ),
          );
        likedVideoIds = likes.map((l) => l.idVideo);
      }

      // Check which videos current user has shared
      let sharedVideoIds: number[] = [];
      if (currentUserId && videos.length > 0) {
        const shares = await db
          .select({ idVideo: videoShare.idVideo })
          .from(videoShare)
          .where(
            and(
              eq(videoShare.idUser, currentUserId),
              sql`${videoShare.idVideo} IN (${sql.join(
                videos.map((v) => sql`${v.id}`),
                sql`, `,
              )})`,
            ),
          );
        sharedVideoIds = shares.map((s) => s.idVideo);
      }

      const hasMore = videos.length > input.limit;
      const items = hasMore ? videos.slice(0, -1) : videos;

      return {
        hashtag: {
          name: tagName,
          videoCount: tag.videoCount ?? 0,
        },
        items: items.map((v) => ({
          id: v.id,
          userId: v.idUser,
          caption: v.caption,
          playbackId: v.playbackId,
          playbackUrl: v.playbackId ? getPlaybackUrl(v.playbackId) : v.s3Url,
          thumbnailUrl: v.thumbnailUrl,
          duration: v.duration,
          likeCount: v.likeCount ?? 0,
          commentCount: v.commentCount ?? 0,
          shareCount: v.shareCount ?? 0,
          viewCount: v.viewCount ?? 0,
          allowSharing: v.allowSharing === 1,
          isLiked: likedVideoIds.includes(v.id),
          isShared: sharedVideoIds.includes(v.id),
          createdAt: v.createdAt,
          creator: {
            id: v.idUser,
            name: v.userName.trim(),
            image: v.userImage,
            isInfluencer: v.userIsInfluencer === 1,
          },
        })),
        nextCursor: hasMore ? (input.cursor ?? 1) + 1 : null,
        muxEnabled: isMuxEnabled(),
      };
    }),

  /**
   * Get hashtags for a video
   */
  getVideoHashtags: publicProcedure
    .input(
      z.object({
        videoId: z.number(),
      }),
    )
    .query(async ({ input }) => {
      const tags = await db
        .select({
          id: hashtag.id,
          name: hashtag.name,
          videoCount: hashtag.videoCount,
        })
        .from(hashtag)
        .innerJoin(videoHashtag, eq(hashtag.id, videoHashtag.idHashtag))
        .where(eq(videoHashtag.idVideo, input.videoId));

      return {
        items: tags.map((t) => ({
          id: t.id,
          name: t.name,
          videoCount: t.videoCount ?? 0,
        })),
      };
    }),

  /**
   * Record hashtag view (when user views videos under a hashtag)
   */
  recordHashtagView: protectedProcedure
    .input(
      z.object({
        hashtag: z.string().min(1).max(100),
      }),
    )
    .mutation(async ({ input }) => {
      // Remove # if present
      const tagName = input.hashtag.startsWith("#")
        ? input.hashtag.slice(1).toLowerCase()
        : input.hashtag.toLowerCase();

      const now = new Date().toISOString().slice(0, 19).replace("T", " ");

      await db
        .update(hashtag)
        .set({
          viewCount: sql`${hashtag.viewCount} + 1`,
          updatedAt: now,
        })
        .where(eq(hashtag.name, tagName));

      return { success: true };
    }),

  // ============================================
  // Video Save/Bookmark Endpoints
  // ============================================

  /**
   * Save/bookmark a video
   */
  saveVideo: protectedProcedure
    .input(
      z.object({
        videoId: z.number(),
        collectionId: z.number().optional(), // If not provided, saves to default collection
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = Number(ctx.session.user.id);
      const now = new Date().toISOString().slice(0, 19).replace("T", " ");

      // Get or create default collection if no collectionId provided
      let collectionId = input.collectionId ?? null;

      if (!collectionId) {
        // Check for default collection
        const [defaultCollection] = await db
          .select({ id: videoCollection.id })
          .from(videoCollection)
          .where(
            and(
              eq(videoCollection.idUser, userId),
              eq(videoCollection.isDefault, 1),
            ),
          );

        if (defaultCollection) {
          collectionId = defaultCollection.id;
        } else {
          // Create default collection
          const [result] = await db.insert(videoCollection).values({
            idUser: userId,
            name: "Saved",
            isDefault: 1,
            isPublic: 0,
            createdAt: now,
          });
          collectionId = Number(result.insertId);
        }
      }

      // Check if already saved
      const [existingSave] = await db
        .select()
        .from(videoSave)
        .where(
          and(
            eq(videoSave.idVideo, input.videoId),
            eq(videoSave.idUser, userId),
            collectionId
              ? eq(videoSave.idCollection, collectionId)
              : sql`${videoSave.idCollection} IS NULL`,
          ),
        );

      if (existingSave) {
        return { saved: true, alreadySaved: true };
      }

      // Save the video
      await db.insert(videoSave).values({
        idVideo: input.videoId,
        idUser: userId,
        idCollection: collectionId,
        createdAt: now,
      });

      // Update collection video count
      if (collectionId) {
        await db
          .update(videoCollection)
          .set({
            videoCount: sql`${videoCollection.videoCount} + 1`,
            updatedAt: now,
          })
          .where(eq(videoCollection.id, collectionId));
      }

      return { saved: true, alreadySaved: false };
    }),

  /**
   * Unsave/unbookmark a video
   */
  unsaveVideo: protectedProcedure
    .input(
      z.object({
        videoId: z.number(),
        collectionId: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = Number(ctx.session.user.id);
      const now = new Date().toISOString().slice(0, 19).replace("T", " ");

      // Find the save record
      const conditions = [
        eq(videoSave.idVideo, input.videoId),
        eq(videoSave.idUser, userId),
      ];

      if (input.collectionId) {
        conditions.push(eq(videoSave.idCollection, input.collectionId));
      }

      const [existingSave] = await db
        .select()
        .from(videoSave)
        .where(and(...conditions));

      if (!existingSave) {
        return { saved: false };
      }

      // Delete the save
      await db.delete(videoSave).where(eq(videoSave.id, existingSave.id));

      // Update collection video count
      if (existingSave.idCollection) {
        await db
          .update(videoCollection)
          .set({
            videoCount: sql`GREATEST(${videoCollection.videoCount} - 1, 0)`,
            updatedAt: now,
          })
          .where(eq(videoCollection.id, existingSave.idCollection));
      }

      return { saved: false };
    }),

  /**
   * Toggle save/unsave a video
   */
  toggleSave: protectedProcedure
    .input(
      z.object({
        videoId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = Number(ctx.session.user.id);
      const now = new Date().toISOString().slice(0, 19).replace("T", " ");

      // Check if video is saved in any collection
      const [existingSave] = await db
        .select()
        .from(videoSave)
        .where(
          and(
            eq(videoSave.idVideo, input.videoId),
            eq(videoSave.idUser, userId),
          ),
        );

      if (existingSave) {
        // Unsave
        await db.delete(videoSave).where(eq(videoSave.id, existingSave.id));

        if (existingSave.idCollection) {
          await db
            .update(videoCollection)
            .set({
              videoCount: sql`GREATEST(${videoCollection.videoCount} - 1, 0)`,
              updatedAt: now,
            })
            .where(eq(videoCollection.id, existingSave.idCollection));
        }

        return { saved: false };
      } else {
        // Get or create default collection
        let [defaultCollection] = await db
          .select({ id: videoCollection.id })
          .from(videoCollection)
          .where(
            and(
              eq(videoCollection.idUser, userId),
              eq(videoCollection.isDefault, 1),
            ),
          );

        if (!defaultCollection) {
          const [result] = await db.insert(videoCollection).values({
            idUser: userId,
            name: "Saved",
            isDefault: 1,
            isPublic: 0,
            createdAt: now,
          });
          defaultCollection = { id: Number(result.insertId) };
        }

        // Save the video
        await db.insert(videoSave).values({
          idVideo: input.videoId,
          idUser: userId,
          idCollection: defaultCollection.id,
          createdAt: now,
        });

        await db
          .update(videoCollection)
          .set({
            videoCount: sql`${videoCollection.videoCount} + 1`,
            updatedAt: now,
          })
          .where(eq(videoCollection.id, defaultCollection.id));

        return { saved: true };
      }
    }),

  /**
   * Check if a video is saved
   */
  isSaved: protectedProcedure
    .input(
      z.object({
        videoId: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = Number(ctx.session.user.id);

      const [existingSave] = await db
        .select()
        .from(videoSave)
        .where(
          and(
            eq(videoSave.idVideo, input.videoId),
            eq(videoSave.idUser, userId),
          ),
        );

      return { saved: !!existingSave };
    }),

  /**
   * Get user's saved videos
   */
  getSavedVideos: protectedProcedure
    .input(
      z.object({
        collectionId: z.number().optional(), // If not provided, returns all saved videos
        limit: z.number().min(1).max(50).default(20),
        cursor: z.number().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const currentUserId = Number(ctx.session.user.id);

      const conditions = [eq(videoSave.idUser, currentUserId)];

      if (input.collectionId) {
        conditions.push(eq(videoSave.idCollection, input.collectionId));
      }

      const saves = await db
        .select({
          saveId: videoSave.id,
          savedAt: videoSave.createdAt,
          videoId: video.id,
          videoCaption: video.caption,
          videoS3Url: video.s3Url,
          videoPlaybackId: video.playbackId,
          videoThumbnailUrl: video.thumbnailUrl,
          videoDuration: video.duration,
          videoLikeCount: video.likeCount,
          videoCommentCount: video.commentCount,
          videoShareCount: video.shareCount,
          videoCreatedAt: video.createdAt,
          creatorId: user.id,
          creatorName:
            sql<string>`CONCAT(${user.firstName}, ' ', COALESCE(${user.lastName}, ''))`.as(
              "creatorName",
            ),
          creatorImage: user.image,
          creatorIsInfluencer: user.isInfluencer,
        })
        .from(videoSave)
        .innerJoin(video, eq(videoSave.idVideo, video.id))
        .innerJoin(user, eq(video.idUser, user.id))
        .where(and(...conditions))
        .orderBy(desc(videoSave.createdAt))
        .limit(input.limit + 1)
        .offset(input.cursor ? (input.cursor - 1) * input.limit : 0);

      // Check which videos current user has liked
      let likedVideoIds: number[] = [];
      if (saves.length > 0) {
        const videoIds = saves.map((s) => s.videoId);
        const likes = await db
          .select({ idVideo: videoLike.idVideo })
          .from(videoLike)
          .where(
            and(
              eq(videoLike.idUser, currentUserId),
              sql`${videoLike.idVideo} IN (${sql.join(
                videoIds.map((id) => sql`${id}`),
                sql`, `,
              )})`,
            ),
          );
        likedVideoIds = likes.map((l) => l.idVideo);
      }

      const hasMore = saves.length > input.limit;
      const items = hasMore ? saves.slice(0, -1) : saves;

      return {
        items: items.map((s) => ({
          saveId: s.saveId,
          savedAt: s.savedAt,
          video: {
            id: s.videoId,
            caption: s.videoCaption,
            playbackUrl: s.videoPlaybackId
              ? getPlaybackUrl(s.videoPlaybackId)
              : s.videoS3Url,
            thumbnailUrl: s.videoThumbnailUrl,
            duration: s.videoDuration,
            likeCount: s.videoLikeCount ?? 0,
            commentCount: s.videoCommentCount ?? 0,
            shareCount: s.videoShareCount ?? 0,
            isLiked: likedVideoIds.includes(s.videoId),
            createdAt: s.videoCreatedAt,
            creator: {
              id: s.creatorId,
              name: s.creatorName.trim(),
              image: s.creatorImage,
              isInfluencer: s.creatorIsInfluencer === 1,
            },
          },
        })),
        nextCursor: hasMore ? (input.cursor ?? 1) + 1 : null,
        muxEnabled: isMuxEnabled(),
      };
    }),

  /**
   * Get user's collections
   */
  getCollections: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = Number(ctx.session.user.id);

      const collections = await db
        .select()
        .from(videoCollection)
        .where(eq(videoCollection.idUser, userId))
        .orderBy(
          desc(videoCollection.isDefault),
          desc(videoCollection.updatedAt),
        )
        .limit(input.limit);

      return {
        items: collections.map((c) => ({
          id: c.id,
          name: c.name,
          description: c.description,
          isPublic: c.isPublic === 1,
          isDefault: c.isDefault === 1,
          videoCount: c.videoCount ?? 0,
          coverUrl: c.coverUrl,
          createdAt: c.createdAt,
        })),
      };
    }),

  /**
   * Create a collection
   */
  createCollection: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        description: z.string().max(255).optional(),
        isPublic: z.boolean().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = Number(ctx.session.user.id);
      const now = new Date().toISOString().slice(0, 19).replace("T", " ");

      const [result] = await db.insert(videoCollection).values({
        idUser: userId,
        name: input.name,
        description: input.description ?? null,
        isPublic: input.isPublic ? 1 : 0,
        isDefault: 0,
        createdAt: now,
      });

      return {
        id: Number(result.insertId),
        name: input.name,
      };
    }),

  /**
   * Delete a collection
   */
  deleteCollection: protectedProcedure
    .input(
      z.object({
        collectionId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = Number(ctx.session.user.id);

      // Verify ownership and not default
      const [collection] = await db
        .select()
        .from(videoCollection)
        .where(
          and(
            eq(videoCollection.id, input.collectionId),
            eq(videoCollection.idUser, userId),
          ),
        );

      if (!collection) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Collection not found",
        });
      }

      if (collection.isDefault === 1) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot delete default collection",
        });
      }

      // Delete all saves in this collection
      await db
        .delete(videoSave)
        .where(eq(videoSave.idCollection, input.collectionId));

      // Delete the collection
      await db
        .delete(videoCollection)
        .where(eq(videoCollection.id, input.collectionId));

      return { success: true };
    }),

  // ============================================
  // Sound/Music Endpoints
  // ============================================

  /**
   * Get trending sounds
   */
  getTrendingSounds: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
      }),
    )
    .query(async ({ input }) => {
      const sounds = await db
        .select({
          id: sound.id,
          name: sound.name,
          artistName: sound.artistName,
          audioUrl: sound.audioUrl,
          coverUrl: sound.coverUrl,
          duration: sound.duration,
          usageCount: sound.usageCount,
          isOriginal: sound.isOriginal,
          createdAt: sound.createdAt,
          creatorName:
            sql<string>`CONCAT(${user.firstName}, ' ', COALESCE(${user.lastName}, ''))`.as(
              "creatorName",
            ),
          creatorImage: user.image,
        })
        .from(sound)
        .innerJoin(user, eq(sound.idUser, user.id))
        .orderBy(desc(sound.usageCount))
        .limit(input.limit);

      return {
        items: sounds.map((s) => ({
          id: s.id,
          name: s.name,
          artistName: s.artistName ?? s.creatorName.trim(),
          audioUrl: s.audioUrl,
          coverUrl: s.coverUrl,
          duration: s.duration,
          usageCount: s.usageCount ?? 0,
          isOriginal: s.isOriginal === 1,
          createdAt: s.createdAt,
          creator: {
            name: s.creatorName.trim(),
            image: s.creatorImage,
          },
        })),
      };
    }),

  /**
   * Search sounds
   */
  searchSounds: publicProcedure
    .input(
      z.object({
        query: z.string().min(1).max(100),
        limit: z.number().min(1).max(50).default(20),
      }),
    )
    .query(async ({ input }) => {
      const sounds = await db
        .select({
          id: sound.id,
          name: sound.name,
          artistName: sound.artistName,
          audioUrl: sound.audioUrl,
          coverUrl: sound.coverUrl,
          duration: sound.duration,
          usageCount: sound.usageCount,
          isOriginal: sound.isOriginal,
          createdAt: sound.createdAt,
          creatorName:
            sql<string>`CONCAT(${user.firstName}, ' ', COALESCE(${user.lastName}, ''))`.as(
              "creatorName",
            ),
          creatorImage: user.image,
        })
        .from(sound)
        .innerJoin(user, eq(sound.idUser, user.id))
        .where(
          sql`${sound.name} LIKE ${`%${input.query}%`} OR ${sound.artistName} LIKE ${`%${input.query}%`}`,
        )
        .orderBy(desc(sound.usageCount))
        .limit(input.limit);

      return {
        items: sounds.map((s) => ({
          id: s.id,
          name: s.name,
          artistName: s.artistName ?? s.creatorName.trim(),
          audioUrl: s.audioUrl,
          coverUrl: s.coverUrl,
          duration: s.duration,
          usageCount: s.usageCount ?? 0,
          isOriginal: s.isOriginal === 1,
          createdAt: s.createdAt,
          creator: {
            name: s.creatorName.trim(),
            image: s.creatorImage,
          },
        })),
      };
    }),

  /**
   * Get sound details with videos using it
   */
  getSound: protectedProcedure
    .input(
      z.object({
        soundId: z.number(),
      }),
    )
    .query(async ({ input }) => {
      const [soundRecord] = await db
        .select({
          id: sound.id,
          name: sound.name,
          artistName: sound.artistName,
          originalVideoId: sound.originalVideoId,
          audioUrl: sound.audioUrl,
          coverUrl: sound.coverUrl,
          duration: sound.duration,
          usageCount: sound.usageCount,
          isOriginal: sound.isOriginal,
          createdAt: sound.createdAt,
          creatorId: sound.idUser,
          creatorName:
            sql<string>`CONCAT(${user.firstName}, ' ', COALESCE(${user.lastName}, ''))`.as(
              "creatorName",
            ),
          creatorImage: user.image,
        })
        .from(sound)
        .innerJoin(user, eq(sound.idUser, user.id))
        .where(eq(sound.id, input.soundId));

      if (!soundRecord) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Sound not found",
        });
      }

      return {
        id: soundRecord.id,
        name: soundRecord.name,
        artistName: soundRecord.artistName ?? soundRecord.creatorName.trim(),
        originalVideoId: soundRecord.originalVideoId,
        audioUrl: soundRecord.audioUrl,
        coverUrl: soundRecord.coverUrl,
        duration: soundRecord.duration,
        usageCount: soundRecord.usageCount ?? 0,
        isOriginal: soundRecord.isOriginal === 1,
        createdAt: soundRecord.createdAt,
        creator: {
          id: soundRecord.creatorId,
          name: soundRecord.creatorName.trim(),
          image: soundRecord.creatorImage,
        },
      };
    }),

  /**
   * Get videos using a specific sound
   */
  getVideosBySound: protectedProcedure
    .input(
      z.object({
        soundId: z.number(),
        limit: z.number().min(1).max(50).default(20),
        cursor: z.number().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const currentUserId = Number(ctx.session.user.id);

      const videos = await db
        .select({
          id: video.id,
          idUser: video.idUser,
          caption: video.caption,
          s3Url: video.s3Url,
          playbackId: video.playbackId,
          thumbnailUrl: video.thumbnailUrl,
          duration: video.duration,
          likeCount: video.likeCount,
          commentCount: video.commentCount,
          shareCount: video.shareCount,
          createdAt: video.createdAt,
          userName:
            sql<string>`CONCAT(${user.firstName}, ' ', COALESCE(${user.lastName}, ''))`.as(
              "userName",
            ),
          userImage: user.image,
          userIsInfluencer: user.isInfluencer,
        })
        .from(video)
        .innerJoin(videoSound, eq(video.id, videoSound.idVideo))
        .innerJoin(user, eq(video.idUser, user.id))
        .where(
          and(
            eq(videoSound.idSound, input.soundId),
            eq(video.transcodingStatus, "ready"),
            // sql`(${video.publishStatus} = 'published' OR ${video.publishStatus} IS NULL)`,
          ),
        )
        .orderBy(desc(video.createdAt))
        .limit(input.limit + 1)
        .offset(input.cursor ? (input.cursor - 1) * input.limit : 0);

      // Check which videos current user has liked
      let likedVideoIds: number[] = [];
      if (currentUserId && videos.length > 0) {
        const likes = await db
          .select({ idVideo: videoLike.idVideo })
          .from(videoLike)
          .where(
            and(
              eq(videoLike.idUser, currentUserId),
              sql`${videoLike.idVideo} IN (${sql.join(
                videos.map((v) => sql`${v.id}`),
                sql`, `,
              )})`,
            ),
          );
        likedVideoIds = likes.map((l) => l.idVideo);
      }

      const hasMore = videos.length > input.limit;
      const items = hasMore ? videos.slice(0, -1) : videos;

      return {
        items: items.map((v) => ({
          id: v.id,
          userId: v.idUser,
          caption: v.caption,
          playbackId: v.playbackId,
          playbackUrl: v.playbackId ? getPlaybackUrl(v.playbackId) : v.s3Url,
          thumbnailUrl: v.thumbnailUrl,
          duration: v.duration,
          likeCount: v.likeCount ?? 0,
          commentCount: v.commentCount ?? 0,
          shareCount: v.shareCount ?? 0,
          isLiked: likedVideoIds.includes(v.id),
          createdAt: v.createdAt,
          creator: {
            id: v.idUser,
            name: v.userName.trim(),
            image: v.userImage,
            isInfluencer: v.userIsInfluencer === 1,
          },
        })),
        nextCursor: hasMore ? (input.cursor ?? 1) + 1 : null,
        muxEnabled: isMuxEnabled(),
      };
    }),

  /**
   * Toggle favorite/save a sound
   */
  toggleSoundFavorite: protectedProcedure
    .input(
      z.object({
        soundId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = Number(ctx.session.user.id);
      const now = new Date().toISOString().slice(0, 19).replace("T", " ");

      // Check if already favorited
      const [existing] = await db
        .select()
        .from(soundFavorite)
        .where(
          and(
            eq(soundFavorite.idSound, input.soundId),
            eq(soundFavorite.idUser, userId),
          ),
        );

      if (existing) {
        // Unfavorite
        await db
          .delete(soundFavorite)
          .where(
            and(
              eq(soundFavorite.idSound, input.soundId),
              eq(soundFavorite.idUser, userId),
            ),
          );
        return { favorited: false };
      } else {
        // Favorite
        await db.insert(soundFavorite).values({
          idSound: input.soundId,
          idUser: userId,
          createdAt: now,
        });
        return { favorited: true };
      }
    }),

  /**
   * Get user's favorite sounds
   */
  getFavoriteSounds: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        cursor: z.number().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = Number(ctx.session.user.id);

      const favorites = await db
        .select({
          favoriteId: soundFavorite.id,
          favoritedAt: soundFavorite.createdAt,
          soundId: sound.id,
          soundName: sound.name,
          soundArtist: sound.artistName,
          soundAudioUrl: sound.audioUrl,
          soundCoverUrl: sound.coverUrl,
          soundDuration: sound.duration,
          soundUsageCount: sound.usageCount,
          creatorName:
            sql<string>`CONCAT(${user.firstName}, ' ', COALESCE(${user.lastName}, ''))`.as(
              "creatorName",
            ),
        })
        .from(soundFavorite)
        .innerJoin(sound, eq(soundFavorite.idSound, sound.id))
        .innerJoin(user, eq(sound.idUser, user.id))
        .where(eq(soundFavorite.idUser, userId))
        .orderBy(desc(soundFavorite.createdAt))
        .limit(input.limit + 1)
        .offset(input.cursor ? (input.cursor - 1) * input.limit : 0);

      const hasMore = favorites.length > input.limit;
      const items = hasMore ? favorites.slice(0, -1) : favorites;

      return {
        items: items.map((f) => ({
          favoriteId: f.favoriteId,
          favoritedAt: f.favoritedAt,
          sound: {
            id: f.soundId,
            name: f.soundName,
            artistName: f.soundArtist ?? f.creatorName.trim(),
            audioUrl: f.soundAudioUrl,
            coverUrl: f.soundCoverUrl,
            duration: f.soundDuration,
            usageCount: f.soundUsageCount ?? 0,
          },
        })),
        nextCursor: hasMore ? (input.cursor ?? 1) + 1 : null,
      };
    }),

  // ============================================
  // Draft and Scheduling Endpoints
  // ============================================

  /**
   * Get user's drafts
   */
  getDrafts: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        cursor: z.number().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = Number(ctx.session.user.id);

      const drafts = await db
        .select({
          id: video.id,
          caption: video.caption,
          s3Url: video.s3Url,
          playbackId: video.playbackId,
          thumbnailUrl: video.thumbnailUrl,
          duration: video.duration,
          transcodingStatus: video.transcodingStatus,
          publishStatus: video.publishStatus,
          createdAt: video.createdAt,
          updatedAt: video.updatedAt,
        })
        .from(video)
        .where(and(eq(video.idUser, userId), eq(video.publishStatus, "draft")))
        .orderBy(desc(video.updatedAt))
        .limit(input.limit + 1)
        .offset(input.cursor ? (input.cursor - 1) * input.limit : 0);

      const hasMore = drafts.length > input.limit;
      const items = hasMore ? drafts.slice(0, -1) : drafts;

      return {
        items: items.map((d) => ({
          id: d.id,
          caption: d.caption,
          playbackUrl: d.playbackId ? getPlaybackUrl(d.playbackId) : d.s3Url,
          thumbnailUrl: d.thumbnailUrl,
          duration: d.duration,
          transcodingStatus: d.transcodingStatus ?? "pending",
          publishStatus: d.publishStatus ?? "draft",
          createdAt: d.createdAt,
          updatedAt: d.updatedAt,
        })),
        nextCursor: hasMore ? (input.cursor ?? 1) + 1 : null,
      };
    }),

  /**
   * Get user's scheduled videos
   */
  getScheduledVideos: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        cursor: z.number().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = Number(ctx.session.user.id);

      const scheduled = await db
        .select({
          id: video.id,
          caption: video.caption,
          s3Url: video.s3Url,
          playbackId: video.playbackId,
          thumbnailUrl: video.thumbnailUrl,
          duration: video.duration,
          transcodingStatus: video.transcodingStatus,
          publishStatus: video.publishStatus,
          scheduledAt: video.scheduledAt,
          createdAt: video.createdAt,
        })
        .from(video)
        .where(
          and(eq(video.idUser, userId), eq(video.publishStatus, "scheduled")),
        )
        .orderBy(video.scheduledAt)
        .limit(input.limit + 1)
        .offset(input.cursor ? (input.cursor - 1) * input.limit : 0);

      const hasMore = scheduled.length > input.limit;
      const items = hasMore ? scheduled.slice(0, -1) : scheduled;

      return {
        items: items.map((s) => ({
          id: s.id,
          caption: s.caption,
          playbackUrl: s.playbackId ? getPlaybackUrl(s.playbackId) : s.s3Url,
          thumbnailUrl: s.thumbnailUrl,
          duration: s.duration,
          transcodingStatus: s.transcodingStatus ?? "pending",
          publishStatus: s.publishStatus ?? "scheduled",
          scheduledAt: s.scheduledAt,
          createdAt: s.createdAt,
        })),
        nextCursor: hasMore ? (input.cursor ?? 1) + 1 : null,
      };
    }),

  /**
   * Save video as draft
   */
  saveDraft: protectedProcedure
    .input(
      z.object({
        videoId: z.number(),
        caption: z.string().max(500).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = Number(ctx.session.user.id);
      const now = new Date().toISOString().slice(0, 19).replace("T", " ");

      // Verify ownership
      const [existingVideo] = await db
        .select()
        .from(video)
        .where(and(eq(video.id, input.videoId), eq(video.idUser, userId)));

      if (!existingVideo) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found",
        });
      }

      await db
        .update(video)
        .set({
          publishStatus: "draft",
          caption: input.caption ?? existingVideo.caption,
          updatedAt: now,
        })
        .where(eq(video.id, input.videoId));

      return { success: true };
    }),

  /**
   * Schedule a video for publishing
   */
  scheduleVideo: protectedProcedure
    .input(
      z.object({
        videoId: z.number(),
        scheduledAt: z.string(), // ISO date string
        caption: z.string().max(500).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = Number(ctx.session.user.id);
      const now = new Date().toISOString().slice(0, 19).replace("T", " ");

      // Verify ownership
      const [existingVideo] = await db
        .select()
        .from(video)
        .where(and(eq(video.id, input.videoId), eq(video.idUser, userId)));

      if (!existingVideo) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found",
        });
      }

      // Validate scheduled time is in the future
      const scheduledDate = new Date(input.scheduledAt);
      if (scheduledDate <= new Date()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Scheduled time must be in the future",
        });
      }

      const scheduledAtFormatted = scheduledDate
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");

      await db
        .update(video)
        .set({
          publishStatus: "scheduled",
          scheduledAt: scheduledAtFormatted,
          caption: input.caption ?? existingVideo.caption,
          updatedAt: now,
        })
        .where(eq(video.id, input.videoId));

      return { success: true, scheduledAt: scheduledAtFormatted };
    }),

  /**
   * Publish a draft or scheduled video immediately
   */
  publishVideo: protectedProcedure
    .input(
      z.object({
        videoId: z.number(),
        caption: z.string().max(500).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = Number(ctx.session.user.id);
      const now = new Date().toISOString().slice(0, 19).replace("T", " ");

      // Verify ownership
      const [existingVideo] = await db
        .select()
        .from(video)
        .where(and(eq(video.id, input.videoId), eq(video.idUser, userId)));

      if (!existingVideo) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found",
        });
      }

      // Check if video is ready
      if (existingVideo.transcodingStatus !== "ready") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Video is still processing",
        });
      }

      await db
        .update(video)
        .set({
          publishStatus: "published",
          scheduledAt: null,
          caption: input.caption ?? existingVideo.caption,
          updatedAt: now,
        })
        .where(eq(video.id, input.videoId));

      // Process hashtags from caption
      const finalCaption = input.caption ?? existingVideo.caption;
      if (finalCaption) {
        await processVideoHashtags(input.videoId, finalCaption);
      }

      return { success: true };
    }),

  /**
   * Cancel a scheduled video (convert back to draft)
   */
  cancelSchedule: protectedProcedure
    .input(
      z.object({
        videoId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = Number(ctx.session.user.id);
      const now = new Date().toISOString().slice(0, 19).replace("T", " ");

      // Verify ownership
      const [existingVideo] = await db
        .select()
        .from(video)
        .where(
          and(
            eq(video.id, input.videoId),
            eq(video.idUser, userId),
            eq(video.publishStatus, "scheduled"),
          ),
        );

      if (!existingVideo) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Scheduled video not found",
        });
      }

      await db
        .update(video)
        .set({
          publishStatus: "draft",
          scheduledAt: null,
          updatedAt: now,
        })
        .where(eq(video.id, input.videoId));

      return { success: true };
    }),

  /**
   * Update draft/scheduled video settings
   */
  updateVideoSettings: protectedProcedure
    .input(
      z.object({
        videoId: z.number(),
        caption: z.string().max(500).optional(),
        allowSharing: z.boolean().optional(),
        allowDuet: z.boolean().optional(),
        allowStitch: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = Number(ctx.session.user.id);
      const now = new Date().toISOString().slice(0, 19).replace("T", " ");

      // Verify ownership
      const [existingVideo] = await db
        .select()
        .from(video)
        .where(and(eq(video.id, input.videoId), eq(video.idUser, userId)));

      if (!existingVideo) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found",
        });
      }

      const updates: Record<string, unknown> = { updatedAt: now };

      if (input.caption !== undefined) updates.caption = input.caption;
      if (input.allowSharing !== undefined)
        updates.allowSharing = input.allowSharing ? 1 : 0;
      if (input.allowDuet !== undefined)
        updates.allowDuet = input.allowDuet ? 1 : 0;
      if (input.allowStitch !== undefined)
        updates.allowStitch = input.allowStitch ? 1 : 0;

      await db.update(video).set(updates).where(eq(video.id, input.videoId));

      return { success: true };
    }),

  // ============================================
  // Duet and Stitch Endpoints
  // ============================================

  /**
   * Create a duet/stitch relationship when uploading
   */
  createDuetStitch: protectedProcedure
    .input(
      z.object({
        videoId: z.number(), // the new video
        originalVideoId: z.number(), // the video being dueted/stitched
        type: z.enum(["duet", "stitch"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = Number(ctx.session.user.id);
      const now = new Date().toISOString().slice(0, 19).replace("T", " ");

      // Verify ownership of new video
      const [newVideo] = await db
        .select()
        .from(video)
        .where(and(eq(video.id, input.videoId), eq(video.idUser, userId)));

      if (!newVideo) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found",
        });
      }

      // Verify original video exists and allows duet/stitch
      const [originalVideo] = await db
        .select({
          id: video.id,
          allowDuet: video.allowDuet,
          allowStitch: video.allowStitch,
        })
        .from(video)
        .where(eq(video.id, input.originalVideoId));

      if (!originalVideo) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Original video not found",
        });
      }

      if (input.type === "duet" && originalVideo.allowDuet !== 1) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Duets are not allowed for this video",
        });
      }

      if (input.type === "stitch" && originalVideo.allowStitch !== 1) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Stitches are not allowed for this video",
        });
      }

      // Create relationship
      await db.insert(videoDuetStitch).values({
        idVideo: input.videoId,
        idOriginalVideo: input.originalVideoId,
        type: input.type,
        createdAt: now,
      });

      return { success: true };
    }),

  /**
   * Get duets/stitches for a video
   */
  getDuetsStitches: protectedProcedure
    .input(
      z.object({
        videoId: z.number(),
        type: z.enum(["duet", "stitch", "all"]).default("all"),
        limit: z.number().min(1).max(50).default(20),
        cursor: z.number().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const currentUserId = Number(ctx.session.user.id);

      const conditions = [eq(videoDuetStitch.idOriginalVideo, input.videoId)];

      if (input.type !== "all") {
        conditions.push(eq(videoDuetStitch.type, input.type));
      }

      const duetsStitches = await db
        .select({
          relationId: videoDuetStitch.id,
          type: videoDuetStitch.type,
          createdAt: videoDuetStitch.createdAt,
          videoId: video.id,
          videoCaption: video.caption,
          videoPlaybackId: video.playbackId,
          videoS3Url: video.s3Url,
          videoThumbnailUrl: video.thumbnailUrl,
          videoDuration: video.duration,
          videoLikeCount: video.likeCount,
          videoCommentCount: video.commentCount,
          creatorId: video.idUser,
          creatorName:
            sql<string>`CONCAT(${user.firstName}, ' ', COALESCE(${user.lastName}, ''))`.as(
              "creatorName",
            ),
          creatorImage: user.image,
          creatorIsInfluencer: user.isInfluencer,
        })
        .from(videoDuetStitch)
        .innerJoin(video, eq(videoDuetStitch.idVideo, video.id))
        .innerJoin(user, eq(video.idUser, user.id))
        .where(
          and(
            ...conditions,
            eq(video.transcodingStatus, "ready"),
            // sql`(${video.publishStatus} = 'published' OR ${video.publishStatus} IS NULL)`,
          ),
        )
        .orderBy(desc(videoDuetStitch.createdAt))
        .limit(input.limit + 1)
        .offset(input.cursor ? (input.cursor - 1) * input.limit : 0);

      // Check which videos current user has liked
      let likedVideoIds: number[] = [];
      if (currentUserId && duetsStitches.length > 0) {
        const videoIds = duetsStitches.map((d) => d.videoId);
        const likes = await db
          .select({ idVideo: videoLike.idVideo })
          .from(videoLike)
          .where(
            and(
              eq(videoLike.idUser, currentUserId),
              sql`${videoLike.idVideo} IN (${sql.join(
                videoIds.map((id) => sql`${id}`),
                sql`, `,
              )})`,
            ),
          );
        likedVideoIds = likes.map((l) => l.idVideo);
      }

      const hasMore = duetsStitches.length > input.limit;
      const items = hasMore ? duetsStitches.slice(0, -1) : duetsStitches;

      return {
        items: items.map((d) => ({
          relationId: d.relationId,
          type: d.type as "duet" | "stitch",
          createdAt: d.createdAt,
          video: {
            id: d.videoId,
            caption: d.videoCaption,
            playbackUrl: d.videoPlaybackId
              ? getPlaybackUrl(d.videoPlaybackId)
              : d.videoS3Url,
            thumbnailUrl: d.videoThumbnailUrl,
            duration: d.videoDuration,
            likeCount: d.videoLikeCount ?? 0,
            commentCount: d.videoCommentCount ?? 0,
            isLiked: likedVideoIds.includes(d.videoId),
            creator: {
              id: d.creatorId,
              name: d.creatorName.trim(),
              image: d.creatorImage,
              isInfluencer: d.creatorIsInfluencer === 1,
            },
          },
        })),
        nextCursor: hasMore ? (input.cursor ?? 1) + 1 : null,
      };
    }),

  /**
   * Get the original video for a duet/stitch
   */
  getOriginalVideo: protectedProcedure
    .input(
      z.object({
        videoId: z.number(),
      }),
    )
    .query(async ({ input }) => {
      // Check if this video is a duet/stitch
      const [relation] = await db
        .select({
          type: videoDuetStitch.type,
          originalVideoId: videoDuetStitch.idOriginalVideo,
        })
        .from(videoDuetStitch)
        .where(eq(videoDuetStitch.idVideo, input.videoId));

      if (!relation) {
        return { isReaction: false, original: null };
      }

      // Get original video details
      const [originalVideo] = await db
        .select({
          id: video.id,
          caption: video.caption,
          playbackId: video.playbackId,
          s3Url: video.s3Url,
          thumbnailUrl: video.thumbnailUrl,
          duration: video.duration,
          likeCount: video.likeCount,
          creatorId: video.idUser,
          creatorName:
            sql<string>`CONCAT(${user.firstName}, ' ', COALESCE(${user.lastName}, ''))`.as(
              "creatorName",
            ),
          creatorImage: user.image,
        })
        .from(video)
        .innerJoin(user, eq(video.idUser, user.id))
        .where(eq(video.id, relation.originalVideoId));

      if (!originalVideo) {
        return { isReaction: true, type: relation.type, original: null };
      }

      return {
        isReaction: true,
        type: relation.type as "duet" | "stitch",
        original: {
          id: originalVideo.id,
          caption: originalVideo.caption,
          playbackId: originalVideo.playbackId,
          playbackUrl: originalVideo.playbackId
            ? getPlaybackUrl(originalVideo.playbackId)
            : originalVideo.s3Url,
          thumbnailUrl: originalVideo.thumbnailUrl,
          duration: originalVideo.duration,
          likeCount: originalVideo.likeCount ?? 0,
          creator: {
            id: originalVideo.creatorId,
            name: originalVideo.creatorName.trim(),
            image: originalVideo.creatorImage,
          },
        },
      };
    }),

  /**
   * Get count of duets and stitches for a video
   */
  getDuetStitchCounts: publicProcedure
    .input(
      z.object({
        videoId: z.number(),
      }),
    )
    .query(async ({ input }) => {
      const [counts] = await db
        .select({
          duetCount:
            sql<number>`SUM(CASE WHEN ${videoDuetStitch.type} = 'duet' THEN 1 ELSE 0 END)`.as(
              "duetCount",
            ),
          stitchCount:
            sql<number>`SUM(CASE WHEN ${videoDuetStitch.type} = 'stitch' THEN 1 ELSE 0 END)`.as(
              "stitchCount",
            ),
        })
        .from(videoDuetStitch)
        .where(eq(videoDuetStitch.idOriginalVideo, input.videoId));

      return {
        duetCount: Number(counts?.duetCount ?? 0),
        stitchCount: Number(counts?.stitchCount ?? 0),
        totalCount:
          Number(counts?.duetCount ?? 0) + Number(counts?.stitchCount ?? 0),
      };
    }),
} satisfies TRPCRouterRecord;
