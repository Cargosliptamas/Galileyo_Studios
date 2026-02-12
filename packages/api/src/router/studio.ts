import type { TRPCRouterRecord } from "@trpc/server";
import { and, count, desc, eq, gte, inArray, lte, or, sql } from "drizzle-orm";
import { z } from "zod/v4";

import { db } from "@galileyo/db/client";
import {
  comment,
  follower,
  smsPool,
  subscription,
  user,
  video,
  videoComment,
  videoLike,
  videoShare,
  videoView,
} from "@galileyo/db/schema";

import { protectedProcedure } from "../trpc";

// Helper to get date range
function getDateRange(period: "7d" | "30d" | "90d" | "all") {
  const now = new Date();
  let startDate: Date;

  switch (period) {
    case "7d":
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "30d":
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case "90d":
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case "all":
    default:
      startDate = new Date(0);
      break;
  }

  return { start: startDate, end: now };
}

// Helper to calculate trend percentage
function calculateTrend(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

const PeriodSchema = z.enum(["7d", "30d", "90d", "all"]);
const ContentTypeSchema = z.enum(["all", "video", "post"]);
const ContentStatusSchema = z.enum([
  "all",
  "published",
  "draft",
  "scheduled",
  "processing",
]);
const SortBySchema = z.enum(["date", "views", "engagement", "duration"]);
const SortOrderSchema = z.enum(["asc", "desc"]);

export const studioRouter = {
  /**
   * Get dashboard stats for the studio
   */
  getDashboardStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = Number(ctx.session.user.id);
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Get current period stats
    const [currentViews] = await db
      .select({ count: count() })
      .from(videoView)
      .innerJoin(video, eq(videoView.idVideo, video.id))
      .where(
        and(
          eq(video.idUser, userId),
          gte(videoView.createdAt, weekAgo.toISOString()),
        ),
      );

    const [currentLikes] = await db
      .select({ count: count() })
      .from(videoLike)
      .innerJoin(video, eq(videoLike.idVideo, video.id))
      .where(
        and(
          eq(video.idUser, userId),
          gte(videoLike.createdAt, weekAgo.toISOString()),
        ),
      );

    const [currentComments] = await db
      .select({ count: count() })
      .from(videoComment)
      .innerJoin(video, eq(videoComment.idVideo, video.id))
      .where(
        and(
          eq(video.idUser, userId),
          gte(videoComment.createdAt, weekAgo.toISOString()),
        ),
      );

    const [currentShares] = await db
      .select({ count: count() })
      .from(videoShare)
      .innerJoin(video, eq(videoShare.idVideo, video.id))
      .where(
        and(
          eq(video.idUser, userId),
          gte(videoShare.createdAt, weekAgo.toISOString()),
        ),
      );

    const [currentFollowers] = await db
      .select({ count: count() })
      .from(follower)
      .where(eq(follower.idUserFollower, userId));

    const [newFollowers] = await db
      .select({ count: count() })
      .from(follower)
      .where(
        and(
          eq(follower.idUserFollower, userId),
          gte(follower.createdAt, weekAgo.toISOString()),
        ),
      );

    // Get previous period stats for trend calculation
    const [previousViews] = await db
      .select({ count: count() })
      .from(videoView)
      .innerJoin(video, eq(videoView.idVideo, video.id))
      .where(
        and(
          eq(video.idUser, userId),
          gte(videoView.createdAt, twoWeeksAgo.toISOString()),
          lte(videoView.createdAt, weekAgo.toISOString()),
        ),
      );

    const [previousFollowers] = await db
      .select({ count: count() })
      .from(follower)
      .where(
        and(
          eq(follower.idUserFollower, userId),
          gte(follower.createdAt, twoWeeksAgo.toISOString()),
          lte(follower.createdAt, weekAgo.toISOString()),
        ),
      );

    // Calculate trends
    const viewsTrend = calculateTrend(
      currentViews?.count ?? 0,
      previousViews?.count ?? 0,
    );
    const followerGrowth = calculateTrend(
      newFollowers?.count ?? 0,
      previousFollowers?.count ?? 0,
    );

    return {
      views: {
        total: currentViews?.count ?? 0,
        trend: viewsTrend,
      },
      engagement: {
        likes: currentLikes?.count ?? 0,
        comments: currentComments?.count ?? 0,
        shares: currentShares?.count ?? 0,
        trend: 0, // Would calculate engagement trend
      },
      followers: {
        total: currentFollowers?.count ?? 0,
        growth: followerGrowth,
      },
    };
  }),

  /**
   * Get quick stats for the dashboard
   */
  getQuickStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = Number(ctx.session.user.id);
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Published this week
    const [publishedThisWeek] = await db
      .select({ count: count() })
      .from(video)
      .where(
        and(
          eq(video.idUser, userId),
          eq(video.publishStatus, "published"), // Published
          gte(video.createdAt, weekAgo.toISOString()),
        ),
      );

    // Scheduled upcoming
    const [scheduledUpcoming] = await db
      .select({ count: count() })
      .from(video)
      .where(
        and(
          eq(video.idUser, userId),
          eq(video.publishStatus, "scheduled"), // Scheduled
          gte(video.createdAt, now.toISOString()),
        ),
      );

    // Drafts pending
    const [draftsPending] = await db
      .select({ count: count() })
      .from(video)
      .where(
        and(
          eq(video.idUser, userId),
          eq(video.publishStatus, "draft"), // Draft
        ),
      );

    // Comments awaiting reply (comments from others on user's videos without a reply)
    const [pendingComments] = await db
      .select({ count: count() })
      .from(videoComment)
      .innerJoin(video, eq(videoComment.idVideo, video.id))
      .where(
        and(eq(video.idUser, userId), sql`${videoComment.idUser} != ${userId}`),
      );

    return {
      publishedThisWeek: publishedThisWeek?.count ?? 0,
      scheduledUpcoming: scheduledUpcoming?.count ?? 0,
      draftsPending: draftsPending?.count ?? 0,
      commentsAwaitingReply: pendingComments?.count ?? 0,
    };
  }),

  /**
   * Get recent activity for the dashboard
   */
  getRecentActivity: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = Number(ctx.session.user.id);

      // Get recent comments on user's videos
      const recentComments = await db
        .select({
          id: videoComment.id,
          content: videoComment.content,
          createdAt: videoComment.createdAt,
          userName: user.firstName,
          userImage: user.image,
          videoId: video.id,
          videoTitle: video.caption,
        })
        .from(videoComment)
        .innerJoin(video, eq(videoComment.idVideo, video.id))
        .innerJoin(user, eq(videoComment.idUser, user.id))
        .where(
          and(
            eq(video.idUser, userId),
            sql`${videoComment.idUser} != ${userId}`,
          ),
        )
        .orderBy(desc(videoComment.createdAt))
        .limit(input.limit);

      // Get recent followers
      const recentFollowers = await db
        .select({
          id: follower.id,
          createdAt: follower.createdAt,
          userName: user.firstName,
          userImage: user.image,
        })
        .from(follower)
        .innerJoin(user, eq(follower.idUserFollower, user.id))
        .where(eq(follower.idUserFollower, userId))
        .orderBy(desc(follower.createdAt))
        .limit(input.limit);

      // Combine and sort activities
      const activities = [
        ...recentComments.map((c) => ({
          id: `comment-${c.id}`,
          type: "comment" as const,
          message: `commented on your video`,
          timestamp: c.createdAt,
          user: { name: c.userName, image: c.userImage ?? undefined },
          targetId: String(c.videoId),
          targetType: "video" as const,
        })),
        ...recentFollowers.map((f) => ({
          id: `follow-${f.id}`,
          type: "follow" as const,
          message: "started following you",
          timestamp: f.createdAt,
          user: { name: f.userName, image: f.userImage ?? undefined },
        })),
      ]
        .sort((a, b) => {
          const aTime = a.timestamp ? new Date(a.timestamp).getTime() : 0;
          const bTime = b.timestamp ? new Date(b.timestamp).getTime() : 0;
          return bTime - aTime;
        })
        .slice(0, input.limit);

      return activities;
    }),

  /**
   * Get top performing content
   */
  getTopContent: protectedProcedure
    .input(
      z.object({
        period: PeriodSchema.default("7d"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = Number(ctx.session.user.id);
      const { start } = getDateRange(input.period);

      // Get top video
      const [topVideo] = await db
        .select({
          id: video.id,
          title: video.caption,
          thumbnail: video.thumbnailUrl,
          views: video.viewCount,
          likes: video.likeCount,
          comments: video.commentCount,
        })
        .from(video)
        .where(
          and(
            eq(video.idUser, userId),
            eq(video.publishStatus, "published"),
            gte(video.createdAt, start.toISOString()),
          ),
        )
        .orderBy(desc(video.viewCount))
        .limit(1);

      // Get top post
      const [topPost] = await db
        .select({
          id: smsPool.id,
          title: smsPool.body,
          // views: smsPool.viewCount,
          // likes: smsPool.likeCount,
          // comments: smsPool.commentCount,
        })
        .from(smsPool)
        .where(
          and(
            eq(smsPool.idUser, userId),
            eq(smsPool.status, 10),
            gte(smsPool.createdAt, start.toISOString()),
          ),
        )
        .orderBy(desc(smsPool.createdAt))
        .limit(1);

      return {
        topVideo: topVideo
          ? {
              id: String(topVideo.id),
              type: "video" as const,
              title: topVideo.title ?? "Untitled",
              thumbnail: topVideo.thumbnail ?? undefined,
              views: topVideo.views ?? 0,
              likes: topVideo.likes ?? 0,
              comments: topVideo.comments ?? 0,
            }
          : null,
        topPost: topPost
          ? {
              id: String(topPost.id),
              type: "post" as const,
              title: topPost.title,
              // TODO: Add views, likes, comments
              views: 0,
              likes: 0,
              comments: 0,
            }
          : null,
      };
    }),

  /**
   * Get content library items
   */
  getContentLibrary: protectedProcedure
    .input(
      z.object({
        type: ContentTypeSchema.default("all"),
        status: ContentStatusSchema.default("all"),
        sortBy: SortBySchema.default("date"),
        sortOrder: SortOrderSchema.default("desc"),
        cursor: z.number().optional(),
        limit: z.number().min(1).max(100).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = Number(ctx.session.user.id);

      // Map status to database values
      const statusMap = {
        draft: 0,
        scheduled: 5,
        published: 10,
        processing: 1,
      };

      const items: {
        id: string;
        type: "video" | "post";
        title: string;
        thumbnail?: string;
        status: "published" | "draft" | "scheduled" | "processing";
        publishedAt?: Date;
        scheduledAt?: Date;
        createdAt: Date;
        views: number;
        likes: number;
        comments: number;
        duration?: number;
      }[] = [];

      // Get videos if type is all or video
      if (input.type === "all" || input.type === "video") {
        let videoQuery = db
          .select({
            id: video.id,
            caption: video.caption,
            thumbnail: video.thumbnailUrl,
            status: video.publishStatus,
            publishAt: video.scheduledAt,
            scheduledAt: video.scheduledAt,
            createdAt: video.createdAt,
            viewCount: video.viewCount,
            likeCount: video.likeCount,
            commentCount: video.commentCount,
            duration: video.duration,
          })
          .from(video)
          .where(eq(video.idUser, userId))
          .$dynamic();

        // Apply status filter
        if (input.status !== "all") {
          videoQuery = videoQuery.where(eq(video.publishStatus, input.status));
        }

        const videos = await videoQuery
          .orderBy(desc(video.createdAt))
          .limit(input.limit);

        items.push(
          ...videos.map((v) => ({
            id: String(v.id),
            type: "video" as const,
            title: v.caption ?? "Untitled",
            thumbnail: v.thumbnail ?? undefined,
            status:
              v.status === "published"
                ? ("published" as const)
                : v.status === "scheduled"
                  ? ("scheduled" as const)
                  : v.status === "draft"
                    ? ("draft" as const)
                    : ("processing" as const),
            publishedAt:
              v.status === "published" && v.publishAt
                ? new Date(v.publishAt)
                : undefined,
            scheduledAt:
              v.status === "scheduled" && v.scheduledAt
                ? new Date(v.scheduledAt)
                : undefined,
            createdAt: v.createdAt ? new Date(v.createdAt) : new Date(),
            views: v.viewCount ?? 0,
            likes: v.likeCount ?? 0,
            comments: v.commentCount ?? 0,
            duration: v.duration ?? undefined,
          })),
        );
      }

      // Get posts if type is all or post
      if (input.type === "all" || input.type === "post") {
        let postQuery = db
          .select({
            id: smsPool.id,
            body: smsPool.body,
            status: smsPool.status,
            createdAt: smsPool.createdAt,
            // viewCount: smsPool.viewCount,
            // likeCount: smsPool.likeCount,
            // commentCount: smsPool.commentCount,
          })
          .from(smsPool)
          .where(eq(smsPool.idUser, userId))
          .$dynamic();

        // Apply status filter
        if (input.status !== "all") {
          postQuery = postQuery.where(
            eq(smsPool.status, statusMap[input.status]),
          );
        }

        const posts = await postQuery
          .orderBy(desc(smsPool.createdAt))
          .limit(input.limit);

        items.push(
          ...posts.map((p) => ({
            id: String(p.id),
            type: "post" as const,
            title: p.body,
            status:
              p.status === 1
                ? ("published" as const)
                : p.status === 5
                  ? ("scheduled" as const)
                  : ("draft" as const),
            createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
            // TODO: Add views, likes, comments
            views: 0,
            likes: 0,
            comments: 0,
          })),
        );
      }

      // Sort items
      items.sort((a, b) => {
        let comparison = 0;
        switch (input.sortBy) {
          case "date":
            comparison = a.createdAt.getTime() - b.createdAt.getTime();
            break;
          case "views":
            comparison = a.views - b.views;
            break;
          case "engagement":
            comparison = a.likes + a.comments - (b.likes + b.comments);
            break;
          case "duration":
            comparison = (a.duration ?? 0) - (b.duration ?? 0);
            break;
        }
        return input.sortOrder === "desc" ? -comparison : comparison;
      });

      return {
        items: items.slice(0, input.limit),
        nextCursor: items.length > input.limit ? input.limit : null,
      };
    }),

  /**
   * Get calendar events
   */
  getCalendarEvents: protectedProcedure
    .input(
      z.object({
        start: z.coerce.date(),
        end: z.coerce.date(),
        types: z.array(z.enum(["video", "post"])).optional(),
        includePublished: z.boolean().default(true),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = Number(ctx.session.user.id);
      const events: {
        id: string;
        title: string;
        type: "video" | "post";
        status: "published" | "scheduled" | "draft";
        start: Date;
        thumbnail?: string;
      }[] = [];

      const includeVideos = !input.types || input.types.includes("video");
      const includePosts = !input.types || input.types.includes("post");

      if (includeVideos) {
        const videos = await db
          .select({
            id: video.id,
            caption: video.caption,
            thumbnail: video.thumbnailUrl,
            status: video.publishStatus,
            publishAt: video.createdAt,
          })
          .from(video)
          .where(
            and(
              eq(video.idUser, userId),
              gte(video.createdAt, input.start.toISOString()),
              lte(video.createdAt, input.end.toISOString()),
              input.includePublished
                ? or(
                    eq(video.publishStatus, "published"),
                    eq(video.publishStatus, "scheduled"),
                  )
                : eq(video.publishStatus, "scheduled"),
            ),
          );

        events.push(
          ...videos.map((v) => ({
            id: String(v.id),
            title: v.caption ?? "Untitled",
            type: "video" as const,
            status:
              v.status === "published"
                ? ("published" as const)
                : ("scheduled" as const),
            start: v.publishAt ? new Date(v.publishAt) : new Date(),
            thumbnail: v.thumbnail ?? undefined,
          })),
        );
      }

      if (includePosts) {
        const posts = await db
          .select({
            id: smsPool.id,
            body: smsPool.body,
            status: smsPool.status,
            createdAt: smsPool.createdAt,
          })
          .from(smsPool)
          .where(
            and(
              eq(smsPool.idUser, userId),
              gte(smsPool.createdAt, input.start.toISOString()),
              lte(smsPool.createdAt, input.end.toISOString()),
              eq(smsPool.status, 1),
            ),
          );

        events.push(
          ...posts.map((p) => ({
            id: String(p.id),
            title: p.body,
            type: "post" as const,
            status:
              p.status === 10 ? ("published" as const) : ("scheduled" as const),
            start: p.createdAt ? new Date(p.createdAt) : new Date(),
          })),
        );
      }

      return events;
    }),

  /**
   * Get inbox items (comments, mentions, etc.)
   */
  getInboxItems: protectedProcedure
    .input(
      z.object({
        type: z
          .enum(["all", "video_comments", "post_comments", "mentions"])
          .default("all"),
        status: z.enum(["all", "unread", "read"]).default("all"),
        cursor: z.string().optional(),
        limit: z.number().min(1).max(50).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = Number(ctx.session.user.id);

      const items: {
        id: string;
        type: "video_comment" | "post_comment" | "mention" | "like";
        isRead: boolean;
        user: { id: string; name: string; image?: string };
        content: string;
        target: {
          id: string;
          type: "video" | "post";
          title: string;
          thumbnail?: string;
        };
        createdAt: Date;
      }[] = [];

      // Get video comments
      if (input.type === "all" || input.type === "video_comments") {
        const videoComments = await db
          .select({
            id: videoComment.id,
            content: videoComment.content,
            createdAt: videoComment.createdAt,
            userId: user.id,
            userName: user.firstName,
            userImage: user.image,
            videoId: video.id,
            videoTitle: video.caption,
            videoThumbnail: video.thumbnailUrl,
          })
          .from(videoComment)
          .innerJoin(video, eq(videoComment.idVideo, video.id))
          .innerJoin(user, eq(videoComment.idUser, user.id))
          .where(
            and(
              eq(video.idUser, userId),
              sql`${videoComment.idUser} != ${userId}`,
            ),
          )
          .orderBy(desc(videoComment.createdAt))
          .limit(input.limit);

        items.push(
          ...videoComments.map((c) => ({
            id: String(c.id),
            type: "video_comment" as const,
            isRead: false, // Would track read status in a separate table
            user: {
              id: String(c.userId),
              name: c.userName,
              image: c.userImage ?? undefined,
            },
            content: c.content,
            target: {
              id: String(c.videoId),
              type: "video" as const,
              title: c.videoTitle ?? "Untitled",
              thumbnail: c.videoThumbnail ?? undefined,
            },
            createdAt: c.createdAt ? new Date(c.createdAt) : new Date(),
          })),
        );
      }

      // Get post comments
      if (input.type === "all" || input.type === "post_comments") {
        const postComments = await db
          .select({
            id: comment.id,
            content: smsPool.body,
            createdAt: comment.createdAt,
            userId: user.id,
            userName: user.firstName,
            userImage: user.image,
            postId: smsPool.id,
            postTitle: smsPool.body,
          })
          .from(comment)
          .innerJoin(smsPool, eq(comment.idSmsPool, smsPool.id))
          .innerJoin(user, eq(comment.idUser, user.id))
          .where(
            and(
              eq(smsPool.idUser, userId),
              sql`${comment.idUser} != ${userId}`,
            ),
          )
          .orderBy(desc(comment.createdAt))
          .limit(input.limit);

        items.push(
          ...postComments.map((c) => ({
            id: String(c.id),
            type: "post_comment" as const,
            isRead: false,
            user: {
              id: String(c.userId),
              name: c.userName,
              image: c.userImage ?? undefined,
            },
            content: c.content,
            target: {
              id: String(c.postId),
              type: "post" as const,
              title: c.postTitle,
            },
            createdAt: c.createdAt ? new Date(c.createdAt) : new Date(),
          })),
        );
      }

      // Sort by date
      items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      return {
        items: items.slice(0, input.limit),
        nextCursor:
          items.length > input.limit ? items[input.limit - 1]?.id : null,
        unreadCount: items.filter((i) => !i.isRead).length,
      };
    }),

  /**
   * Get unread counts for inbox
   */
  getUnreadCounts: protectedProcedure.query(async ({ ctx }) => {
    const userId = Number(ctx.session.user.id);

    const [videoCommentsCount] = await db
      .select({ count: count() })
      .from(videoComment)
      .innerJoin(video, eq(videoComment.idVideo, video.id))
      .where(
        and(eq(video.idUser, userId), sql`${videoComment.idUser} != ${userId}`),
      );

    const [postCommentsCount] = await db
      .select({ count: count() })
      .from(comment)
      .innerJoin(smsPool, eq(comment.idSmsPool, smsPool.id))
      .where(
        and(eq(smsPool.idUser, userId), sql`${comment.idUser} != ${userId}`),
      );

    return {
      total: (videoCommentsCount?.count ?? 0) + (postCommentsCount?.count ?? 0),
      videoComments: videoCommentsCount?.count ?? 0,
      postComments: postCommentsCount?.count ?? 0,
      mentions: 0,
      notifications: 0,
    };
  }),

  /**
   * Get user's feeds
   */
  getFeeds: protectedProcedure.query(async ({ ctx }) => {
    const userId = Number(ctx.session.user.id);

    const feeds = await db
      .select({
        id: subscription.id,
        name: subscription.name,
        description: subscription.description,
        isPublic: subscription.isPublic,
        // createdAt: subscription.createdAt,
      })
      .from(subscription)
      .where(eq(subscription.idUser, userId));

    // Get subscriber counts for each feed
    const feedsWithCounts = await Promise.all(
      feeds.map(async (feed) => {
        const [subscriberCount] = await db
          .select({ count: count() })
          .from(follower)
          .where(eq(follower.idFollowerList, feed.id));

        return {
          id: String(feed.id),
          name: feed.name,
          description: feed.description ?? "",
          type: feed.isPublic ? ("influencer" as const) : ("private" as const),
          isPublic: feed.isPublic,
          subscriberCount: subscriberCount?.count ?? 0,
          contentCount: 0, // Would count posts in feed
          createdAt: undefined,
        };
      }),
    );

    return {
      influencerFeeds: feedsWithCounts.filter((f) => f.type === "influencer"),
      privateFeeds: feedsWithCounts.filter((f) => f.type === "private"),
    };
  }),

  /**
   * Batch delete content
   */
  batchDelete: protectedProcedure
    .input(
      z.object({
        items: z.array(
          z.object({
            id: z.string(),
            type: z.enum(["video", "post"]),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = Number(ctx.session.user.id);

      const videoIds = input.items
        .filter((i) => i.type === "video")
        .map((i) => Number(i.id));
      const postIds = input.items
        .filter((i) => i.type === "post")
        .map((i) => Number(i.id));

      if (videoIds.length > 0) {
        await db
          .delete(video)
          .where(and(eq(video.idUser, userId), inArray(video.id, videoIds)));
      }

      if (postIds.length > 0) {
        await db
          .delete(smsPool)
          .where(and(eq(smsPool.idUser, userId), inArray(smsPool.id, postIds)));
      }

      return { deleted: input.items.length };
    }),

  /**
   * Batch publish content
   */
  batchPublish: protectedProcedure
    .input(
      z.object({
        items: z.array(
          z.object({
            id: z.string(),
            type: z.enum(["video", "post"]),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = Number(ctx.session.user.id);

      const videoIds = input.items
        .filter((i) => i.type === "video")
        .map((i) => Number(i.id));
      const postIds = input.items
        .filter((i) => i.type === "post")
        .map((i) => Number(i.id));

      if (videoIds.length > 0) {
        await db
          .update(video)
          .set({ publishStatus: "published" })
          .where(and(eq(video.idUser, userId), inArray(video.id, videoIds)));
      }

      if (postIds.length > 0) {
        await db
          .update(smsPool)
          .set({ status: 10 })
          .where(and(eq(smsPool.idUser, userId), inArray(smsPool.id, postIds)));
      }

      return { published: input.items.length };
    }),

  /**
   * Batch schedule content
   */
  batchSchedule: protectedProcedure
    .input(
      z.object({
        items: z.array(
          z.object({
            id: z.string(),
            type: z.enum(["video", "post"]),
            scheduledAt: z.coerce.date(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = Number(ctx.session.user.id);

      for (const item of input.items) {
        if (item.type === "video") {
          await db
            .update(video)
            .set({
              publishStatus: "scheduled",
              scheduledAt: item.scheduledAt.toISOString(),
            })
            .where(
              and(eq(video.idUser, userId), eq(video.id, Number(item.id))),
            );
        } else {
          await db
            .update(smsPool)
            .set({ status: 5 })
            .where(
              and(eq(smsPool.idUser, userId), eq(smsPool.id, Number(item.id))),
            );
        }
      }

      return { scheduled: input.items.length };
    }),
} satisfies TRPCRouterRecord;
