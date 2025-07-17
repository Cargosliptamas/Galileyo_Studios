import { Card, CardContent, CardHeader } from "@galileyo/ui/card";
import { Skeleton } from "@galileyo/ui/skeleton";

export default function FeedCardSkeleton() {
  return (
    <Card className="animate-pulse border-slate-200 bg-white/50 transition-colors hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-600">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <Skeleton className="h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-700" />
            <div className="flex-1">
              {/* Title and badges */}
              <div className="mb-1 flex items-center gap-2">
                <Skeleton className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-700" />
                <Skeleton className="h-4 w-6 rounded bg-slate-200 dark:bg-slate-700" />
                <Skeleton className="h-4 w-16 rounded bg-slate-200 dark:bg-slate-700" />
              </div>
              {/* Meta info */}
              <div className="flex items-center gap-2 text-sm">
                <Skeleton className="h-3 w-20 rounded bg-slate-200 dark:bg-slate-700" />
                <Skeleton className="h-3 w-3 rounded-full bg-slate-200 dark:bg-slate-700" />
                <Skeleton className="h-3 w-16 rounded bg-slate-200 dark:bg-slate-700" />
                <Skeleton className="h-3 w-3 rounded-full bg-slate-200 dark:bg-slate-700" />
                <Skeleton className="h-3 w-20 rounded bg-slate-200 dark:bg-slate-700" />
              </div>
            </div>
          </div>
          {/* Dropdown menu icon */}
          <Skeleton className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        {/* Post Type Badge */}
        <div className="mt-2">
          <Skeleton className="h-5 w-32 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Post Content */}
        <Skeleton className="mb-2 h-4 w-full rounded bg-slate-200 dark:bg-slate-700" />
        <Skeleton className="mb-2 h-4 w-5/6 rounded bg-slate-200 dark:bg-slate-700" />
        <Skeleton className="mb-4 h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
        {/* Post Image */}
        {/* <Skeleton className="w-full h-48 mb-4 rounded-lg bg-slate-700" />
        <Separator className="my-4 bg-slate-700" /> */}
        {/* Post Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Skeleton className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700" />
            <Skeleton className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700" />
            <Skeleton className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700" />
          </div>
          <Skeleton className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
      </CardContent>
    </Card>
  );
}
