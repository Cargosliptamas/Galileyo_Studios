"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  BarChart3,
  Eye,
  FileText,
  Globe,
  Heart,
  MessageCircle,
  Rss,
  Share2,
  TrendingUp,
  UserPlus,
  Users,
  Video,
} from "lucide-react";

import { cn } from "@galileyo/ui";
import { Button } from "@galileyo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@galileyo/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@galileyo/ui/select";
import { Skeleton } from "@galileyo/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@galileyo/ui/tabs";

import {
  AreaChart,
  BarChart,
  StatCardWithSparkline,
} from "~/components/analytics";
import { useTRPC } from "~/trpc/react";

// Loading skeleton components
function LoadingCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="mt-2 h-3 w-24" />
              </div>
              <Skeleton className="h-12 w-24" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function LoadingChart() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-60" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[300px] w-full" />
      </CardContent>
    </Card>
  );
}

function LoadingTable() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-40" />
      <div className="rounded-md border">
        <div className="p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 border-b py-3 last:border-0"
            >
              <Skeleton className="h-10 w-10 rounded" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LoadingAudience() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

type TimeRange = "day" | "week" | "month" | "year" | "all";

interface TimeSeriesPoint {
  date: string;
  [key: string]: string | number;
}

function pad(value: number) {
  return value.toString().padStart(2, "0");
}

function formatDateBucket(date: Date, timeRange: TimeRange) {
  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1);
  const day = pad(date.getUTCDate());
  const hour = pad(date.getUTCHours());

  if (timeRange === "day") {
    return `${year}-${month}-${day} ${hour}:00:00`;
  }

  if (timeRange === "week" || timeRange === "month") {
    return `${year}-${month}-${day}`;
  }

  return `${year}-${month}`;
}

function parseDateBucket(bucket: string, timeRange: TimeRange) {
  if (timeRange === "day") {
    return new Date(`${bucket.replace(" ", "T")}Z`);
  }

  if (timeRange === "week" || timeRange === "month") {
    return new Date(`${bucket}T00:00:00Z`);
  }

  return new Date(`${bucket}-01T00:00:00Z`);
}

function getPeriodBuckets(timeRange: TimeRange, existingDates: string[] = []) {
  const now = new Date();
  const buckets: string[] = [];

  if (timeRange === "day") {
    const end = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        now.getUTCHours(),
      ),
    );
    for (let i = 23; i >= 0; i -= 1) {
      const point = new Date(end);
      point.setUTCHours(end.getUTCHours() - i);
      buckets.push(formatDateBucket(point, timeRange));
    }
    return buckets;
  }

  if (timeRange === "week" || timeRange === "month") {
    const duration = timeRange === "week" ? 7 : 30;
    const end = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );
    for (let i = duration - 1; i >= 0; i -= 1) {
      const point = new Date(end);
      point.setUTCDate(end.getUTCDate() - i);
      buckets.push(formatDateBucket(point, timeRange));
    }
    return buckets;
  }

  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const start =
    timeRange === "year"
      ? (() => {
          const startDate = new Date(end);
          startDate.setUTCMonth(end.getUTCMonth() - 11);
          return startDate;
        })()
      : (() => {
          if (existingDates.length === 0) return end;
          const sortedDates = [...existingDates].sort((a, b) =>
            a.localeCompare(b),
          );
          const earliest = parseDateBucket(sortedDates[0] ?? "", timeRange);
          if (Number.isNaN(earliest.getTime())) return end;
          return new Date(
            Date.UTC(earliest.getUTCFullYear(), earliest.getUTCMonth(), 1),
          );
        })();

  const cursor = new Date(start);
  while (cursor <= end) {
    buckets.push(formatDateBucket(cursor, timeRange));
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }

  return buckets;
}

function fillTimeSeriesWithZeros<T extends TimeSeriesPoint>(
  series: T[],
  timeRange: TimeRange,
  numericKeys: string[],
): TimeSeriesPoint[] {
  const buckets = getPeriodBuckets(
    timeRange,
    series.map((point) => point.date),
  );
  const byDate = new Map(series.map((point) => [point.date, point]));

  return buckets.map((date) => {
    const existing = byDate.get(date);
    const filledPoint: TimeSeriesPoint = { date };

    for (const key of numericKeys) {
      filledPoint[key] =
        typeof existing?.[key] === "number" ? Number(existing[key]) : 0;
    }

    return filledPoint;
  });
}

