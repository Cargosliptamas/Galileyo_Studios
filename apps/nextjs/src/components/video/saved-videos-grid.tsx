"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Bookmark, Heart, Loader2, Play } from "lucide-react";
import { useInView } from "react-intersection-observer";

import { cn } from "@galileyo/ui";

import { formatCount } from "~/lib/format";
import { getVideoThumbnailProxyUrl } from "~/lib/video-proxy";
import { useTRPC } from "~/trpc/react";

interface SavedVideosGridProps {
  collectionId?: number;
  className?: string;
}

export function SavedVideosGrid({
  collectionId,
  className,
}: SavedVideosGridProps) {
  const trpc = useTRPC();
  const { ref: loadMoreRef, inView } = useInView();

  const queryOptions = trpc.video.getSavedVideos.infiniteQueryOptions({
    collectionId,
    limit: 20,
  });

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      ...queryOptions,
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? null,
      initialPageParam: null as number | null,
    });

  // Load more when near the end
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const videos = data?.pages.flatMap((page) => page.items) ?? [];

  const formatDuration = (seconds: number | null): string => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Bookmark className="mb-4 h-12 w-12 text-muted-foreground/50" />
        <p className="text-lg font-medium text-muted-foreground">
          No saved videos
        </p>
        <p className="mt-1 text-sm text-muted-foreground/70">
          Videos you save will appear here
        </p>
        <Link
          href="/videos"
          className="mt-4 text-sm font-medium text-primary hover:underline"
        >
          Browse videos
        </Link>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Video Grid */}
      <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {videos.map((item) => (
          <Link
            key={item.saveId}
            href={`/videos?v=${item.video.id}`}
            className="group relative aspect-[9/16] overflow-hidden rounded-lg bg-muted"
          >
            {/* Thumbnail */}
            {item.video.thumbnailUrl ? (
              <img
                src={getVideoThumbnailProxyUrl(
                  item.video.id,
                  item.video.thumbnailUrl,
                )}
                alt={item.video.caption ?? "Video thumbnail"}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
                <Play className="h-8 w-8 text-white" />
              </div>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Duration badge */}
            {item.video.duration && (
              <div className="absolute right-2 top-2 rounded bg-black/60 px-1.5 py-0.5 text-xs font-medium text-white">
                {formatDuration(item.video.duration)}
              </div>
            )}

            {/* Stats overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-2">
              <div className="flex items-center gap-2 text-xs text-white">
                <span className="flex items-center gap-0.5">
                  <Play className="h-3 w-3" fill="white" />
                  {formatCount(item.video.likeCount)}
                </span>
                <span className="flex items-center gap-0.5">
                  <Heart className="h-3 w-3" />
                  {formatCount(item.video.likeCount)}
                </span>
              </div>
              {item.video.caption && (
                <p className="mt-1 line-clamp-2 text-xs text-white/90">
                  {item.video.caption}
                </p>
              )}
            </div>

            {/* Play icon on hover */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
              <div className="rounded-full bg-black/40 p-3">
                <Play className="h-6 w-6 text-white" fill="white" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Load more trigger */}
      <div ref={loadMoreRef} className="h-1" />

      {/* Loading more indicator */}
      {isFetchingNextPage && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
