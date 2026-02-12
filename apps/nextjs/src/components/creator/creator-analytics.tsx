"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowLeft,
  BarChart3,
  Eye,
  Heart,
  MessageSquare,
  Share2,
  TrendingDown,
  TrendingUp,
  Video,
} from "lucide-react";

import { cn } from "@galileyo/ui";
import { Avatar, AvatarFallback, AvatarImage } from "@galileyo/ui/avatar";
import { Button } from "@galileyo/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@galileyo/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@galileyo/ui/select";
import { Skeleton } from "@galileyo/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@galileyo/ui/tabs";

import { formatCount } from "~/lib/format";
import { useTRPC } from "~/trpc/react";

type TimeRange = "day" | "week" | "month" | "year" | "all";

export function CreatorAnalytics() {
  const trpc = useTRPC();
  const [timeRange, setTimeRange] = useState<TimeRange>("week");

  // Fetch overview stats
  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ["analytics", "videoOverview", timeRange],
    queryFn: async () => {
      const result = await (
        trpc.analytics as unknown as {
          getVideoOverview: {
            query: (input: { timeRange: TimeRange }) => Promise<{
              totalViews: number;
              totalLikes: number;
              totalComments: number;
              totalShares: number;
              videoCount: number;
              newVideosInPeriod: number;
              viewsInPeriod: number;
              likesInPeriod: number;
              viewsChange: number;
              likesChange: number;
              engagementRate: number;
              timeRange: TimeRange;
            }>;
          };
        }
      ).getVideoOverview.query({ timeRange });
      return result;
    },
  });

  // Fetch top videos
  const { data: topVideos, isLoading: topVideosLoading } = useQuery({
    queryKey: ["analytics", "topVideos"],
    queryFn: async () => {
      const result = await (
        trpc.analytics as unknown as {
          getTopVideos: {
            query: (input: { limit: number; sortBy: string }) => Promise<{
              items: {
                id: number;
                caption: string | null;
                thumbnailUrl: string | null;
                viewCount: number;
                likeCount: number;
                commentCount: number;
                shareCount: number;
                duration: number | null;
                createdAt: string;
                engagementRate: number;
              }[];
            }>;
          };
        }
      ).getTopVideos.query({ limit: 10, sortBy: "views" });
      return result;
    },
  });

  // Fetch recent activity
  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: ["analytics", "recentActivity"],
    queryFn: async () => {
      const result = await (
        trpc.analytics as unknown as {
          getRecentVideoActivity: {
            query: (input: { limit: number }) => Promise<{
              items: {
                type: "like" | "share";
                videoId: number;
                videoCaption: string | null;
                videoThumbnail: string | null;
                actor: {
                  id: number;
                  name: string;
                  image: string | null;
                };
                createdAt: string;
              }[];
            }>;
          };
        }
      ).getRecentVideoActivity.query({ limit: 20 });
      return result;
    },
  });

  const getTimeRangeLabel = (range: TimeRange): string => {
    switch (range) {
      case "day":
        return "Last 24 hours";
      case "week":
        return "Last 7 days";
      case "month":
        return "Last 30 days";
      case "year":
        return "Last year";
      case "all":
        return "All time";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/videos">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              <h1 className="text-lg font-semibold">Creator Analytics</h1>
            </div>
          </div>
          <Select
            value={timeRange}
            onValueChange={(v) => setTimeRange(v as TimeRange)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Last 24 hours</SelectItem>
              <SelectItem value="week">Last 7 days</SelectItem>
              <SelectItem value="month">Last 30 days</SelectItem>
              <SelectItem value="year">Last year</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="container space-y-6 px-4 py-6">
        {/* Overview Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Views"
            value={overview?.totalViews ?? 0}
            periodValue={overview?.viewsInPeriod ?? 0}
            change={overview?.viewsChange ?? 0}
            icon={Eye}
            loading={overviewLoading}
            period={getTimeRangeLabel(timeRange)}
          />
          <StatCard
            title="Total Likes"
            value={overview?.totalLikes ?? 0}
            periodValue={overview?.likesInPeriod ?? 0}
            change={overview?.likesChange ?? 0}
            icon={Heart}
            loading={overviewLoading}
            period={getTimeRangeLabel(timeRange)}
          />
          <StatCard
            title="Comments"
            value={overview?.totalComments ?? 0}
            icon={MessageSquare}
            loading={overviewLoading}
          />
          <StatCard
            title="Engagement Rate"
            value={`${overview?.engagementRate ?? 0}%`}
            icon={TrendingUp}
            loading={overviewLoading}
            isPercentage
          />
        </div>

        {/* Video Count and New Videos */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Video className="h-4 w-4" />
                Total Videos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {overviewLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-3xl font-bold">
                  {overview?.videoCount ?? 0}
                </div>
              )}
              {!overviewLoading &&
                overview?.newVideosInPeriod !== undefined && (
                  <p className="text-sm text-muted-foreground">
                    +{overview.newVideosInPeriod} new{" "}
                    {getTimeRangeLabel(timeRange).toLowerCase()}
                  </p>
                )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Share2 className="h-4 w-4" />
                Total Shares
              </CardTitle>
            </CardHeader>
            <CardContent>
              {overviewLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-3xl font-bold">
                  {formatCount(overview?.totalShares ?? 0)}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different views */}
        <Tabs defaultValue="top-videos" className="space-y-4">
          <TabsList>
            <TabsTrigger value="top-videos">Top Videos</TabsTrigger>
            <TabsTrigger value="recent-activity">Recent Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="top-videos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Videos</CardTitle>
                <CardDescription>Your videos sorted by views</CardDescription>
              </CardHeader>
              <CardContent>
                {topVideosLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-16 w-28 rounded" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : topVideos?.items.length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">
                    No videos yet. Upload your first video to see analytics!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {topVideos?.items.map((video, index) => (
                      <Link
                        key={video.id}
                        href={`/videos?v=${video.id}`}
                        className="flex items-center gap-4 rounded-lg p-2 transition-colors hover:bg-muted"
                      >
                        <span className="w-6 text-center text-lg font-semibold text-muted-foreground">
                          {index + 1}
                        </span>
                        <div className="relative h-16 w-28 flex-shrink-0 overflow-hidden rounded bg-muted">
                          {video.thumbnailUrl ? (
                            <img
                              src={video.thumbnailUrl}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <Video className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">
                            {video.caption ?? "Untitled video"}
                          </p>
                          <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {formatCount(video.viewCount)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="h-3 w-3" />
                              {formatCount(video.likeCount)}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              {formatCount(video.commentCount)}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {video.engagementRate}%
                          </p>
                          <p className="text-xs text-muted-foreground">
                            engagement
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recent-activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest interactions on your videos
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activityLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentActivity?.items.length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">
                    No recent activity on your videos.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {recentActivity?.items.map((activity, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={activity.actor.image ?? undefined}
                          />
                          <AvatarFallback>
                            {activity.actor.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm">
                            <span className="font-medium">
                              {activity.actor.name}
                            </span>{" "}
                            {activity.type === "like" ? "liked" : "shared"} your
                            video
                          </p>
                          <p className="truncate text-sm text-muted-foreground">
                            {activity.videoCaption ?? "Untitled video"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {activity.type === "like" ? (
                            <Heart className="h-4 w-4 text-red-500" />
                          ) : (
                            <Share2 className="h-4 w-4 text-green-500" />
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(activity.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number | string;
  periodValue?: number;
  change?: number;
  icon: React.ComponentType<{ className?: string }>;
  loading?: boolean;
  period?: string;
  isPercentage?: boolean;
}

function StatCard({
  title,
  value,
  periodValue,
  change,
  icon: Icon,
  loading,
  period,
  // _isPercentage,
}: StatCardProps) {
  const formatValue = (v: number | string): string => {
    if (typeof v === "string") return v;
    if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
    if (v >= 1000) return `${(v / 1000).toFixed(1)}K`;
    return v.toString();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <>
            <div className="text-2xl font-bold">{formatValue(value)}</div>
            {periodValue !== undefined && period && (
              <p className="text-xs text-muted-foreground">
                +{formatValue(periodValue)} {period.toLowerCase()}
              </p>
            )}
            {change !== undefined && change !== 0 && (
              <div
                className={cn(
                  "mt-1 flex items-center text-xs",
                  change > 0 ? "text-green-600" : "text-red-600",
                )}
              >
                {change > 0 ? (
                  <TrendingUp className="mr-1 h-3 w-3" />
                ) : (
                  <TrendingDown className="mr-1 h-3 w-3" />
                )}
                {Math.abs(change)}% vs previous period
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
