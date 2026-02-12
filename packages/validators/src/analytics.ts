import { z } from "zod/v4";

// ============================================
// Analytics Schemas
// ============================================

// Time range for analytics queries
export const TimeRangeSchema = z.enum(["day", "week", "month", "year", "all"]);
export type TimeRange = z.infer<typeof TimeRangeSchema>;

// Schema for getting analytics overview
export const GetAnalyticsOverviewSchema = z.object({
  timeRange: TimeRangeSchema.default("week"),
});

export type GetAnalyticsOverviewInput = z.infer<
  typeof GetAnalyticsOverviewSchema
>;

// Schema for getting video stats
export const GetVideoStatsSchema = z.object({
  videoId: z.number().optional(), // If not provided, get all user's videos
  timeRange: TimeRangeSchema.default("week"),
});

export type GetVideoStatsInput = z.infer<typeof GetVideoStatsSchema>;

// Schema for getting post stats
export const GetPostStatsSchema = z.object({
  postId: z.number().optional(), // If not provided, get all user's posts
  timeRange: TimeRangeSchema.default("week"),
});

export type GetPostStatsInput = z.infer<typeof GetPostStatsSchema>;

// Schema for getting engagement timeline
export const GetEngagementTimelineSchema = z.object({
  timeRange: TimeRangeSchema.default("week"),
  contentType: z.enum(["all", "videos", "posts"]).default("all"),
});

export type GetEngagementTimelineInput = z.infer<
  typeof GetEngagementTimelineSchema
>;

// Schema for getting top content
export const GetTopContentSchema = z.object({
  limit: z.number().min(1).max(20).default(10),
  contentType: z.enum(["all", "videos", "posts"]).default("all"),
  sortBy: z.enum(["views", "likes", "shares", "comments"]).default("views"),
  timeRange: TimeRangeSchema.default("week"),
});

export type GetTopContentInput = z.infer<typeof GetTopContentSchema>;

// Schema for recording a post view
export const RecordPostViewSchema = z.object({
  postId: z.number(),
});

export type RecordPostViewInput = z.infer<typeof RecordPostViewSchema>;

// ============================================
// Analytics Response Types
// ============================================

export interface AnalyticsOverview {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  followerCount: number;
  videoCount: number;
  postCount: number;
  // Comparison with previous period
  viewsChange: number;
  likesChange: number;
  commentsChange: number;
  sharesChange: number;
}

export interface VideoStats {
  videoId: number;
  views: number;
  likes: number;
  shares: number;
  comments: number;
  avgWatchDuration: number;
  completionRate: number;
}

export interface PostStats {
  postId: number;
  views: number;
  reactions: number;
  comments: number;
  reactionBreakdown: Record<string, number>;
}

export interface EngagementTimelinePoint {
  date: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
}

export interface TopContentItem {
  id: number;
  type: "video" | "post";
  title: string;
  thumbnailUrl: string | null;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  createdAt: string;
}
