"use client";

import { Gift, Link2, Pencil, Send, TrendingUp } from "lucide-react";

import { Button } from "@galileyo/ui/button";
import { Card, CardContent } from "@galileyo/ui/card";
import { Skeleton } from "@galileyo/ui/skeleton";

import { CopyButton } from "../ui/copy-button";

interface InfluencerFeedListData {
  promocode: string;
  affiliate_link: string;
  sended_this_month: number;
}

export function InfluencerFeedStatsCards({
  data,
  isLoading,
  onEditPromocode,
}: {
  data?: InfluencerFeedListData;
  isLoading: boolean;
  onEditPromocode: () => void;
}) {
  if (isLoading) {
    return (
      <>
        {/* Promocode Card Skeleton */}
        <Card className="group relative overflow-hidden border-slate-200 bg-gradient-to-br from-purple-50 to-pink-50 transition-all duration-300 dark:border-slate-700 dark:from-purple-950/20 dark:to-pink-950/20">
          <CardContent className="relative p-6">
            <div className="mb-4">
              <Skeleton className="h-12 w-12 rounded-xl bg-slate-200 dark:bg-slate-700" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="flex min-w-0 items-center gap-2">
                <Skeleton className="h-8 w-32 rounded bg-slate-200 dark:bg-slate-700" />
                <Skeleton className="h-8 w-8 rounded bg-slate-200 dark:bg-slate-700" />
              </div>
              <Skeleton className="mt-2 h-3 w-full rounded bg-slate-200 dark:bg-slate-700" />
            </div>
          </CardContent>
        </Card>

        {/* Affiliate Link Card Skeleton */}
        <Card className="group relative overflow-hidden border-slate-200 bg-gradient-to-br from-blue-50 to-cyan-50 transition-all duration-300 dark:border-slate-700 dark:from-blue-950/20 dark:to-cyan-950/20">
          <CardContent className="relative p-6">
            <div className="mb-4">
              <Skeleton className="h-12 w-12 rounded-xl bg-slate-200 dark:bg-slate-700" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-4 w-28 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="flex min-w-0 items-center gap-2">
                <Skeleton className="h-5 w-full rounded bg-slate-200 dark:bg-slate-700" />
                <Skeleton className="h-8 w-8 rounded bg-slate-200 dark:bg-slate-700" />
              </div>
              <Skeleton className="mt-2 h-3 w-full rounded bg-slate-200 dark:bg-slate-700" />
            </div>
          </CardContent>
        </Card>

        {/* Sent This Month Card Skeleton */}
        <Card className="group relative overflow-hidden border-slate-200 bg-gradient-to-br from-emerald-50 to-teal-50 transition-all duration-300 dark:border-slate-700 dark:from-emerald-950/20 dark:to-teal-950/20">
          <CardContent className="relative p-6">
            <div className="mb-4 flex items-start justify-between">
              <Skeleton className="h-12 w-12 rounded-xl bg-slate-200 dark:bg-slate-700" />
              <Skeleton className="h-6 w-16 rounded-full bg-slate-200 dark:bg-slate-700" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-4 w-20 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="flex items-baseline gap-2">
                <Skeleton className="h-9 w-16 rounded bg-slate-200 dark:bg-slate-700" />
                <Skeleton className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-700" />
              </div>
              <Skeleton className="mt-2 h-3 w-full rounded bg-slate-200 dark:bg-slate-700" />
              <Skeleton className="h-3 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      {/* Promocode Card */}
      <Card className="group relative overflow-hidden border-slate-200 bg-gradient-to-br from-purple-50 to-pink-50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg dark:border-slate-700 dark:from-purple-950/20 dark:to-pink-950/20">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <CardContent className="relative p-6">
          <div className="mb-4">
            <div className="w-fit rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 p-3 text-white shadow-lg">
              <Gift className="h-6 w-6" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Promocode
            </p>
            <div className="flex min-w-0 items-center gap-2">
              <p className="flex-1 truncate text-2xl font-bold text-slate-900 dark:text-slate-100">
                {data?.promocode ?? "Not set"}
              </p>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 flex-shrink-0 opacity-70 transition-opacity hover:opacity-100"
                onClick={onEditPromocode}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
            {data?.promocode && (
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Share this code with your audience
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Affiliate Link Card */}
      <Card className="group relative overflow-hidden border-slate-200 bg-gradient-to-br from-blue-50 to-cyan-50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg dark:border-slate-700 dark:from-blue-950/20 dark:to-cyan-950/20">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <CardContent className="relative p-6">
          <div className="mb-4">
            <div className="w-fit rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 p-3 text-white shadow-lg">
              <Link2 className="h-6 w-6" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Affiliate Link
            </p>
            <div className="flex min-w-0 items-center gap-2">
              <p className="flex-1 truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                {data?.affiliate_link ?? "Not available"}
              </p>
              {data?.affiliate_link && (
                <CopyButton text={data.affiliate_link} />
              )}
            </div>
            {data?.affiliate_link && (
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Copy and share your referral link
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sent This Month Card */}
      <Card className="group relative overflow-hidden border-slate-200 bg-gradient-to-br from-emerald-50 to-teal-50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg dark:border-slate-700 dark:from-emerald-950/20 dark:to-teal-950/20">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <CardContent className="relative p-6">
          <div className="mb-4 flex items-start justify-between">
            <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 p-3 text-white shadow-lg">
              <Send className="h-6 w-6" />
            </div>
            <div className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 dark:bg-emerald-900/30">
              <TrendingUp className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Statistics
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {data?.sended_this_month ?? 0}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                posts sent this month
              </p>
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Share more posts to engage your audience and grow your influence
              even further.
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
