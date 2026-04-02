"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Plus, Video } from "lucide-react";

import { cn } from "@galileyo/ui";
import { Button } from "@galileyo/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@galileyo/ui/dialog";
import { Skeleton } from "@galileyo/ui/skeleton";

import type { VideoFeedType } from "./video-feed-controls";
import type { VideoFeedResponse } from "~/types/video";
import { authClient } from "~/auth/client";
import { env } from "~/env/client";
import { useRecordVideoView } from "~/hooks/use-record-video-view";
import { useVideoMute } from "~/hooks/use-video-mute";
import { useVideoScroll } from "~/hooks/use-video-scroll";
import {
  getVideoPlaybackProxyUrl,
  getVideoThumbnailProxyUrl,
} from "~/lib/video-proxy";
import { useTRPC } from "~/trpc/react";
import { getAuthenticatedNavigationModel } from "../layout/authenticated-shell-config";
import { DuetStitchBadge } from "./duet-stitch-badge";
import { VideoCommentsDrawer } from "./video-comments-drawer";
import { VideoDesktopRail } from "./video-desktop-rail";
import { VideoFeedBase } from "./video-feed-base";
import { VideoFeedControls } from "./video-feed-controls";
import { VideoInfo } from "./video-info";
import { VideoPlayer } from "./video-player";
import { VideoSidebar } from "./video-sidebar";
import { VideoUpload } from "./video-upload";

interface OriginalVideoData {
  isReaction: boolean;
  type?: "duet" | "stitch";
  original?: {
    id: number;
    caption: string | null;
    playbackId: string | null;
    playbackUrl: string | null;
    thumbnailUrl: string | null;
    duration: number | null;
    likeCount: number;
    creator: {
      id: number;
      name: string;
      image: string | null;
    };
  } | null;
}

interface VideoFeedProps {
  initialVideoId?: number;
}

const FEED_TYPE_STORAGE_KEY = "galileyo-video-feed-type";