// Chart colors
const CHART_COLORS = {
  views: "hsl(217, 91%, 60%)", // Blue
  likes: "hsl(0, 84%, 60%)", // Red
  comments: "hsl(142, 71%, 45%)", // Green
  shares: "hsl(280, 67%, 55%)", // Purple
  followers: "hsl(24, 94%, 50%)", // Orange
};

// Overview Section with Sparklines
function OverviewSection({ timeRange }: { timeRange: TimeRange }) {
  const trpc = useTRPC();

  const { data: overview } = useSuspenseQuery(
    trpc.analytics.getOverview.queryOptions({ timeRange }),
  );

  const { data: timeline } = useSuspenseQuery(
    trpc.analytics.getEngagementTimeline.queryOptions({
      timeRange,
      contentType: "all",
    }),
  );

  const filledTimeline = fillTimeSeriesWithZeros(timeline.timeline, timeRange, [
    "views",
    "likes",
    "comments",
    "shares",
  ]);

  // Create sparkline data from timeline
  const viewsSparkline = filledTimeline.map((t) => ({
    value: Number(t.views ?? 0),
  }));
  const likesSparkline = filledTimeline.map((t) => ({
    value: Number(t.likes ?? 0),
  }));
  const commentsSparkline = filledTimeline.map((t) => ({
    value: Number(t.comments ?? 0),
  }));
  const sharesSparkline = filledTimeline.map((t) => ({
    value: Number(t.shares ?? 0),
  }));

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCardWithSparkline
        title="Total Views"
        value={overview.totalViews}
        change={overview.viewsChange}
        icon={Eye}
        sparklineData={viewsSparkline}
        sparklineColor={CHART_COLORS.views}
      />
      <StatCardWithSparkline
        title="Total Likes"
        value={overview.totalLikes}
        change={overview.likesChange}
        icon={Heart}
        sparklineData={likesSparkline}
        sparklineColor={CHART_COLORS.likes}
      />
      <StatCardWithSparkline
        title="Total Comments"
        value={overview.totalComments}
        change={overview.commentsChange}
        icon={MessageCircle}
        sparklineData={commentsSparkline}
        sparklineColor={CHART_COLORS.comments}
      />
      <StatCardWithSparkline
        title="Total Shares"
        value={overview.totalShares}
        change={overview.sharesChange}
        icon={Share2}
        sparklineData={sharesSparkline}
        sparklineColor={CHART_COLORS.shares}
      />
    </div>
  );
}

