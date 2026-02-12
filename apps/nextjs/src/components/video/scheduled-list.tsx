"use client";

import { useEffect, useState } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Calendar,
  CalendarClock,
  Clock,
  FileVideo,
  Loader2,
  MoreVertical,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { useInView } from "react-intersection-observer";

import { cn } from "@galileyo/ui";
import { Button } from "@galileyo/ui/button";
import { Calendar as CalendarUI } from "@galileyo/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@galileyo/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@galileyo/ui/dropdown-menu";
import { Input } from "@galileyo/ui/input";
import { Label } from "@galileyo/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@galileyo/ui/popover";
import { toast } from "@galileyo/ui/toast";

import { getVideoThumbnailProxyUrl } from "~/lib/video-proxy";
import { useTRPC } from "~/trpc/react";

interface ScheduledListProps {
  className?: string;
}

export function ScheduledList({ className }: ScheduledListProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { ref: loadMoreRef, inView } = useInView();
  const [rescheduleVideoId, setRescheduleVideoId] = useState<number | null>(
    null,
  );
  const [rescheduleDate, setRescheduleDate] = useState<Date | undefined>();
  const [rescheduleTime, setRescheduleTime] = useState("12:00");

  const queryOptions = trpc.video.getScheduledVideos.infiniteQueryOptions({
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
        void queryClient.invalidateQueries(
          trpc.video.getScheduledVideos.pathFilter(),
        );
        void queryClient.invalidateQueries(trpc.video.list.pathFilter());
      },
      onError: () => {
        toast.error("Failed to publish video");
      },
    }),
  );

  const cancelScheduleMutation = useMutation(
    trpc.video.cancelSchedule.mutationOptions({
      onSuccess: () => {
        toast.success("Schedule cancelled - moved to drafts");
        void queryClient.invalidateQueries(
          trpc.video.getScheduledVideos.pathFilter(),
        );
        void queryClient.invalidateQueries(trpc.video.getDrafts.pathFilter());
      },
      onError: () => {
        toast.error("Failed to cancel schedule");
      },
    }),
  );

  const rescheduleMutation = useMutation(
    trpc.video.scheduleVideo.mutationOptions({
      onSuccess: () => {
        toast.success("Video rescheduled");
        setRescheduleVideoId(null);
        setRescheduleDate(undefined);
        setRescheduleTime("12:00");
        void queryClient.invalidateQueries(
          trpc.video.getScheduledVideos.pathFilter(),
        );
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const deleteMutation = useMutation(
    trpc.video.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Video deleted");
        void queryClient.invalidateQueries(
          trpc.video.getScheduledVideos.pathFilter(),
        );
      },
      onError: () => {
        toast.error("Failed to delete video");
      },
    }),
  );

  // Load more when near the end
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const scheduled = data?.pages.flatMap((page) => page.items) ?? [];

  const formatDuration = (seconds: number | null): string => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatScheduledDate = (dateString: string | null): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getTimeUntil = (dateString: string | null): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diff = date.getTime() - now.getTime();

    if (diff < 0) return "Past due";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `in ${days}d ${hours}h`;
    if (hours > 0) return `in ${hours}h ${minutes}m`;
    return `in ${minutes}m`;
  };

  const handleReschedule = () => {
    if (!rescheduleVideoId || !rescheduleDate) return;

    const [hours, minutes] = rescheduleTime.split(":").map(Number);
    const scheduledAt = new Date(rescheduleDate);
    scheduledAt.setHours(hours ?? 0, minutes ?? 0, 0, 0);

    rescheduleMutation.mutate({
      videoId: rescheduleVideoId,
      scheduledAt: scheduledAt.toISOString(),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (scheduled.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <CalendarClock className="mb-4 h-12 w-12 text-muted-foreground/50" />
        <p className="text-lg font-medium text-muted-foreground">
          No scheduled videos
        </p>
        <p className="mt-1 text-sm text-muted-foreground/70">
          Schedule videos to publish them later
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {scheduled.map((video) => (
          <div
            key={video.id}
            className="group relative overflow-hidden rounded-lg border bg-card"
          >
            {/* Thumbnail */}
            <div className="relative aspect-video bg-muted">
              {video.thumbnailUrl ? (
                <img
                  src={getVideoThumbnailProxyUrl(video.id, video.thumbnailUrl)}
                  alt={video.caption ?? "Scheduled video"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                  <FileVideo className="h-8 w-8 text-primary/50" />
                </div>
              )}

              {/* Duration badge */}
              {video.duration && (
                <div className="absolute bottom-2 right-2 rounded bg-black/60 px-1.5 py-0.5 text-xs font-medium text-white">
                  {formatDuration(video.duration)}
                </div>
              )}

              {/* Scheduled badge */}
              <div className="absolute left-2 top-2 flex items-center gap-1 rounded bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
                <Clock className="h-3 w-3" />
                {getTimeUntil(video.scheduledAt)}
              </div>
            </div>

            {/* Info */}
            <div className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 overflow-hidden">
                  <p className="truncate font-medium">
                    {video.caption ?? "Untitled video"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    <Calendar className="mr-1 inline-block h-3 w-3" />
                    {formatScheduledDate(video.scheduledAt)}
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
                        publishMutation.mutate({ videoId: video.id })
                      }
                      disabled={publishMutation.isPending}
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Publish now
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setRescheduleVideoId(video.id);
                        if (video.scheduledAt) {
                          const date = new Date(video.scheduledAt);
                          setRescheduleDate(date);
                          setRescheduleTime(
                            `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`,
                          );
                        }
                      }}
                    >
                      <CalendarClock className="mr-2 h-4 w-4" />
                      Reschedule
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        cancelScheduleMutation.mutate({ videoId: video.id })
                      }
                      disabled={cancelScheduleMutation.isPending}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel schedule
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => deleteMutation.mutate({ id: video.id })}
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

      {/* Reschedule Dialog */}
      <Dialog
        open={rescheduleVideoId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setRescheduleVideoId(null);
            setRescheduleDate(undefined);
            setRescheduleTime("12:00");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Video</DialogTitle>
            <DialogDescription>
              Choose a new date and time to publish this video
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !rescheduleDate && "text-muted-foreground",
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {rescheduleDate
                      ? rescheduleDate.toLocaleDateString()
                      : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarUI
                    mode="single"
                    selected={rescheduleDate}
                    onSelect={setRescheduleDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Time</Label>
              <Input
                type="time"
                value={rescheduleTime}
                onChange={(e) => setRescheduleTime(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRescheduleVideoId(null)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReschedule}
              disabled={!rescheduleDate || rescheduleMutation.isPending}
            >
              {rescheduleMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Reschedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
