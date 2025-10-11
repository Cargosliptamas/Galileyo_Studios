"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  Separator,
} from "@galileyo/ui";

// Skeleton component for plan card loading state
export function PlanCardSkeleton({
  showBadge = false,
  showFeatures = true,
  showButton = true,
}: {
  showBadge?: boolean;
  showFeatures?: boolean;
  showButton?: boolean;
}) {
  return (
    <Card className="relative border-slate-200 bg-white/50 dark:border-slate-700 dark:bg-slate-800/50">
      {showBadge && (
        <div className="absolute -top-2 left-4">
          <div className="h-6 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        </div>
      )}

      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Plan name skeleton */}
            <div className="mb-2 h-6 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />

            {/* Description skeleton */}
            <div className="h-4 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          </div>

          <div className="text-right">
            {/* Price skeleton */}
            <div className="mb-1 h-8 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-4 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {showFeatures && (
          <>
            <Separator className="my-4" />
            <div className="space-y-3">
              {/* Features title skeleton */}
              <div className="h-5 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />

              {/* Feature items skeleton */}
              <div className="grid gap-2">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-1"
                  >
                    <div className="h-4 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                    <div className="h-4 w-12 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>

      {showButton && (
        <CardFooter className="pt-4">
          <div className="h-10 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        </CardFooter>
      )}
    </Card>
  );
}