// Secondary Stats Row
function SecondaryStatsSection({ timeRange }: { timeRange: TimeRange }) {
  const trpc = useTRPC();

  const { data: overview } = useSuspenseQuery(
    trpc.analytics.getOverview.queryOptions({ timeRange }),
  );

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Followers
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {overview.followerCount.toLocaleString()}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Videos
          </CardTitle>
          <Video className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {overview.videoCount.toLocaleString()}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Posts
          </CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {overview.postCount.toLocaleString()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Engagement Timeline Chart
function EngagementTimelineSection({ timeRange }: { timeRange: TimeRange }) {
  const trpc = useTRPC();
  const [contentType, setContentType] = useState<"all" | "videos" | "posts">(
    "all",
  );

  const { data } = useSuspenseQuery(
    trpc.analytics.getEngagementTimeline.queryOptions({
      timeRange,
      contentType,
    }),
  );

  const filledTimeline = fillTimeSeriesWithZeros(data.timeline, timeRange, [
    "views",
    "likes",
    "comments",
    "shares",
  ]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Engagement Timeline</CardTitle>
          <p className="text-sm text-muted-foreground">
            Track your content performance over time
          </p>
        </div>
        <Select
          value={contentType}
          onValueChange={(value) =>
            setContentType(value as "all" | "videos" | "posts")
          }
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Content</SelectItem>
            <SelectItem value="videos">Videos</SelectItem>
            <SelectItem value="posts">Posts</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <AreaChart
          data={filledTimeline}
          dataKeys={[
            { key: "views", label: "Views", color: CHART_COLORS.views },
            { key: "likes", label: "Likes", color: CHART_COLORS.likes },
            { key: "shares", label: "Shares", color: CHART_COLORS.shares },
          ]}
          height={300}
        />
      </CardContent>
    </Card>
  );
}

// Video Stats Section
function VideoStatsSection({ timeRange }: { timeRange: TimeRange }) {
  const trpc = useTRPC();

  const { data } = useSuspenseQuery(
    trpc.analytics.getVideoStats.queryOptions({ timeRange }),
  );

  if (data.videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Video className="mb-4 h-12 w-12 text-muted-foreground" />
        <p className="text-lg font-medium">No videos yet</p>
        <p className="text-sm text-muted-foreground">
          Upload your first video to see analytics
        </p>
        <Button asChild className="mt-4">
          <Link href="/videos">Go to Videos</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Video Performance</h3>
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b bg-muted/50 text-left text-sm font-medium text-muted-foreground">
              <th className="p-3">Video</th>
              <th className="p-3 text-right">Views</th>
              <th className="p-3 text-right">Likes</th>
              <th className="p-3 text-right">Comments</th>
              <th className="p-3 text-right">Shares</th>
              <th className="p-3 text-right">Completion</th>
            </tr>
          </thead>
          <tbody>
            {data.videos.map((video) => (
              <tr key={video.id} className="border-b last:border-0">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    {video.thumbnailUrl ? (
                      <img
                        src={video.thumbnailUrl}
                        alt=""
                        className="h-10 w-10 shrink-0 rounded object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-muted">
                        <Video className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <span className="line-clamp-1 max-w-[200px] text-sm">
                      {video.caption ?? "Untitled"}
                    </span>
                  </div>
                </td>
                <td className="p-3 text-right font-medium">
                  {video.views.toLocaleString()}
                </td>
                <td className="p-3 text-right">
                  {video.likes.toLocaleString()}
                </td>
                <td className="p-3 text-right">
                  {video.comments.toLocaleString()}
                </td>
                <td className="p-3 text-right">
                  {video.shares.toLocaleString()}
                </td>
                <td className="p-3 text-right">
                  <span
                    className={cn(
                      "font-medium",
                      video.completionRate >= 70 && "text-green-600",
                      video.completionRate >= 40 &&
                        video.completionRate < 70 &&
                        "text-yellow-600",
                      video.completionRate < 40 && "text-red-600",
                    )}
                  >
                    {video.completionRate}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Post Stats Section
function PostStatsSection({ timeRange }: { timeRange: TimeRange }) {
  const trpc = useTRPC();

  const { data } = useSuspenseQuery(
    trpc.analytics.getPostStats.queryOptions({ timeRange }),
  );

  if (data.posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
        <p className="text-lg font-medium">No posts yet</p>
        <p className="text-sm text-muted-foreground">
          Create your first post to see analytics
        </p>
        <Button asChild className="mt-4">
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {data.totalViews.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Total Views</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {data.totalReactions.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Total Reactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {data.totalComments.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Total Comments</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {data.postCount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Posts Created</p>
          </CardContent>
        </Card>
      </div>
      <h3 className="text-lg font-semibold">Post Performance</h3>
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full min-w-[500px]">
          <thead>
            <tr className="border-b bg-muted/50 text-left text-sm font-medium text-muted-foreground">
              <th className="p-3">Post</th>
              <th className="p-3 text-right">Views</th>
              <th className="p-3 text-right">Reactions</th>
              <th className="p-3 text-right">Comments</th>
              <th className="p-3 text-right">Date</th>
            </tr>
          </thead>
          <tbody>
            {data.posts.map((post) => (
              <tr key={post.id} className="border-b last:border-0">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    {post.thumbnailUrl ? (
                      <img
                        src={post.thumbnailUrl}
                        alt=""
                        className="h-10 w-10 shrink-0 rounded object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-muted">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <span className="line-clamp-2 max-w-[200px] text-sm md:max-w-[300px]">
                      {post.shortBody ?? post.body.substring(0, 100)}
                    </span>
                  </div>
                </td>
                <td className="p-3 text-right font-medium">
                  {post.views.toLocaleString()}
                </td>
                <td className="p-3 text-right">
                  {post.reactions.toLocaleString()}
                </td>
                <td className="p-3 text-right">
                  {post.comments.toLocaleString()}
                </td>
                <td className="p-3 text-right text-sm text-muted-foreground">
                  {new Date(post.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Top Content Section
function TopContentSection({ timeRange }: { timeRange: TimeRange }) {
  const trpc = useTRPC();
  const [sortBy, setSortBy] = useState<
    "views" | "likes" | "shares" | "comments"
  >("views");

  const { data } = useSuspenseQuery(
    trpc.analytics.getTopContent.queryOptions({
      timeRange,
      limit: 10,
      sortBy,
    }),
  );

  if (data.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <BarChart3 className="mb-4 h-12 w-12 text-muted-foreground" />
        <p className="text-lg font-medium">No content yet</p>
        <p className="text-sm text-muted-foreground">
          Create content to see what performs best
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Top Performing Content</h3>
        <Select
          value={sortBy}
          onValueChange={(value) => setSortBy(value as typeof sortBy)}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="views">By Views</SelectItem>
            <SelectItem value="likes">By Likes</SelectItem>
            <SelectItem value="shares">By Shares</SelectItem>
            <SelectItem value="comments">By Comments</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {data.items.map((item, index) => (
          <Card key={`${item.type}-${item.id}`}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {index + 1}
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center gap-2">
                  {item.type === "video" ? (
                    <Video className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  )}
                  <p className="truncate text-sm font-medium">{item.title}</p>
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>{item.views.toLocaleString()} views</span>
                  <span>{item.likes.toLocaleString()} likes</span>
                  {item.type === "video" && (
                    <span>{item.shares.toLocaleString()} shares</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Audience Insights Section
function AudienceInsightsSection({ timeRange }: { timeRange: TimeRange }) {
  const trpc = useTRPC();

  const { data } = useSuspenseQuery(
    trpc.analytics.getAudienceInsights.queryOptions({ timeRange }),
  );

  const geoColors = [
    CHART_COLORS.views,
    CHART_COLORS.likes,
    CHART_COLORS.comments,
    CHART_COLORS.shares,
    CHART_COLORS.followers,
    "hsl(190, 80%, 50%)",
    "hsl(45, 90%, 50%)",
    "hsl(320, 70%, 50%)",
    "hsl(160, 60%, 45%)",
    "hsl(260, 65%, 55%)",
  ];

  const geoData = data.geoDistribution.map((g, index) => ({
    name: g.country,
    value: g.count,
    color: geoColors[index % geoColors.length] ?? CHART_COLORS.views,
  }));

  const followerGrowthData = data.followerGrowth.map((f) => ({
    date: f.date,
    followers: f.count,
  }));
  const filledFollowerGrowthData = fillTimeSeriesWithZeros(
    followerGrowthData,
    timeRange,
    ["followers"],
  );

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Audience Insights</h2>

      {/* Follower Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Followers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {data.totalFollowers.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              New Followers
            </CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              +{data.newFollowers.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">This period</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Follower Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Follower Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filledFollowerGrowthData.length > 0 ? (
              <AreaChart
                data={filledFollowerGrowthData}
                dataKeys={[
                  {
                    key: "followers",
                    label: "New Followers",
                    color: CHART_COLORS.followers,
                  },
                ]}
                height={250}
              />
            ) : null}
          </CardContent>
        </Card>

        {/* Geographic Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Top Locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {geoData.length > 0 ? (
              <BarChart data={geoData} height={250} layout="horizontal" />
            ) : (
              <div className="flex h-[250px] items-center justify-center text-muted-foreground">
                No location data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Most Engaged Followers */}
      {data.engagedFollowers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Most Engaged Followers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {data.engagedFollowers.map((follower) => (
                <div
                  key={follower.userId}
                  className="flex items-center gap-3 rounded-lg border p-3"
                >
                  {follower.image ? (
                    <img
                      src={follower.image}
                      alt=""
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      <Users className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium">
                      {follower.name ?? "Anonymous"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {follower.viewCount} views
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Feed Analytics Section
function FeedAnalyticsSection({ timeRange }: { timeRange: TimeRange }) {
  const trpc = useTRPC();

  const { data } = useSuspenseQuery(
    trpc.analytics.getFeedAnalytics.queryOptions({ timeRange }),
  );

  if (data.feeds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Rss className="mb-4 h-12 w-12 text-muted-foreground" />
        <p className="text-lg font-medium">No feeds yet</p>
        <p className="text-sm text-muted-foreground">
          Create your first feed to see analytics
        </p>
        <Button asChild className="mt-4">
          <Link href="/my-feeds">Manage Feeds</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Feed Totals */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {data.totalFeeds.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Total Feeds</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {data.totalFeedFollowers.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Feed Subscribers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {data.totalFeedPosts.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Posts Sent</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {data.totalFeedViews.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Post Views</p>
          </CardContent>
        </Card>
      </div>

      {/* Feed List */}
      <h3 className="text-lg font-semibold">Feed Performance</h3>
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full min-w-[500px]">
          <thead>
            <tr className="border-b bg-muted/50 text-left text-sm font-medium text-muted-foreground">
              <th className="p-3">Feed</th>
              <th className="p-3 text-right">Subscribers</th>
              <th className="p-3 text-right">Posts</th>
              <th className="p-3 text-right">Views</th>
              <th className="p-3 text-right">Reactions</th>
            </tr>
          </thead>
          <tbody>
            {data.feeds.map((feed) => (
              <tr key={feed.id} className="border-b last:border-0">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    {feed.image ? (
                      <img
                        src={feed.image}
                        alt=""
                        className="h-10 w-10 shrink-0 rounded object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-muted">
                        <Rss className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {feed.name}
                      </p>
                      {feed.description && (
                        <p className="line-clamp-1 text-xs text-muted-foreground">
                          {feed.description}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="p-3 text-right font-medium">
                  {feed.followerCount.toLocaleString()}
                </td>
                <td className="p-3 text-right">
                  {feed.postCount.toLocaleString()}
                </td>
                <td className="p-3 text-right">
                  {feed.viewCount.toLocaleString()}
                </td>
                <td className="p-3 text-right">
                  {feed.reactionCount.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Main Analytics Page
export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("week");

  return (
    <div className="container mx-auto max-w-7xl space-y-6 p-4 md:space-y-8 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="shrink-0">
            <Link href="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold md:text-2xl">
              Analytics Dashboard
            </h1>
            <p className="text-sm text-muted-foreground md:text-base">
              Comprehensive insights into your content and audience
            </p>
          </div>
        </div>
        <Select
          value={timeRange}
          onValueChange={(value) => setTimeRange(value as TimeRange)}
        >
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue />
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

      {/* Overview Stats with Sparklines */}
      <Suspense fallback={<LoadingCards />}>
        <OverviewSection timeRange={timeRange} />
      </Suspense>

      {/* Secondary Stats */}
      <Suspense fallback={<LoadingCards />}>
        <SecondaryStatsSection timeRange={timeRange} />
      </Suspense>

      {/* Engagement Timeline */}
      <Suspense fallback={<LoadingChart />}>
        <EngagementTimelineSection timeRange={timeRange} />
      </Suspense>

      {/* Tabs for Content Performance */}
      <Tabs defaultValue="videos" className="space-y-6">
        <div className="overflow-x-auto">
          <TabsList className="inline-flex w-full min-w-[350px] md:w-auto lg:w-[400px]">
            <TabsTrigger value="videos" className="flex-1">
              Videos
            </TabsTrigger>
            <TabsTrigger value="posts" className="flex-1">
              Posts
            </TabsTrigger>
            <TabsTrigger value="top" className="flex-1">
              Top Content
            </TabsTrigger>
            <TabsTrigger value="feeds" className="flex-1">
              Feeds
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="videos" className="space-y-6">
          <Suspense fallback={<LoadingTable />}>
            <VideoStatsSection timeRange={timeRange} />
          </Suspense>
        </TabsContent>

        <TabsContent value="posts" className="space-y-6">
          <Suspense fallback={<LoadingTable />}>
            <PostStatsSection timeRange={timeRange} />
          </Suspense>
        </TabsContent>

        <TabsContent value="top" className="space-y-6">
          <Suspense fallback={<LoadingTable />}>
            <TopContentSection timeRange={timeRange} />
          </Suspense>
        </TabsContent>

        <TabsContent value="feeds" className="space-y-6">
          <Suspense fallback={<LoadingTable />}>
            <FeedAnalyticsSection timeRange={timeRange} />
          </Suspense>
        </TabsContent>
      </Tabs>

      {/* Audience Insights Section */}
      <Suspense fallback={<LoadingAudience />}>
        <AudienceInsightsSection timeRange={timeRange} />
      </Suspense>
    </div>
  );
}