export function VideoFeed({ initialVideoId }: VideoFeedProps) {
  const trpc = useTRPC();
  const containerRef = useRef<HTMLDivElement>(null);
  const pendingSkeletonIndexRef = useRef<number | null>(null);
  const prefetchInFlightRef = useRef(false);
  const requestedNextVideoIdRef = useRef<number | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [commentsVideoId, setCommentsVideoId] = useState<number | null>(null);
  const [commentsVideoOwnerId, setCommentsVideoOwnerId] = useState<number>(0);
  const [feedType, setFeedType] = useState<VideoFeedType>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(FEED_TYPE_STORAGE_KEY);
      return saved === "forYou" || saved === "following" ? saved : "forYou";
    }
    return "forYou";
  });
  const { data: session } = authClient.useSession();
  const currentUserId = session?.user.id ? Number(session.user.id) : 0;
  const navigation = useMemo(
    () =>
      session?.user
        ? getAuthenticatedNavigationModel(session.user, true)
        : undefined,
    [session?.user],
  );
  const { isMuted, toggleMute } = useVideoMute();
  const { recordVideoView } = useRecordVideoView();
  const [playbackRate, setPlaybackRate] = useState<
    0.5 | 0.75 | 1 | 1.25 | 1.5 | 2
  >(1);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isLoadingNextVideo, setIsLoadingNextVideo] = useState(false);
  const [showEndOfFeedNotice, setShowEndOfFeedNotice] = useState(false);
  const initialFeedLimit = Math.max(
    1,
    Math.min(env.NEXT_PUBLIC_VIDEO_FEED_INITIAL_LIMIT, 50),
  );
  const prefetchAheadCount = Math.max(
    0,
    env.NEXT_PUBLIC_VIDEO_FEED_PREFETCH_AHEAD,
  );

  // Keep /videos lightweight by loading one item first; allow larger pages when
  // deep-linking to a specific video so it's easier to locate in-feed.
  const pageSize = initialVideoId ? 10 : initialFeedLimit;

  // Fetch videos with infinite scroll, including feed type
  const queryOptions = trpc.video.list.infiniteQueryOptions({
    limit: pageSize,
    feedType,
  });

  const { data, fetchNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      ...queryOptions,
      getNextPageParam: (lastPage: VideoFeedResponse) =>
        lastPage.nextCursor ?? null,
      initialPageParam: null as number | null,
    });

  // Flatten videos from all pages
  const videos = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data?.pages],
  );
  const lastPage = data?.pages.at(-1) as VideoFeedResponse | undefined;
  const nextVideoId =
    typeof lastPage?.nextVideoId === "number" ? lastPage.nextVideoId : null;
  const hasKnownNextVideo = typeof nextVideoId === "number";
  const itemCount = videos.length + (isLoadingNextVideo ? 1 : 0);
  const { activeIndex, setActiveIndex, scrollToIndex } = useVideoScroll(
    containerRef,
    {
      itemCount,
      enableKeyboard: false,
    },
  );

  const requestNextPage = useCallback(() => {
    if (!hasKnownNextVideo) return false;
    if (isFetchingNextPage || prefetchInFlightRef.current) return false;
    if (
      typeof nextVideoId === "number" &&
      requestedNextVideoIdRef.current === nextVideoId
    ) {
      return false;
    }

    if (typeof nextVideoId === "number") {
      requestedNextVideoIdRef.current = nextVideoId;
    }

    prefetchInFlightRef.current = true;
    void fetchNextPage()
      .then((result) => {
        if (result.isError) {
          requestedNextVideoIdRef.current = null;
        }
      })
      .catch(() => {
        requestedNextVideoIdRef.current = null;
      })
      .finally(() => {
        prefetchInFlightRef.current = false;
      });

    return true;
  }, [fetchNextPage, hasKnownNextVideo, isFetchingNextPage, nextVideoId]);

  useEffect(() => {
    if (!hasKnownNextVideo) {
      requestedNextVideoIdRef.current = null;
    }
  }, [hasKnownNextVideo]);

  useEffect(() => {
    prefetchInFlightRef.current = false;
    requestedNextVideoIdRef.current = null;
  }, [feedType, pageSize]);

  useEffect(() => {
    if (isLoading || isLoadingNextVideo) return;
    if (!hasKnownNextVideo) return;

    const loadedAheadCount = videos.length - activeIndex - 1;
    if (loadedAheadCount >= prefetchAheadCount) return;

    requestNextPage();
  }, [
    activeIndex,
    hasKnownNextVideo,
    isLoading,
    isLoadingNextVideo,
    prefetchAheadCount,
    requestNextPage,
    videos.length,
  ]);

  useEffect(() => {
    if (!isLoadingNextVideo) return;

    const pendingIndex = pendingSkeletonIndexRef.current;
    if (pendingIndex === null) return;

    if (videos.length > pendingIndex) {
      pendingSkeletonIndexRef.current = null;
      setIsLoadingNextVideo(false);
      setShowEndOfFeedNotice(false);

      // Only force navigation if the user is still on (or past) the skeleton.
      // If they scrolled back to a previous video during loading, don't yank
      // them forward — just let the new video silently appear in place.
      if (activeIndex >= pendingIndex) {
        setActiveIndex(pendingIndex);
        scrollToIndex(pendingIndex, "auto");
      }
      return;
    }

    if (!isFetchingNextPage && !prefetchInFlightRef.current) {
      pendingSkeletonIndexRef.current = null;
      setIsLoadingNextVideo(false);
      if (!hasKnownNextVideo) {
        setShowEndOfFeedNotice(true);
      }
      // Only snap to the last video if the user is still near the skeleton.
      if (activeIndex >= pendingIndex && videos.length > 0) {
        const lastIndex = videos.length - 1;
        setActiveIndex(lastIndex);
        scrollToIndex(lastIndex, "auto");
      }
    }
  }, [
    activeIndex,
    isFetchingNextPage,
    isLoadingNextVideo,
    hasKnownNextVideo,
    scrollToIndex,
    setActiveIndex,
    videos.length,
  ]);

  useEffect(() => {
    if (!showEndOfFeedNotice) return;

    const timeoutId = window.setTimeout(() => {
      setShowEndOfFeedNotice(false);
    }, 1800);

    return () => window.clearTimeout(timeoutId);
  }, [showEndOfFeedNotice]);

  const handleFeedTypeChange = useCallback(
    (newFeedType: VideoFeedType) => {
      setFeedType(newFeedType);
      setIsLoadingNextVideo(false);
      setShowEndOfFeedNotice(false);
      pendingSkeletonIndexRef.current = null;
      prefetchInFlightRef.current = false;
      requestedNextVideoIdRef.current = null;
      setActiveIndex(0);
      localStorage.setItem(FEED_TYPE_STORAGE_KEY, newFeedType);
      scrollToIndex(0, "auto");
    },
    [scrollToIndex, setActiveIndex],
  );

  // Find initial video index if provided
  useEffect(() => {
    if (initialVideoId) {
      const index = videos.findIndex((v) => v.id === initialVideoId);
      if (index !== -1) {
        setActiveIndex(index);
        scrollToIndex(index, "auto");
      }
    }
  }, [initialVideoId, scrollToIndex, setActiveIndex, videos]);

  // Handle explicit "next" intent (scroll/swipe/key) using cursor metadata.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let touchStartY: number | null = null;

    const isAtEndOfLoadedVideos = () =>
      videos.length > 0 && activeIndex >= videos.length - 1;

    const requestNextVideo = () => {
      if (activeIndex < videos.length - 1) {
        setShowEndOfFeedNotice(false);
        scrollToIndex(activeIndex + 1);
        return;
      }

      if (!hasKnownNextVideo) {
        setShowEndOfFeedNotice(true);
        return;
      }

      if (isLoadingNextVideo) {
        return;
      }

      setShowEndOfFeedNotice(false);
      pendingSkeletonIndexRef.current = videos.length;
      setIsLoadingNextVideo(true);
      setActiveIndex(videos.length);
      scrollToIndex(videos.length);

      if (!isFetchingNextPage && !prefetchInFlightRef.current) {
        requestNextPage();
      }
    };

    const handleWheel = (event: WheelEvent) => {
      if (event.deltaY > 0 && isAtEndOfLoadedVideos()) {
        requestNextVideo();
      }
    };

    const handleTouchStart = (event: TouchEvent) => {
      touchStartY = event.touches[0]?.clientY ?? null;
    };

    const handleTouchEnd = (event: TouchEvent) => {
      if (touchStartY === null || !isAtEndOfLoadedVideos()) return;
      const touchEndY = event.changedTouches[0]?.clientY;
      if (typeof touchEndY !== "number") {
        touchStartY = null;
        return;
      }

      const upwardSwipeDistance = touchStartY - touchEndY;
      if (upwardSwipeDistance > 24) {
        requestNextVideo();
      }
      touchStartY = null;
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        (event.key === "ArrowDown" || event.key === "j") &&
        isAtEndOfLoadedVideos()
      ) {
        requestNextVideo();
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: true });
    container.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    activeIndex,
    hasKnownNextVideo,
    isFetchingNextPage,
    isLoadingNextVideo,
    requestNextPage,
    scrollToIndex,
    setActiveIndex,
    videos.length,
  ]);

  // ── Duet/Stitch: query original video for the currently active video ──
  const activeVideoId =
    activeIndex >= 0 && activeIndex < videos.length
      ? videos[activeIndex]?.id
      : undefined;
  const { data: originalVideoRaw } = useQuery({
    ...trpc.video.getOriginalVideo.queryOptions({
      videoId: activeVideoId ?? 0,
    }),
    enabled: !!activeVideoId,
  });
  const originalVideoData = originalVideoRaw as OriginalVideoData | undefined;

  // Handle double tap to like
  const handleDoubleTap = useCallback((_videoId: number) => {
    // Trigger like animation
    // The actual like is handled in VideoSidebar
  }, []);

  const header = (
    <div className="pointer-events-none absolute left-0 right-0 top-0 z-30 bg-gradient-to-b from-background/95 via-background/70 to-transparent px-4 pb-6 pt-4 xl:hidden">
      <div className="pointer-events-none flex items-center justify-between gap-3">
        <Link href="/dashboard" className="pointer-events-auto">
          <Button
            variant="ghost"
            size="icon"
            className="text-foreground hover:bg-accent"
            aria-label="Back to home"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </Link>

        <VideoFeedControls
          feedType={feedType}
          onFeedTypeChange={handleFeedTypeChange}
          onUpload={() => setShowUploadDialog(true)}
          className="pointer-events-auto"
        />
      </div>
    </div>
  );

  const desktopRail = navigation ? (
    <VideoDesktopRail
      title="Video Stack"
      description="Stay in the scroll while keeping your next move close at hand."
      summary={
        <div className="rounded-[1.35rem] border border-border/70 bg-background/75 px-4 py-3">
          <p className="text-sm font-medium text-foreground">
            {feedType === "forYou"
              ? "For You is active"
              : "Following is active"}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {feedType === "forYou"
              ? "A wider blend of what is trending across Galileyo."
              : "A tighter loop focused on creators and communities you follow."}
          </p>
        </div>
      }
      controls={
        <VideoFeedControls
          compact
          feedType={feedType}
          onFeedTypeChange={handleFeedTypeChange}
          onUpload={() => setShowUploadDialog(true)}
        />
      }
      quickLinks={navigation.shortcuts.slice(0, 4)}
    />
  ) : null;

  const renderVideo = useCallback(
    (video: VideoFeedResponse["items"][number], index: number) => {
      const playbackSrc = getVideoPlaybackProxyUrl(
        video.id,
        video.playbackId,
        video.playbackUrl ?? video.s3Url ?? "",
      );

      // Resolve duet/stitch data for the active video
      const isActiveVideo = index === activeIndex;
      const duetStitchInfo =
        isActiveVideo &&
        originalVideoData?.isReaction &&
        originalVideoData.original
          ? originalVideoData
          : null;

      return (
        <div
          key={video.id}
          className="relative flex h-[100dvh] w-full snap-start snap-always items-center justify-center px-0 pb-0 pt-0 sm:h-screen sm:px-4 sm:pb-16 sm:pt-24"
        >
          <div className="flex h-full w-full items-end gap-0 sm:max-h-[82vh] sm:justify-center sm:gap-4">
            {/* Video card */}
            <div className="relative h-full w-full overflow-hidden bg-muted/60 sm:max-w-3xl sm:rounded-2xl sm:shadow-2xl sm:ring-1 sm:ring-border">
              <VideoPlayer
                src={playbackSrc}
                poster={getVideoThumbnailProxyUrl(video.id, video.thumbnailUrl)}
                isActive={isActiveVideo}
                isMuted={isMuted}
                playbackRate={playbackRate}
                onDoubleTap={() => handleDoubleTap(video.id)}
                onViewStart={() => recordVideoView(video.id)}
                onControlsVisibilityChange={setShowSidebar}
                onMuteToggle={toggleMute}
                onPlaybackRateChange={setPlaybackRate}
                className="h-full w-full"
                originalSrc={
                  duetStitchInfo?.original
                    ? getVideoPlaybackProxyUrl(
                        duetStitchInfo.original.id,
                        duetStitchInfo.original.playbackId,
                        duetStitchInfo.original.playbackUrl ?? "",
                      )
                    : undefined
                }
                originalPoster={
                  duetStitchInfo?.original
                    ? getVideoThumbnailProxyUrl(
                        duetStitchInfo.original.id,
                        duetStitchInfo.original.thumbnailUrl,
                      )
                    : undefined
                }
                duetStitchType={duetStitchInfo?.type ?? undefined}
              />

              {/* Duet/Stitch badge linking to original video */}
              <div className="absolute right-3 top-14 z-20 sm:right-4 sm:top-16">
                <DuetStitchBadge videoId={video.id} />
              </div>

              <div
                className={cn(
                  "absolute bottom-0 left-0 right-0 z-10 p-4 transition-opacity duration-300 sm:p-6",
                  showSidebar
                    ? "pointer-events-auto opacity-100"
                    : "pointer-events-none opacity-0",
                )}
              >
                <VideoInfo
                  creator={
                    video.creator.subscriptionId || video.creator.isVerified
                      ? video.creator
                      : {
                          ...video.creator,
                          isVerified: false,
                        }
                  }
                  caption={video.caption}
                  viewCount={video.viewCount}
                  isFollowing={video.isFollowing}
                  currentUserId={currentUserId}
                />
              </div>

              {/* Mobile sidebar - overlaid on video */}
              <div
                className={cn(
                  "absolute bottom-20 right-2 z-20 flex flex-col items-center transition-opacity duration-300 sm:hidden",
                  showSidebar
                    ? "pointer-events-auto opacity-100"
                    : "pointer-events-none opacity-0",
                )}
              >
                <VideoSidebar
                  videoId={video.id}
                  likeCount={video.likeCount}
                  commentCount={video.commentCount}
                  shareCount={video.shareCount ?? 0}
                  isLiked={video.isLiked ?? false}
                  isShared={video.isShared ?? false}
                  isSaved={video.isSaved}
                  userReactionId={video.userReactionId}
                  reactions={video.reactions}
                  allowSharing={video.allowSharing ?? true}
                  videoCaption={video.caption}
                  thumbnailUrl={getVideoThumbnailProxyUrl(
                    video.id,
                    video.thumbnailUrl,
                  )}
                  creatorName={video.creator.name}
                  onCommentClick={() => {
                    setCommentsVideoId(video.id);
                    setCommentsVideoOwnerId(video.creator.id);
                  }}
                />
              </div>
            </div>

            {/* Sidebar - outside video card */}
            <div
              className={cn(
                "hidden flex-col items-center pb-8 transition-opacity duration-300 sm:flex xl:hidden",
                showSidebar
                  ? "pointer-events-auto opacity-100"
                  : "pointer-events-none opacity-0",
              )}
            >
              <VideoSidebar
                videoId={video.id}
                likeCount={video.likeCount}
                commentCount={video.commentCount}
                shareCount={video.shareCount ?? 0}
                isLiked={video.isLiked ?? false}
                isShared={video.isShared ?? false}
                isSaved={video.isSaved}
                userReactionId={video.userReactionId}
                reactions={video.reactions}
                allowSharing={video.allowSharing ?? true}
                videoCaption={video.caption}
                thumbnailUrl={getVideoThumbnailProxyUrl(
                  video.id,
                  video.thumbnailUrl,
                )}
                creatorName={video.creator.name}
                onCommentClick={() => {
                  setCommentsVideoId(video.id);
                  setCommentsVideoOwnerId(video.creator.id);
                }}
              />
            </div>
          </div>
        </div>
      );
    },
    [
      activeIndex,
      currentUserId,
      handleDoubleTap,
      isMuted,
      playbackRate,
      setPlaybackRate,
      setCommentsVideoId,
      setCommentsVideoOwnerId,
      showSidebar,
      toggleMute,
      originalVideoData,
      recordVideoView,
    ],
  );

  const nextVideoSkeletonSlide = isLoadingNextVideo ? (
    <div className="relative flex h-[100dvh] w-full snap-start snap-always items-center justify-center px-0 pb-0 pt-0 sm:h-screen sm:px-4 sm:pb-16 sm:pt-24">
      <div className="flex h-full w-full items-end gap-0 sm:max-h-[82vh] sm:justify-center sm:gap-4">
        <div className="relative flex h-full w-full items-end overflow-hidden bg-muted/60 sm:max-w-3xl sm:rounded-2xl sm:shadow-2xl sm:ring-1 sm:ring-border">
          <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/65 to-black/85" />
          <div className="relative z-10 w-full p-4 sm:p-6">
            <div className="w-full space-y-3 rounded-2xl border border-white/15 bg-black/45 p-4 backdrop-blur-sm sm:max-w-md">
              <Skeleton className="h-3.5 w-24 bg-white/20" />
              <Skeleton className="h-5 w-4/5 bg-white/25" />
              <Skeleton className="h-3.5 w-3/5 bg-white/20" />
              <div className="pt-1 text-xs font-medium tracking-wide text-white/80">
                Loading next video...
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <VideoFeedBase
        header={header}
        videos={videos}
        renderVideo={renderVideo}
        aside={desktopRail}
        appendSlide={nextVideoSkeletonSlide}
        containerRef={containerRef}
        isFetchingNextPage={isFetchingNextPage}
        isLoading={isLoading}
        emptyState={
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="rounded-full bg-muted p-6">
                <Video className="h-12 w-12 text-muted-foreground/50" />
              </div>
              <div>
                <p className="text-xl font-semibold text-foreground">
                  {feedType === "following"
                    ? "No videos from people you follow"
                    : "Be the first to post!"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {feedType === "following"
                    ? "Follow creators to see their videos here."
                    : "Upload a video and start creating content."}
                </p>
              </div>
              <Button
                onClick={() => setShowUploadDialog(true)}
                className="mt-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="mr-2 h-4 w-4" />
                Upload Video
              </Button>
            </div>
          </div>
        }
      />

      {showEndOfFeedNotice && (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-border/70 bg-background/95 px-4 py-2 text-sm font-medium text-foreground shadow-lg backdrop-blur">
          No more videos to show.
        </div>
      )}

      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-h-[90dvh] w-[calc(100%-1rem)] max-w-3xl overflow-hidden p-0">
          <DialogHeader className="border-b px-4 py-3 sm:px-6 sm:py-4">
            <DialogTitle>Upload Video</DialogTitle>
          </DialogHeader>
          <div className="max-h-[calc(90dvh-64px)] overflow-y-auto p-4 sm:p-6">
            <VideoUpload
              onUploadComplete={() => {
                setShowUploadDialog(false);
              }}
              onCancel={() => setShowUploadDialog(false)}
            />
          </div>
        </DialogContent>
      </Dialog>

      {commentsVideoId && currentUserId > 0 && (
        <VideoCommentsDrawer
          videoId={commentsVideoId}
          videoOwnerId={commentsVideoOwnerId}
          open
          onOpenChange={(open) => {
            if (!open) {
              setCommentsVideoId(null);
            }
          }}
          currentUserId={currentUserId}
        />
      )}
    </>
  );
}
