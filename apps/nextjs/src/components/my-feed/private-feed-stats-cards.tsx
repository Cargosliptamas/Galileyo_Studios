"use client";

import { Lock, Users } from "lucide-react";

import { Card, CardContent } from "@galileyo/ui/card";
import { Skeleton } from "@galileyo/ui/skeleton";

interface PrivateFeedListData {
  list: { id: number }[];
  private_feed_maximum: number;
  private_feed_remainder: number;
}

export function PrivateFeedStatsCards({
  data,
  isLoading,
}: {
  data?: PrivateFeedListData;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <>
        {/* Private Feed Limit Card Skeleton */}
        <Card className="group relative overflow-hidden border-slate-200 bg-gradient-to-br from-purple-50 to-pink-50 transition-all duration-300 dark:border-slate-700 dark:from-purple-950/20 dark:to-pink-950/20">
          <CardContent className="relative p-6">
            <div className="mb-4">
              <Skeleton className="h-12 w-12 rounded-xl bg-slate-200 dark:bg-slate-700" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="flex items-baseline gap-2">
                <Skeleton className="h-9 w-16 rounded bg-slate-200 dark:bg-slate-700" />
                <Skeleton className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-700" />
              </div>
              <Skeleton className="mt-2 h-3 w-full rounded bg-slate-200 dark:bg-slate-700" />
              <Skeleton className="h-3 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
            </div>
          </CardContent>
        </Card>

        {/* Total Feeds Card Skeleton */}
        <Card className="group relative overflow-hidden border-slate-200 bg-gradient-to-br from-blue-50 to-cyan-50 transition-all duration-300 dark:border-slate-700 dark:from-blue-950/20 dark:to-cyan-950/20">
          <CardContent className="relative p-6">
            <div className="mb-4">
              <Skeleton className="h-12 w-12 rounded-xl bg-slate-200 dark:bg-slate-700" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="flex items-baseline gap-2">
                <Skeleton className="h-9 w-16 rounded bg-slate-200 dark:bg-slate-700" />
                <Skeleton className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-700" />
              </div>
              <Skeleton className="mt-2 h-3 w-full rounded bg-slate-200 dark:bg-slate-700" />
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      {/* Private Feed Limit Card */}
      <Card className="group relative overflow-hidden border-slate-200 bg-gradient-to-br from-purple-50 to-pink-50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg dark:border-slate-700 dark:from-purple-950/20 dark:to-pink-950/20">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <CardContent className="relative p-6">
          <div className="mb-4">
            <div className="w-fit rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 p-3 text-white shadow-lg">
              <Lock className="h-6 w-6" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Private Feed Limit
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {data?.private_feed_remainder ?? 0}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                of {data?.private_feed_maximum ?? 0} remaining
              </p>
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              You can create {data?.private_feed_remainder ?? 0} more private
              feed{data?.private_feed_remainder !== 1 ? "s" : ""} with your
              current plan.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Total Feeds Card */}
      <Card className="group relative overflow-hidden border-slate-200 bg-gradient-to-br from-blue-50 to-cyan-50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg dark:border-slate-700 dark:from-blue-950/20 dark:to-cyan-950/20">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <CardContent className="relative p-6">
          <div className="mb-4">
            <div className="w-fit rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 p-3 text-white shadow-lg">
              <Users className="h-6 w-6" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Total Private Feeds
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {data?.list.length ?? 0}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                active feed{data?.list.length !== 1 ? "s" : ""}
              </p>
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Manage your private feeds and invite followers to join.
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
