"use client";

import { PlanCardSkeleton } from "./plan-card-skeleton";

export function MembershipSkeleton() {
  return (
    <div className="space-y-6">
      {/* Simulate current plan scenario */}
      <div className="space-y-6">
        {/* Current plan card skeleton */}
        <PlanCardSkeleton
          showBadge={true}
          showFeatures={true}
          showButton={false}
        />

        {/* Action buttons skeleton */}
        <div className="flex items-center justify-center gap-2">
          {/* Switch plan button skeleton */}
          <div className="h-10 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />

          {/* Cancel membership button skeleton */}
          <div className="h-10 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>
    </div>
  );
}

export function MembershipSkeletonNoCurrentPlan() {
  return (
    <div className="space-y-6">
      {/* Description skeleton */}
      <div className="h-4 w-64 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />

      {/* Plans grid skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <PlanCardSkeleton
            key={index}
            showBadge={false}
            showFeatures={true}
            showButton={true}
          />
        ))}
      </div>
    </div>
  );
}
