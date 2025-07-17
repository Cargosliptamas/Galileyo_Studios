import { Card, CardContent, CardHeader } from "@galileyo/ui/card";
import { Skeleton } from "@galileyo/ui/skeleton";

export default function FeedCardSkeleton() {
  return (
    <Card className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors animate-pulse">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <Skeleton className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700" />
            <div className="flex-1">
              {/* Title and badges */}
              <div className="flex items-center gap-2 mb-1">
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
          <Skeleton className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        {/* Post Type Badge */}
        <div className="mt-2">
          <Skeleton className="h-5 w-32 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Post Content */}
        <Skeleton className="h-4 w-full mb-2 rounded bg-slate-200 dark:bg-slate-700" />
        <Skeleton className="h-4 w-5/6 mb-2 rounded bg-slate-200 dark:bg-slate-700" />
        <Skeleton className="h-4 w-2/3 mb-4 rounded bg-slate-200 dark:bg-slate-700" />
        {/* Post Image */}
        {/* <Skeleton className="w-full h-48 mb-4 rounded-lg bg-slate-700" />
        <Separator className="my-4 bg-slate-700" /> */}
        {/* Post Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Skeleton className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700" />
            <Skeleton className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700" />
            <Skeleton className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700" />
          </div>
          <Skeleton className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
      </CardContent>
    </Card>
  );
} 