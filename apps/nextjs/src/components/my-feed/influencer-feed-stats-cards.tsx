"use client";

import { Link2, Send, TrendingUp } from "lucide-react";

import { Card, CardContent } from "@galileyo/ui/card";
import { Skeleton } from "@galileyo/ui/skeleton";

import { CopyButton } from "../ui/copy-button";

interface InfluencerFeedListData {
  promocode: string;
  has_promocode_service: boolean;
  affiliate_link: string;
  sended_this_month: number;
}

export function InfluencerFeedStatsCards({
  data,
  isLoading,
}: {
  data?: InfluencerFeedListData;
  isLoading: boolean;
}) {
  const promoCode = data?.has_promocode_service
    ? new URL(`${window.location.origin}/${data.promocode.trim()}`).href
    : "";
  const affiliateLink = data?.affiliate_link.trim() ?? "";
  const hasPromoCode =
    promoCode.length > 0 && Boolean(data?.has_promocode_service);
  const referralLabel = hasPromoCode ? "Promo Code" : "Affiliate Link";
  const referralValue = hasPromoCode ? promoCode : affiliateLink;
  const referralHint = hasPromoCode
    ? "Copy and share your promo code with your audience"
    : "Copy and share your referral link";

  if (isLoading) {
    return (
      <>
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
      {/* Referral Card */}
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
              {referralLabel}
            </p>
            <div className="flex min-w-0 items-center gap-2">
              <p className="flex-1 truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                {referralValue || "Not available"}
              </p>
              {referralValue ? <CopyButton text={referralValue} /> : null}
            </div>
            {referralValue && (
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                {referralHint}
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
