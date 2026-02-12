"use client";

import { useEffect } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Clock,
  Edit2,
  FileVideo,
  Loader2,
  MoreVertical,
  Send,
  Trash2,
} from "lucide-react";
import { useInView } from "react-intersection-observer";

import { cn } from "@galileyo/ui";
import { Button } from "@galileyo/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@galileyo/ui/dropdown-menu";
import { toast } from "@galileyo/ui/toast";

import { getVideoThumbnailProxyUrl } from "~/lib/video-proxy";
import { useTRPC } from "~/trpc/react";

interface DraftsListProps {
  className?: string;
}

export function DraftsList({ className }: DraftsListProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { ref: loadMoreRef, inView } = useInView();

  const queryOptions = trpc.video.getDrafts.infiniteQueryOptions({
    limit: 20,
  });

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      ...queryOptions,
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? null,
      initialPageParam: null as number | null,
    });

  const publishMutation = useMutation(
    trpc.video.publishVideo.mutationOptions({
      onSuccess: () => {
        toast.success("Video published successfully");
        void queryClient.invalidateQueries(trpc.video.getDrafts.pathFilter());
        void queryClient.invalidateQueries(trpc.video.list.pathFilter());
      },
      onError: () => {
        toast.error("Failed to publish video");
      },
    }),
  );

  const deleteMutation = useMutation(
    trpc.video.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Draft deleted");
        void queryClient.invalidateQueries(trpc.video.getDrafts.pathFilter());
      },
      onError: () => {
        toast.error("Failed to delete draft");
      },
    }),
  );

  // Load more when near the end
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const drafts = data?.pages.flatMap((page) => page.items) ?? [];

  const formatDuration = (seconds: number | null): string => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (drafts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileVideo className="mb-4 h-12 w-12 text-muted-foreground/50" />
        <p className="text-lg font-medium text-muted-foreground">No drafts</p>
        <p className="mt-1 text-sm text-muted-foreground/70">
          Videos saved as drafts will appear here
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {drafts.map((draft) => (
          <div
            key={draft.id}
            className="group relative overflow-hidden rounded-lg border bg-card"
          >
            {/* Thumbnail */}
            <div className="relative aspect-video bg-muted">
              {draft.thumbnailUrl ? (
                <img
                  src={getVideoThumbnailProxyUrl(draft.id, draft.thumbnailUrl)}
                  alt={draft.caption ?? "Draft video"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                  <FileVideo className="h-8 w-8 text-primary/50" />
                </div>
              )}

              {/* Duration badge */}
              {draft.duration && (
                <div className="absolute bottom-2 right-2 rounded bg-black/60 px-1.5 py-0.5 text-xs font-medium text-white">
                  {formatDuration(draft.duration)}
                </div>
              )}

              {/* Processing indicator */}
              {draft.transcodingStatus !== "ready" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="flex items-center gap-2 rounded bg-black/60 px-3 py-1.5 text-xs text-white">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Processing...
                  </div>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 overflow-hidden">
                  <p className="truncate font-medium">
                    {draft.caption ?? "Untitled draft"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    <Clock className="mr-1 inline-block h-3 w-3" />
                    Saved {formatDate(draft.updatedAt)}
                  </p>
                </div>

                {/* Actions dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() =>
                        publishMutation.mutate({ videoId: draft.id })
                      }
                      disabled={
                        draft.transcodingStatus !== "ready" ||
                        publishMutation.isPending
                      }
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Publish now
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled>
                      <Edit2 className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => deleteMutation.mutate({ id: draft.id })}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
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
