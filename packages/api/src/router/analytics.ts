import type { TRPCRouterRecord } from "@trpc/server";
import { and, count, desc, eq, gte, lte, sql } from "drizzle-orm";
import { z } from "zod/v4";

import { db } from "@galileyo/db/client";
import {
  comment,
  follower,
  followerList,
  postView,
  smsPool,
  smsPoolPhoto,
  smsPoolReaction,
  user,
  video,
  videoLike,
  videoShare,
  videoView,
} from "@galileyo/db/schema";

import { protectedProcedure } from "../trpc";

// Helper to get date range based on time range
function getDateRange(timeRange: "day" | "week" | "month" | "year" | "all") {
  const now = new Date();
  let startDate: Date;

  switch (timeRange) {
    case "day":
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case "week":
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "month":
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case "year":
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    case "all":
    default:
      startDate = new Date(0); // Beginning of time
      break;
  }

  return {
    start: startDate.toISOString().slice(0, 19).replace("T", " "),
    end: now.toISOString().slice(0, 19).replace("T", " "),
  };
}

// Helper to get previous period date range
function getPreviousPeriodRange(
  timeRange: "day" | "week" | "month" | "year" | "all",
) {
  const now = new Date();
  let duration: number;

  switch (timeRange) {
    case "day":
      duration = 24 * 60 * 60 * 1000;
      break;
    case "week":
      duration = 7 * 24 * 60 * 60 * 1000;
      break;
    case "month":
      duration = 30 * 24 * 60 * 60 * 1000;
      break;
    case "year":
      duration = 365 * 24 * 60 * 60 * 1000;
      break;
    case "all":
    default:
      return null;
  }

  const currentStart = new Date(now.getTime() - duration);
  const previousStart = new Date(currentStart.getTime() - duration);

  return {
    start: previousStart.toISOString().slice(0, 19).replace("T", " "),
    end: currentStart.toISOString().slice(0, 19).replace("T", " "),
  };
}

const TimeRangeSchema = z.enum(["day", "week", "month", "year", "all"]);

