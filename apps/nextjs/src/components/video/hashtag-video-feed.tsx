"use client";

import type { QueryFunction } from "@tanstack/react-query";
import type { TRPCQueryKey } from "@trpc/tanstack-react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { ArrowLeft, Hash } from "lucide-react";
import { useInView } from "react-intersection-observer";

import { Button } from "@galileyo/ui/button";

import type { HashtagVideoFeedResponse } from "~/types/video";
import { authClient } from "~/auth/client";
import { useRecordVideoView } from "~/hooks/use-record-video-view";
import { useVideoMute } from "~/hooks/use-video-mute";
import { useVideoScroll } from "~/hooks/use-video-scroll";
import { formatCount } from "~/lib/format";
import {
  getVideoPlaybackProxyUrl,
  getVideoThumbnailProxyUrl,
} from "~/lib/video-proxy";
import { useTRPC } from "~/trpc/react";
import { getAuthenticatedNavigationModel } from "../layout/authenticated-shell-config";
import { VideoCommentsDrawer } from "./video-comments-drawer";
import { VideoDesktopRail } from "./video-desktop-rail";
import { VideoFeedBase } from "./video-feed-base";
import { VideoInfo } from "./video-info";
import { VideoPlayer } from "./video-player";
import { VideoSidebar } from "./video-sidebar";

interface HashtagVideoFeedProps {
  hashtag: string;
}

export function HashtagVideoFeed({ hashtag }: HashtagVideoFeedProps) {
  const trpc = useTRPC();
  const containerRef = useRef<HTMLDivElement>(null);
  const [commentsVideoId, setCommentsVideoId] = useState<number | null>(null);
  const [commentsVideoOwnerId, setCommentsVideoOwnerId] = useState<number>(0);
  const { recordVideoView } = useRecordVideoView();
  const { isMuted, toggleMute } = useVideoMute();
  const { ref: loadMoreRef, inView } = useInView();
  const { data: session } = authClient.useSession();
  const currentUserId = session?.user.id ? Number(session.user.id) : 0;
  const navigation = useMemo(
    () =>
      session?.user
        ? getAuthenticatedNavigationModel(session.user, true)
        : undefined,
    [session?.user],
  );

  // Fetch videos for this hashtag
  const queryOptions = trpc.video.getVideosByHashtag.infiniteQueryOptions({
    hashtag,
    limit: 10,
  });

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery({
      queryKey: queryOptions.queryKey,
      queryFn: queryOptions.queryFn as QueryFunction<
        HashtagVideoFeedResponse,
        TRPCQueryKey,
        number | null
      >,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialPageParam: null,
    });

  const videos = data.pages.flatMap((page) => page.items);
  const hashtagInfo = data.pages[0]?.hashtag;
  const { activeIndex } = useVideoScroll(containerRef, {
    itemCount: videos.length,
  });

  // Load more when near the end
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Handle double tap to like
  const handleDoubleTap = useCallback((_videoId: number) => {
    // Trigger like animation
  }, []);

  const header = (
    <div className="absolute left-0 right-0 top-0 z-30 bg-gradient-to-b from-black/95 via-black/70 to-transparent px-4 pb-6 pt-4 xl:hidden">
      <div className="flex items-center justify-between gap-3">
        <Link href="/videos">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
            aria-label="Back to videos"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </Link>
        <div className="flex items-center gap-2 text-white">
          <Hash className="h-5 w-5" />
          <span className="text-lg font-semibold">{hashtag}</span>
          {hashtagInfo && (
            <span className="text-sm text-white/70">
              {formatCount(hashtagInfo.videoCount)} videos
            </span>
          )}
        </div>
        <div className="w-10" />
      </div>
    </div>
  );

  const desktopRail = navigation ? (
    <VideoDesktopRail
      title={`#${hashtag}`}
      description="Follow a single tag while keeping the rest of your workspace nearby."
      summary={
        <div className="rounded-[1.35rem] border border-border/70 bg-background/75 px-4 py-3">
          <p className="text-sm font-medium text-foreground">
            {hashtagInfo
              ? `${formatCount(hashtagInfo.videoCount)} videos in this tag`
              : "Fresh hashtag stream"}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Jump through posts using one idea, event, or meme without leaving
            the video stack.
          </p>
        </div>
      }
      quickLinks={navigation.shortcuts.slice(0, 4)}
    />
  ) : null;

  const renderVideo = useCallback(
    (video: HashtagVideoFeedResponse["items"][number], index: number) => (
      <div
        key={video.id}
        className="relative flex h-screen w-full snap-start snap-always items-center justify-center px-4 pb-16 pt-24"
      >
        <div className="relative h-full max-h-[82vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-black/60 shadow-2xl ring-1 ring-white/10">
          <VideoPlayer
            src={getVideoPlaybackProxyUrl(
              video.id,
              video.playbackId,
              video.playbackUrl ?? "",
            )}
            poster={getVideoThumbnailProxyUrl(video.id, video.thumbnailUrl)}
            isActive={index === activeIndex}
            isMuted={isMuted}
            onMuteToggle={toggleMute}
            onDoubleTap={() => handleDoubleTap(video.id)}
            onViewStart={() => recordVideoView(video.id)}
            className="h-full w-full"
          />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/50" />

          <div className="absolute right-4 top-1/2 z-10 flex -translate-y-1/2 flex-col items-center gap-4">
            <VideoSidebar
              videoId={video.id}
              likeCount={video.likeCount}
              commentCount={video.commentCount}
              shareCount={video.shareCount ?? 0}
              isLiked={video.isLiked ?? false}
              isShared={video.isShared ?? false}
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

          <div className="absolute bottom-0 left-0 right-0 z-10 p-4 sm:p-6">
            <VideoInfo
              creator={{
                ...video.creator,
                isVerified: false,
                isInfluencer: video.creator.isInfluencer ?? false,
              }}
              caption={video.caption}
            />
          </div>
        </div>
      </div>
    ),
    [activeIndex, handleDoubleTap, isMuted, recordVideoView, toggleMute],
  );

  return (
    <>
      <VideoFeedBase
        header={header}
        videos={videos}
        renderVideo={renderVideo}
        aside={desktopRail}
        containerRef={containerRef}
        loadMoreRef={loadMoreRef}
        isFetchingNextPage={isFetchingNextPage}
        emptyState={
          <div className="flex h-full items-center justify-center text-white/70">
            <div className="text-center">
              <p className="text-lg font-semibold">No videos for this tag</p>
              <p className="text-sm text-white/60">
                Be the first to post with this hashtag or check back later.
              </p>
              <Link href="/videos">
                <Button className="mt-4" variant="secondary">
                  Browse all videos
                </Button>
              </Link>
            </div>
          </div>
        }
      />

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
