"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Hash, Loader2, TrendingUp } from "lucide-react";

import { cn } from "@galileyo/ui";
import { Badge } from "@galileyo/ui/badge";
import { ScrollArea, ScrollBar } from "@galileyo/ui/scroll-area";

import { formatCount } from "~/lib/format";
import { useTRPC } from "~/trpc/react";

interface TrendingHashtagsProps {
  limit?: number;
  className?: string;
  orientation?: "horizontal" | "vertical";
}

export function TrendingHashtags({
  limit = 10,
  className,
  orientation = "horizontal",
}: TrendingHashtagsProps) {
  const trpc = useTRPC();

  const { data, isLoading, error } = useQuery(
    trpc.video.getTrendingHashtags.queryOptions({ limit }),
  );

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center py-4", className)}>
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cn(
          "py-4 text-center text-sm text-muted-foreground",
          className,
        )}
      >
        Failed to load trending hashtags
      </div>
    );
  }

  if (!data?.items || data.items.length === 0) {
    return (
      <div
        className={cn(
          "py-4 text-center text-sm text-muted-foreground",
          className,
        )}
      >
        <Hash className="mx-auto mb-2 h-6 w-6 opacity-50" />
        No trending hashtags yet
      </div>
    );
  }

  if (orientation === "vertical") {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="mb-3 flex items-center gap-2 px-3">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Trending Hashtags</h3>
        </div>
        {data.items.map((tag, index) => (
          <Link
            key={tag.id}
            href={`/videos/tag/${tag.name}`}
            className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-muted/50"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
              {index + 1}
            </span>
            <div className="flex-1">
              <p className="font-medium">#{tag.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatCount(tag.videoCount)} videos
              </p>
            </div>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2 px-4">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h3 className="text-sm font-semibold">Trending</h3>
      </div>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-2 px-4 pb-3">
          {data.items.map((tag) => (
            <Link key={tag.id} href={`/videos/tag/${tag.name}`}>
              <Badge
                variant="secondary"
                className="cursor-pointer gap-1.5 px-3 py-1.5 text-sm transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <Hash className="h-3 w-3" />
                {tag.name}
                <span className="ml-1 text-xs opacity-70">
                  {formatCount(tag.videoCount)}
                </span>
              </Badge>
            </Link>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