export const analyticsRouter = {
  /**
   * Get overview analytics for the current user
   */
  getOverview: protectedProcedure
    .input(
      z.object({
        timeRange: TimeRangeSchema.default("week"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = Number(ctx.session.user.id);
      const dateRange = getDateRange(input.timeRange);
      const previousRange = getPreviousPeriodRange(input.timeRange);

      // Get video stats for current period
      const [videoStats] = await db
        .select({
          totalViews: sql<number>`COALESCE(SUM(${video.viewCount}), 0)`,
          totalLikes: sql<number>`COALESCE(SUM(${video.likeCount}), 0)`,
          totalComments: sql<number>`COALESCE(SUM(${video.commentCount}), 0)`,
          totalShares: sql<number>`COALESCE(SUM(${video.shareCount}), 0)`,
          videoCount: count(),
        })
        .from(video)
        .where(
          and(
            eq(video.idUser, userId),
            gte(video.createdAt, dateRange.start),
            lte(video.createdAt, dateRange.end),
          ),
        );

      // Get post stats for current period
      const [postStats] = await db
        .select({
          postCount: count(),
        })
        .from(smsPool)
        .where(
          and(
            eq(smsPool.idUser, userId),
            gte(smsPool.createdAt, dateRange.start),
            lte(smsPool.createdAt, dateRange.end),
          ),
        );

      // Get post reactions count
      const [postReactions] = await db
        .select({
          totalReactions: count(),
        })
        .from(smsPoolReaction)
        .innerJoin(smsPool, eq(smsPoolReaction.idSmsPool, smsPool.id))
        .where(
          and(
            eq(smsPool.idUser, userId),
            gte(smsPoolReaction.createdAt, dateRange.start),
            lte(smsPoolReaction.createdAt, dateRange.end),
          ),
        );

      // Get post views count
      const [postViewStats] = await db
        .select({
          totalViews: count(),
        })
        .from(postView)
        .innerJoin(smsPool, eq(postView.idSmsPool, smsPool.id))
        .where(
          and(
            eq(smsPool.idUser, userId),
            gte(postView.createdAt, dateRange.start),
            lte(postView.createdAt, dateRange.end),
          ),
        );

      // Get post comments count
      const [postComments] = await db
        .select({
          totalComments: count(),
        })
        .from(comment)
        .innerJoin(smsPool, eq(comment.idSmsPool, smsPool.id))
        .where(
          and(
            eq(smsPool.idUser, userId),
            gte(comment.createdAt, dateRange.start),
            lte(comment.createdAt, dateRange.end),
          ),
        );

      // Get follower count
      const [followerStats] = await db
        .select({
          followerCount: count(),
        })
        .from(follower)
        .where(eq(follower.idUserLeader, userId));

      // Calculate totals
      const totalViews =
        Number(videoStats?.totalViews ?? 0) +
        Number(postViewStats?.totalViews ?? 0);
      const totalLikes =
        Number(videoStats?.totalLikes ?? 0) +
        Number(postReactions?.totalReactions ?? 0);
      const totalComments =
        Number(videoStats?.totalComments ?? 0) +
        Number(postComments?.totalComments ?? 0);
      const totalShares = Number(videoStats?.totalShares ?? 0);

      // Calculate changes (compared to previous period)
      let viewsChange = 0;
      let likesChange = 0;
      let commentsChange = 0;
      let sharesChange = 0;

      if (previousRange) {
        // Get previous period video stats
        const [prevVideoStats] = await db
          .select({
            totalViews: sql<number>`COALESCE(SUM(${video.viewCount}), 0)`,
            totalLikes: sql<number>`COALESCE(SUM(${video.likeCount}), 0)`,
            totalComments: sql<number>`COALESCE(SUM(${video.commentCount}), 0)`,
            totalShares: sql<number>`COALESCE(SUM(${video.shareCount}), 0)`,
          })
          .from(video)
          .where(
            and(
              eq(video.idUser, userId),
              gte(video.createdAt, previousRange.start),
              lte(video.createdAt, previousRange.end),
            ),
          );

        const prevViews = Number(prevVideoStats?.totalViews ?? 0);
        const prevLikes = Number(prevVideoStats?.totalLikes ?? 0);
        const prevComments = Number(prevVideoStats?.totalComments ?? 0);
        const prevShares = Number(prevVideoStats?.totalShares ?? 0);

        if (prevViews > 0)
          viewsChange = ((totalViews - prevViews) / prevViews) * 100;
        if (prevLikes > 0)
          likesChange = ((totalLikes - prevLikes) / prevLikes) * 100;
        if (prevComments > 0)
          commentsChange =
            ((totalComments - prevComments) / prevComments) * 100;
        if (prevShares > 0)
          sharesChange = ((totalShares - prevShares) / prevShares) * 100;
      }

      return {
        totalViews,
        totalLikes,
        totalComments,
        totalShares,
        followerCount: Number(followerStats?.followerCount ?? 0),
        videoCount: Number(videoStats?.videoCount ?? 0),
        postCount: Number(postStats?.postCount ?? 0),
        viewsChange: Math.round(viewsChange * 10) / 10,
        likesChange: Math.round(likesChange * 10) / 10,
        commentsChange: Math.round(commentsChange * 10) / 10,
        sharesChange: Math.round(sharesChange * 10) / 10,
      };
    }),

  /**
   * Get video-specific stats
   */
  getVideoStats: protectedProcedure
    .input(
      z.object({
        videoId: z.number().optional(),
        timeRange: TimeRangeSchema.default("week"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = Number(ctx.session.user.id);
      const dateRange = getDateRange(input.timeRange);

      const conditions = [
        eq(video.idUser, userId),
        gte(video.createdAt, dateRange.start),
        lte(video.createdAt, dateRange.end),
      ];

      if (input.videoId) {
        conditions.push(eq(video.id, input.videoId));
      }

      const videos = await db
        .select({
          id: video.id,
          caption: video.caption,
          thumbnailUrl: video.thumbnailUrl,
          viewCount: video.viewCount,
          likeCount: video.likeCount,
          commentCount: video.commentCount,
          shareCount: video.shareCount,
          duration: video.duration,
          createdAt: video.createdAt,
        })
        .from(video)
        .where(and(...conditions))
        .orderBy(desc(video.viewCount))
        .limit(input.videoId ? 1 : 50);

      // Get average watch duration for each video
      const videoIds = videos.map((v) => v.id);
      let avgWatchDurations: Record<number, number> = {};

      if (videoIds.length > 0) {
        const watchStats = await db
          .select({
            idVideo: videoView.idVideo,
            avgDuration: sql<number>`AVG(${videoView.watchDuration})`,
          })
          .from(videoView)
          .where(
            sql`${videoView.idVideo} IN (${sql.join(
              videoIds.map((id) => sql`${id}`),
              sql`, `,
            )})`,
          )
          .groupBy(videoView.idVideo);

        avgWatchDurations = Object.fromEntries(
          watchStats.map((s) => [s.idVideo, Number(s.avgDuration)]),
        );
      }

      return {
        videos: videos.map((v) => {
          const avgWatchDuration = avgWatchDurations[v.id] ?? 0;
          const duration = v.duration ?? 0;
          const completionRate =
            duration > 0 ? (avgWatchDuration / duration) * 100 : 0;

          return {
            id: v.id,
            caption: v.caption,
            thumbnailUrl: v.thumbnailUrl,
            views: v.viewCount ?? 0,
            likes: v.likeCount ?? 0,
            comments: v.commentCount ?? 0,
            shares: v.shareCount ?? 0,
            avgWatchDuration: Math.round(avgWatchDuration),
            completionRate: Math.min(Math.round(completionRate * 10) / 10, 100),
            createdAt: v.createdAt,
          };
        }),
      };
    }),

  /**
   * Get engagement timeline data
   */
  getEngagementTimeline: protectedProcedure
    .input(
      z.object({
        timeRange: TimeRangeSchema.default("week"),
        contentType: z.enum(["all", "videos", "posts"]).default("all"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = Number(ctx.session.user.id);
      const dateRange = getDateRange(input.timeRange);

      // Determine grouping interval based on time range
      let dateFormat: string;
      switch (input.timeRange) {
        case "day":
          dateFormat = "%Y-%m-%d %H:00:00"; // Hourly
          break;
        case "week":
        case "month":
          dateFormat = "%Y-%m-%d"; // Daily
          break;
        case "year":
        case "all":
        default:
          dateFormat = "%Y-%m"; // Monthly
          break;
      }

      const timeline: {
        date: string;
        views: number;
        likes: number;
        comments: number;
        shares: number;
      }[] = [];

      // Get video engagement timeline
      if (input.contentType === "all" || input.contentType === "videos") {
        const videoTimeline = await db
          .select({
            date: sql<string>`DATE_FORMAT(${videoView.createdAt}, ${dateFormat})`.as(
              "date",
            ),
            views: count(),
          })
          .from(videoView)
          .innerJoin(video, eq(videoView.idVideo, video.id))
          .where(
            and(
              eq(video.idUser, userId),
              gte(videoView.createdAt, dateRange.start),
              lte(videoView.createdAt, dateRange.end),
            ),
          )
          .groupBy(sql`DATE_FORMAT(${videoView.createdAt}, ${dateFormat})`)
          .orderBy(sql`date`);

        const videoLikesTimeline = await db
          .select({
            date: sql<string>`DATE_FORMAT(${videoLike.createdAt}, ${dateFormat})`.as(
              "date",
            ),
            likes: count(),
          })
          .from(videoLike)
          .innerJoin(video, eq(videoLike.idVideo, video.id))
          .where(
            and(
              eq(video.idUser, userId),
              gte(videoLike.createdAt, dateRange.start),
              lte(videoLike.createdAt, dateRange.end),
            ),
          )
          .groupBy(sql`DATE_FORMAT(${videoLike.createdAt}, ${dateFormat})`)
          .orderBy(sql`date`);

        const videoSharesTimeline = await db
          .select({
            date: sql<string>`DATE_FORMAT(${videoShare.createdAt}, ${dateFormat})`.as(
              "date",
            ),
            shares: count(),
          })
          .from(videoShare)
          .innerJoin(video, eq(videoShare.idVideo, video.id))
          .where(
            and(
              eq(video.idUser, userId),
              gte(videoShare.createdAt, dateRange.start),
              lte(videoShare.createdAt, dateRange.end),
            ),
          )
          .groupBy(sql`DATE_FORMAT(${videoShare.createdAt}, ${dateFormat})`)
          .orderBy(sql`date`);

        // Merge video data into timeline
        const viewsMap = Object.fromEntries(
          videoTimeline.map((v) => [v.date, Number(v.views)]),
        );
        const likesMap = Object.fromEntries(
          videoLikesTimeline.map((v) => [v.date, Number(v.likes)]),
        );
        const sharesMap = Object.fromEntries(
          videoSharesTimeline.map((v) => [v.date, Number(v.shares)]),
        );

        const allDates = new Set([
          ...Object.keys(viewsMap),
          ...Object.keys(likesMap),
          ...Object.keys(sharesMap),
        ]);

        for (const date of allDates) {
          const existing = timeline.find((t) => t.date === date);
          if (existing) {
            existing.views += viewsMap[date] ?? 0;
            existing.likes += likesMap[date] ?? 0;
            existing.shares += sharesMap[date] ?? 0;
          } else {
            timeline.push({
              date,
              views: viewsMap[date] ?? 0,
              likes: likesMap[date] ?? 0,
              comments: 0,
              shares: sharesMap[date] ?? 0,
            });
          }
        }
      }

      // Get post engagement timeline
      if (input.contentType === "all" || input.contentType === "posts") {
        const postViewsTimeline = await db
          .select({
            date: sql<string>`DATE_FORMAT(${postView.createdAt}, ${dateFormat})`.as(
              "date",
            ),
            views: count(),
          })
          .from(postView)
          .innerJoin(smsPool, eq(postView.idSmsPool, smsPool.id))
          .where(
            and(
              eq(smsPool.idUser, userId),
              gte(postView.createdAt, dateRange.start),
              lte(postView.createdAt, dateRange.end),
            ),
          )
          .groupBy(sql`DATE_FORMAT(${postView.createdAt}, ${dateFormat})`)
          .orderBy(sql`date`);

        const postReactionsTimeline = await db
          .select({
            date: sql<string>`DATE_FORMAT(${smsPoolReaction.createdAt}, ${dateFormat})`.as(
              "date",
            ),
            reactions: count(),
          })
          .from(smsPoolReaction)
          .innerJoin(smsPool, eq(smsPoolReaction.idSmsPool, smsPool.id))
          .where(
            and(
              eq(smsPool.idUser, userId),
              gte(smsPoolReaction.createdAt, dateRange.start),
              lte(smsPoolReaction.createdAt, dateRange.end),
            ),
          )
          .groupBy(
            sql`DATE_FORMAT(${smsPoolReaction.createdAt}, ${dateFormat})`,
          )
          .orderBy(sql`date`);

        // Merge post data into timeline
        const viewsMap = Object.fromEntries(
          postViewsTimeline.map((v) => [v.date, Number(v.views)]),
        );
        const reactionsMap = Object.fromEntries(
          postReactionsTimeline.map((v) => [v.date, Number(v.reactions)]),
        );

        const allDates = new Set([
          ...Object.keys(viewsMap),
          ...Object.keys(reactionsMap),
        ]);

        for (const date of allDates) {
          const existing = timeline.find((t) => t.date === date);
          if (existing) {
            existing.views += viewsMap[date] ?? 0;
            existing.likes += reactionsMap[date] ?? 0;
          } else {
            timeline.push({
              date,
              views: viewsMap[date] ?? 0,
              likes: reactionsMap[date] ?? 0,
              comments: 0,
              shares: 0,
            });
          }
        }
      }

      // Sort by date
      timeline.sort((a, b) => a.date.localeCompare(b.date));

      return { timeline };
    }),

  /**
   * Get top performing content
   */
  getTopContent: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(20).default(10),
        contentType: z.enum(["all", "videos", "posts"]).default("all"),
        sortBy: z
          .enum(["views", "likes", "shares", "comments"])
          .default("views"),
        timeRange: TimeRangeSchema.default("week"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = Number(ctx.session.user.id);
      const dateRange = getDateRange(input.timeRange);

      const items: {
        id: number;
        type: "video" | "post";
        title: string;
        thumbnailUrl: string | null;
        views: number;
        likes: number;
        comments: number;
        shares: number;
        createdAt: string;
      }[] = [];

      // Get top videos
      if (input.contentType === "all" || input.contentType === "videos") {
        const orderByColumn =
          input.sortBy === "views"
            ? video.viewCount
            : input.sortBy === "likes"
              ? video.likeCount
              : input.sortBy === "shares"
                ? video.shareCount
                : video.commentCount;

        const topVideos = await db
          .select({
            id: video.id,
            caption: video.caption,
            thumbnailUrl: video.thumbnailUrl,
            viewCount: video.viewCount,
            likeCount: video.likeCount,
            commentCount: video.commentCount,
            shareCount: video.shareCount,
            createdAt: video.createdAt,
          })
          .from(video)
          .where(
            and(
              eq(video.idUser, userId),
              gte(video.createdAt, dateRange.start),
              lte(video.createdAt, dateRange.end),
            ),
          )
          .orderBy(desc(orderByColumn))
          .limit(input.limit);

        items.push(
          ...topVideos.map((v) => ({
            id: v.id,
            type: "video" as const,
            title: v.caption ?? "Untitled video",
            thumbnailUrl: v.thumbnailUrl,
            views: v.viewCount ?? 0,
            likes: v.likeCount ?? 0,
            comments: v.commentCount ?? 0,
            shares: v.shareCount ?? 0,
            createdAt: v.createdAt,
          })),
        );
      }

      // Get top posts
      if (input.contentType === "all" || input.contentType === "posts") {
        const topPosts = await db
          .select({
            id: smsPool.id,
            body: smsPool.body,
            createdAt: smsPool.createdAt,
          })
          .from(smsPool)
          .where(
            and(
              eq(smsPool.idUser, userId),
              gte(smsPool.createdAt, dateRange.start),
              lte(smsPool.createdAt, dateRange.end),
            ),
          )
          .orderBy(desc(smsPool.createdAt))
          .limit(input.limit);

        // Get reaction and comment counts for each post
        for (const post of topPosts) {
          const [reactionCount] = await db
            .select({ count: count() })
            .from(smsPoolReaction)
            .where(eq(smsPoolReaction.idSmsPool, post.id));

          const [commentCount] = await db
            .select({ count: count() })
            .from(comment)
            .where(eq(comment.idSmsPool, post.id));

          const [viewCount] = await db
            .select({ count: count() })
            .from(postView)
            .where(eq(postView.idSmsPool, post.id));

          items.push({
            id: post.id,
            type: "post" as const,
            title:
              post.body.substring(0, 100) +
              (post.body.length > 100 ? "..." : ""),
            thumbnailUrl: null,
            views: Number(viewCount?.count ?? 0),
            likes: Number(reactionCount?.count ?? 0),
            comments: Number(commentCount?.count ?? 0),
            shares: 0,
            createdAt: post.createdAt,
          });
        }
      }

      // Sort combined results
      items.sort((a, b) => {
        switch (input.sortBy) {
          case "views":
            return b.views - a.views;
          case "likes":
            return b.likes - a.likes;
          case "comments":
            return b.comments - a.comments;
          case "shares":
            return b.shares - a.shares;
          default:
            return b.views - a.views;
        }
      });

      return { items: items.slice(0, input.limit) };
    }),

  /**
   * Record a post view (for tracking text post analytics)
   */
  recordPostView: protectedProcedure
    .input(
      z.object({
        postId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = Number(ctx.session.user.id);
      const now = new Date().toISOString().slice(0, 19).replace("T", " ");

      await db.insert(postView).values({
        idSmsPool: input.postId,
        idUser: userId,
        createdAt: now,
      });

      return { success: true };
    }),

  /**
   * Get audience insights - geographic distribution and follower growth
   */
  getAudienceInsights: protectedProcedure
    .input(
      z.object({
        timeRange: TimeRangeSchema.default("week"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = Number(ctx.session.user.id);
      const dateRange = getDateRange(input.timeRange);

      // Determine grouping interval based on time range
      let dateFormat: string;
      switch (input.timeRange) {
        case "day":
          dateFormat = "%Y-%m-%d %H:00:00";
          break;
        case "week":
        case "month":
          dateFormat = "%Y-%m-%d";
          break;
        case "year":
        case "all":
        default:
          dateFormat = "%Y-%m";
          break;
      }

      // Get geographic distribution of followers
      const geoDistribution = await db
        .select({
          country: user.country,
          count: count(),
        })
        .from(follower)
        .innerJoin(user, eq(follower.idUserFollower, user.id))
        .where(eq(follower.idUserLeader, userId))
        .groupBy(user.country)
        .orderBy(desc(count()))
        .limit(10);

      // Get state distribution for top country
      const topCountry = geoDistribution[0]?.country;
      let stateDistribution: { state: string | null; count: number }[] = [];
      if (topCountry) {
        stateDistribution = await db
          .select({
            state: user.state,
            count: count(),
          })
          .from(follower)
          .innerJoin(user, eq(follower.idUserFollower, user.id))
          .where(
            and(
              eq(follower.idUserLeader, userId),
              eq(user.country, topCountry),
            ),
          )
          .groupBy(user.state)
          .orderBy(desc(count()))
          .limit(10);
      }

      // Get follower growth timeline
      const followerGrowth = await db
        .select({
          date: sql<string>`DATE_FORMAT(${follower.createdAt}, ${dateFormat})`.as(
            "date",
          ),
          count: count(),
        })
        .from(follower)
        .where(
          and(
            eq(follower.idUserLeader, userId),
            sql`${follower.createdAt} IS NOT NULL`,
            gte(follower.createdAt, dateRange.start),
            lte(follower.createdAt, dateRange.end),
          ),
        )
        .groupBy(sql`DATE_FORMAT(${follower.createdAt}, ${dateFormat})`)
        .orderBy(sql`date`);

      // Get total follower count
      const [totalFollowers] = await db
        .select({ count: count() })
        .from(follower)
        .where(eq(follower.idUserLeader, userId));

      // Get new followers in current period
      const [newFollowers] = await db
        .select({ count: count() })
        .from(follower)
        .where(
          and(
            eq(follower.idUserLeader, userId),
            sql`${follower.createdAt} IS NOT NULL`,
            gte(follower.createdAt, dateRange.start),
            lte(follower.createdAt, dateRange.end),
          ),
        );

      // Get most engaged followers (by video views)
      let engagedFollowers: {
        userId: number;
        firstName: string;
        lastName: string | null;
        image: string | null;
        viewCount: number;
      }[] = [];

      try {
        engagedFollowers = await db
          .select({
            userId: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            image: user.image,
            viewCount: count(),
          })
          .from(videoView)
          .innerJoin(video, eq(videoView.idVideo, video.id))
          .innerJoin(user, eq(videoView.idUser, user.id))
          .innerJoin(
            follower,
            and(
              eq(follower.idUserFollower, user.id),
              eq(follower.idUserLeader, userId),
            ),
          )
          .where(
            and(
              eq(video.idUser, userId),
              sql`${videoView.createdAt} IS NOT NULL`,
              gte(videoView.createdAt, dateRange.start),
              lte(videoView.createdAt, dateRange.end),
            ),
          )
          .groupBy(user.id, user.firstName, user.lastName, user.image)
          .orderBy(desc(count()))
          .limit(5);
      } catch {
        // If the query fails (e.g., no videos), return empty array
        engagedFollowers = [];
      }

      return {
        totalFollowers: Number(totalFollowers?.count ?? 0),
        newFollowers: Number(newFollowers?.count ?? 0),
        geoDistribution: geoDistribution.map((g) => ({
          country: g.country ?? "Unknown",
          count: Number(g.count),
        })),
        stateDistribution: stateDistribution.map((s) => ({
          state: s.state ?? "Unknown",
          count: Number(s.count),
        })),
        followerGrowth: followerGrowth
          // .filter((f) => f.date != null)
          .map((f) => ({
            date: f.date,
            count: Number(f.count),
          })),
        engagedFollowers: engagedFollowers.map((f) => ({
          userId: f.userId,
          name: [f.firstName, f.lastName].filter(Boolean).join(" ") || null,
          image: f.image,
          viewCount: Number(f.viewCount),
        })),
      };
    }),

  /**
   * Get feed-specific analytics (influencer and private feeds)
   */
  getFeedAnalytics: protectedProcedure
    .input(
      z.object({
        timeRange: TimeRangeSchema.default("week"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = Number(ctx.session.user.id);
      const dateRange = getDateRange(input.timeRange);

      // Get all follower lists (feeds) for the user
      const feeds = await db
        .select({
          id: followerList.id,
          name: followerList.name,
          description: followerList.description,
          image: followerList.image,
          createdAt: followerList.createdAt,
        })
        .from(followerList)
        .where(eq(followerList.idUser, userId));

      // Get stats for each feed
      const feedStats = await Promise.all(
        feeds.map(async (feed) => {
          // Get follower count for this feed
          const [followerCount] = await db
            .select({ count: count() })
            .from(follower)
            .where(eq(follower.idFollowerList, feed.id));

          // Get posts sent to this feed
          const [postCount] = await db
            .select({ count: count() })
            .from(smsPool)
            .where(
              and(
                eq(smsPool.idFollowerList, feed.id),
                gte(smsPool.createdAt, dateRange.start),
                lte(smsPool.createdAt, dateRange.end),
              ),
            );

          // Get total posts views for this feed
          const [postViewCount] = await db
            .select({ count: count() })
            .from(postView)
            .innerJoin(smsPool, eq(postView.idSmsPool, smsPool.id))
            .where(
              and(
                eq(smsPool.idFollowerList, feed.id),
                gte(postView.createdAt, dateRange.start),
                lte(postView.createdAt, dateRange.end),
              ),
            );

          // Get reactions for posts in this feed
          const [reactionCount] = await db
            .select({ count: count() })
            .from(smsPoolReaction)
            .innerJoin(smsPool, eq(smsPoolReaction.idSmsPool, smsPool.id))
            .where(
              and(
                eq(smsPool.idFollowerList, feed.id),
                gte(smsPoolReaction.createdAt, dateRange.start),
                lte(smsPoolReaction.createdAt, dateRange.end),
              ),
            );

          return {
            id: feed.id,
            name: feed.name,
            description: feed.description,
            image: feed.image,
            followerCount: Number(followerCount?.count ?? 0),
            postCount: Number(postCount?.count ?? 0),
            viewCount: Number(postViewCount?.count ?? 0),
            reactionCount: Number(reactionCount?.count ?? 0),
            createdAt: feed.createdAt,
          };
        }),
      );

      // Calculate totals
      const totalFeeds = feedStats.length;
      const totalFeedFollowers = feedStats.reduce(
        (sum, f) => sum + f.followerCount,
        0,
      );
      const totalFeedPosts = feedStats.reduce((sum, f) => sum + f.postCount, 0);
      const totalFeedViews = feedStats.reduce((sum, f) => sum + f.viewCount, 0);

      return {
        totalFeeds,
        totalFeedFollowers,
        totalFeedPosts,
        totalFeedViews,
        feeds: feedStats.sort((a, b) => b.followerCount - a.followerCount),
      };
    }),

  /**
   * Get text post (smsPool) specific stats
   */
  getPostStats: protectedProcedure
    .input(
      z.object({
        timeRange: TimeRangeSchema.default("week"),
        limit: z.number().min(1).max(50).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = Number(ctx.session.user.id);
      const dateRange = getDateRange(input.timeRange);

      // Get posts for the user
      const posts = await db
        .select({
          id: smsPool.id,
          body: smsPool.body,
          shortBody: smsPool.shortBody,
          url: smsPool.url,
          createdAt: smsPool.createdAt,
        })
        .from(smsPool)
        .where(
          and(
            eq(smsPool.idUser, userId),
            gte(smsPool.createdAt, dateRange.start),
            lte(smsPool.createdAt, dateRange.end),
          ),
        )
        .orderBy(desc(smsPool.createdAt))
        .limit(input.limit);

      // Get stats for each post
      const postStats = await Promise.all(
        posts.map(async (post) => {
          // Get view count
          const [viewCount] = await db
            .select({ count: count() })
            .from(postView)
            .where(eq(postView.idSmsPool, post.id));

          // Get reaction count
          const [reactionCount] = await db
            .select({ count: count() })
            .from(smsPoolReaction)
            .where(eq(smsPoolReaction.idSmsPool, post.id));

          // Get comment count
          const [commentCount] = await db
            .select({ count: count() })
            .from(comment)
            .where(eq(comment.idSmsPool, post.id));

          // Get first photo if any
          const [photo] = await db
            .select({
              webName: smsPoolPhoto.webName,
              folderName: smsPoolPhoto.folderName,
            })
            .from(smsPoolPhoto)
            .where(eq(smsPoolPhoto.idSmsPool, post.id))
            .limit(1);

          return {
            id: post.id,
            body: post.body,
            shortBody: post.shortBody,
            url: post.url,
            thumbnailUrl: photo ? `${photo.folderName}/${photo.webName}` : null,
            views: Number(viewCount?.count ?? 0),
            reactions: Number(reactionCount?.count ?? 0),
            comments: Number(commentCount?.count ?? 0),
            createdAt: post.createdAt,
          };
        }),
      );

      // Sort by views
      const sortedPosts = postStats.sort((a, b) => b.views - a.views);

      // Calculate totals
      const totalViews = sortedPosts.reduce((sum, p) => sum + p.views, 0);
      const totalReactions = sortedPosts.reduce(
        (sum, p) => sum + p.reactions,
        0,
      );
      const totalComments = sortedPosts.reduce((sum, p) => sum + p.comments, 0);

      return {
        totalViews,
        totalReactions,
        totalComments,
        postCount: sortedPosts.length,
        posts: sortedPosts,
      };
    }),

  // ============================================
  // Video Creator Analytics
  // ============================================

  /**
   * Get video analytics overview for a creator
   */
  getVideoOverview: protectedProcedure
    .input(
      z.object({
        timeRange: TimeRangeSchema.default("week"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = Number(ctx.session.user.id);
      const dateRange = getDateRange(input.timeRange);
      const previousRange = getPreviousPeriodRange(input.timeRange);

      // Get current period stats
      const [currentStats] = await db
        .select({
          totalViews: sql<number>`COALESCE(SUM(${video.viewCount}), 0)`,
          totalLikes: sql<number>`COALESCE(SUM(${video.likeCount}), 0)`,
          totalComments: sql<number>`COALESCE(SUM(${video.commentCount}), 0)`,
          totalShares: sql<number>`COALESCE(SUM(${video.shareCount}), 0)`,
          videoCount: count(),
        })
        .from(video)
        .where(eq(video.idUser, userId));

      // Get videos created in current period
      const [newVideoStats] = await db
        .select({
          newVideos: count(),
        })
        .from(video)
        .where(
          and(
            eq(video.idUser, userId),
            gte(video.createdAt, dateRange.start),
            lte(video.createdAt, dateRange.end),
          ),
        );

      // Get views in current period
      const [viewsInPeriod] = await db
        .select({
          views: count(),
        })
        .from(videoView)
        .innerJoin(video, eq(videoView.idVideo, video.id))
        .where(
          and(
            eq(video.idUser, userId),
            gte(videoView.createdAt, dateRange.start),
            lte(videoView.createdAt, dateRange.end),
          ),
        );

      // Get likes in current period
      const [likesInPeriod] = await db
        .select({
          likes: count(),
        })
        .from(videoLike)
        .innerJoin(video, eq(videoLike.idVideo, video.id))
        .where(
          and(
            eq(video.idUser, userId),
            gte(videoLike.createdAt, dateRange.start),
            lte(videoLike.createdAt, dateRange.end),
          ),
        );

      // Calculate changes if we have previous period
      let viewsChange = 0;
      let likesChange = 0;

      if (previousRange) {
        const [prevViews] = await db
          .select({ views: count() })
          .from(videoView)
          .innerJoin(video, eq(videoView.idVideo, video.id))
          .where(
            and(
              eq(video.idUser, userId),
              gte(videoView.createdAt, previousRange.start),
              lte(videoView.createdAt, previousRange.end),
            ),
          );

        const [prevLikes] = await db
          .select({ likes: count() })
          .from(videoLike)
          .innerJoin(video, eq(videoLike.idVideo, video.id))
          .where(
            and(
              eq(video.idUser, userId),
              gte(videoLike.createdAt, previousRange.start),
              lte(videoLike.createdAt, previousRange.end),
            ),
          );

        const prevViewCount = Number(prevViews?.views ?? 0);
        const prevLikeCount = Number(prevLikes?.likes ?? 0);
        const currentViewCount = Number(viewsInPeriod?.views ?? 0);
        const currentLikeCount = Number(likesInPeriod?.likes ?? 0);

        if (prevViewCount > 0) {
          viewsChange = Math.round(
            ((currentViewCount - prevViewCount) / prevViewCount) * 100,
          );
        }
        if (prevLikeCount > 0) {
          likesChange = Math.round(
            ((currentLikeCount - prevLikeCount) / prevLikeCount) * 100,
          );
        }
      }

      // Calculate average engagement rate
      const totalViews = Number(currentStats?.totalViews ?? 0);
      const totalLikes = Number(currentStats?.totalLikes ?? 0);
      const totalComments = Number(currentStats?.totalComments ?? 0);
      const engagementRate =
        totalViews > 0
          ? Math.round(((totalLikes + totalComments) / totalViews) * 10000) /
            100
          : 0;

      return {
        totalViews,
        totalLikes,
        totalComments,
        totalShares: Number(currentStats?.totalShares ?? 0),
        videoCount: Number(currentStats?.videoCount ?? 0),
        newVideosInPeriod: Number(newVideoStats?.newVideos ?? 0),
        viewsInPeriod: Number(viewsInPeriod?.views ?? 0),
        likesInPeriod: Number(likesInPeriod?.likes ?? 0),
        viewsChange,
        likesChange,
        engagementRate,
        timeRange: input.timeRange,
      };
    }),

  /**
   * Get top performing videos for a creator
   */
  getTopVideos: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
        sortBy: z
          .enum(["views", "likes", "comments", "shares"])
          .default("views"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = Number(ctx.session.user.id);

      const orderBy =
        input.sortBy === "likes"
          ? desc(video.likeCount)
          : input.sortBy === "comments"
            ? desc(video.commentCount)
            : input.sortBy === "shares"
              ? desc(video.shareCount)
              : desc(video.viewCount);

      const videos = await db
        .select({
          id: video.id,
          caption: video.caption,
          thumbnailUrl: video.thumbnailUrl,
          playbackId: video.playbackId,
          viewCount: video.viewCount,
          likeCount: video.likeCount,
          commentCount: video.commentCount,
          shareCount: video.shareCount,
          duration: video.duration,
          createdAt: video.createdAt,
        })
        .from(video)
        .where(
          and(eq(video.idUser, userId), eq(video.transcodingStatus, "ready")),
        )
        .orderBy(orderBy)
        .limit(input.limit);

      return {
        items: videos.map((v) => ({
          id: v.id,
          caption: v.caption,
          thumbnailUrl: v.thumbnailUrl,
          viewCount: v.viewCount ?? 0,
          likeCount: v.likeCount ?? 0,
          commentCount: v.commentCount ?? 0,
          shareCount: v.shareCount ?? 0,
          duration: v.duration,
          createdAt: v.createdAt,
          // Calculate engagement rate per video
          engagementRate:
            v.viewCount && v.viewCount > 0
              ? Math.round(
                  (((v.likeCount ?? 0) + (v.commentCount ?? 0)) / v.viewCount) *
                    10000,
                ) / 100
              : 0,
        })),
      };
    }),

  /**
   * Get video views over time for charts
   */
  getVideoViewsTimeline: protectedProcedure
    .input(
      z.object({
        timeRange: TimeRangeSchema.default("week"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = Number(ctx.session.user.id);
      const dateRange = getDateRange(input.timeRange);

      // Group by day
      const viewsByDay = await db
        .select({
          date: sql<string>`DATE(${videoView.createdAt})`.as("date"),
          views: count(),
        })
        .from(videoView)
        .innerJoin(video, eq(videoView.idVideo, video.id))
        .where(
          and(
            eq(video.idUser, userId),
            gte(videoView.createdAt, dateRange.start),
            lte(videoView.createdAt, dateRange.end),
          ),
        )
        .groupBy(sql`DATE(${videoView.createdAt})`)
        .orderBy(sql`DATE(${videoView.createdAt})`);

      return {
        items: viewsByDay.map((v) => ({
          date: v.date,
          views: Number(v.views),
        })),
      };
    }),

  /**
   * Get recent activity for a creator's videos
   */
  getRecentVideoActivity: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = Number(ctx.session.user.id);

      // Get recent likes
      const recentLikes = await db
        .select({
          type: sql<string>`'like'`.as("type"),
          videoId: videoLike.idVideo,
          videoCaption: video.caption,
          videoThumbnail: video.thumbnailUrl,
          actorId: videoLike.idUser,
          actorName:
            sql<string>`CONCAT(${user.firstName}, ' ', COALESCE(${user.lastName}, ''))`.as(
              "actorName",
            ),
          actorImage: user.image,
          createdAt: videoLike.createdAt,
        })
        .from(videoLike)
        .innerJoin(video, eq(videoLike.idVideo, video.id))
        .innerJoin(user, eq(videoLike.idUser, user.id))
        .where(eq(video.idUser, userId))
        .orderBy(desc(videoLike.createdAt))
        .limit(input.limit);

      // Get recent shares
      const recentShares = await db
        .select({
          type: sql<string>`'share'`.as("type"),
          videoId: videoShare.idVideo,
          videoCaption: video.caption,
          videoThumbnail: video.thumbnailUrl,
          actorId: videoShare.idUser,
          actorName:
            sql<string>`CONCAT(${user.firstName}, ' ', COALESCE(${user.lastName}, ''))`.as(
              "actorName",
            ),
          actorImage: user.image,
          createdAt: videoShare.createdAt,
        })
        .from(videoShare)
        .innerJoin(video, eq(videoShare.idVideo, video.id))
        .innerJoin(user, eq(videoShare.idUser, user.id))
        .where(eq(video.idUser, userId))
        .orderBy(desc(videoShare.createdAt))
        .limit(input.limit);

      // Combine and sort by date
      const allActivity = [...recentLikes, ...recentShares]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, input.limit);

      return {
        items: allActivity.map((a) => ({
          type: a.type as "like" | "share",
          videoId: a.videoId,
          videoCaption: a.videoCaption,
          videoThumbnail: a.videoThumbnail,
          actor: {
            id: a.actorId,
            name: a.actorName.trim(),
            image: a.actorImage,
          },
          createdAt: a.createdAt,
        })),
      };
    }),
} satisfies TRPCRouterRecord;
