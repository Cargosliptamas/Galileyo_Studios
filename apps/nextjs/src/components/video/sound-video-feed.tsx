"use client";

import type { QueryFunction } from "@tanstack/react-query";
import type { TRPCQueryKey } from "@trpc/tanstack-react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseInfiniteQuery,
} from "@tanstack/react-query";
import { ArrowLeft, Heart, Music, Pause, Play, Users } from "lucide-react";
import { useInView } from "react-intersection-observer";

import { Badge } from "@galileyo/ui/badge";
import { Button } from "@galileyo/ui/button";
import { toast } from "@galileyo/ui/toast";

import type { SoundVideoFeedResponse } from "~/types/video";
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

interface SoundVideoFeedProps {
  soundId: number;
}

export function SoundVideoFeed({ soundId }: SoundVideoFeedProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const containerRef = useRef<HTMLDivElement>(null);
  const [commentsVideoId, setCommentsVideoId] = useState<number | null>(null);
  const [commentsVideoOwnerId, setCommentsVideoOwnerId] = useState<number>(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
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

  // Fetch sound details
  const { data: soundData } = useQuery(
    trpc.video.getSound.queryOptions({ soundId }),
  );

  // Favorite mutation
  const favoriteMutation = useMutation(
    trpc.video.toggleSoundFavorite.mutationOptions({
      onSuccess: (data) => {
        toast.success(
          data.favorited ? "Added to favorites" : "Removed from favorites",
        );
        void queryClient.invalidateQueries(trpc.video.getSound.pathFilter());
        void queryClient.invalidateQueries(
          trpc.video.getFavoriteSounds.pathFilter(),
        );
      },
      onError: () => {
        toast.error("Failed to update favorite");
      },
    }),
  );

  // Play sound preview
  const handlePlayAudio = () => {
    if (!soundData?.audioUrl) {
      toast.error("No audio preview available");
      return;
    }

    if (isAudioPlaying && audio) {
      audio.pause();
      setIsAudioPlaying(false);
    } else {
      if (audio) {
        void audio.play();
      } else {
        const newAudio = new Audio(soundData.audioUrl);
        newAudio.onended = () => setIsAudioPlaying(false);
        void newAudio.play();
        setAudio(newAudio);
      }
      setIsAudioPlaying(true);
    }
  };

  // Fetch videos for this sound
  const queryOptions = trpc.video.getVideosBySound.infiniteQueryOptions({
    soundId,
    limit: 10,
  });

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery({
      queryKey: queryOptions.queryKey,
      queryFn: queryOptions.queryFn as QueryFunction<
        SoundVideoFeedResponse,
        TRPCQueryKey,
        number | null
      >,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialPageParam: null,
    });

  const videos = data.pages.flatMap((page) => page.items);
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

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
      }
    };
  }, [audio]);

  const header = (
    <div className="absolute left-0 right-0 top-0 z-30 bg-gradient-to-b from-black/95 via-black/70 to-transparent px-4 pb-8 pt-4 xl:hidden">
      <div className="flex items-start gap-4">
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

        {soundData && (
          <div className="flex flex-1 items-center gap-3">
            <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
              {soundData.coverUrl ? (
                <img
                  src={soundData.coverUrl}
                  alt={soundData.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Music className="h-6 w-6 text-white" />
                </div>
              )}
              <button
                onClick={handlePlayAudio}
                className="absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity hover:bg-black/60"
                aria-label={
                  isAudioPlaying ? "Pause sound preview" : "Play sound preview"
                }
              >
                {isAudioPlaying ? (
                  <Pause className="h-6 w-6 text-white" />
                ) : (
                  <Play className="h-6 w-6 text-white" />
                )}
              </button>
            </div>

            <div className="flex-1 overflow-hidden">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-lg font-semibold text-white">
                  {soundData.name}
                </h1>
                {soundData.isOriginal && (
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    Original
                  </Badge>
                )}
              </div>
              <p className="truncate text-sm text-white/70">
                {soundData.artistName}
              </p>
              <div className="mt-1 flex items-center gap-2 text-xs text-white/60">
                <Users className="h-3 w-3" />
                <span>{formatCount(soundData.usageCount)} videos</span>
              </div>
            </div>

            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 border-white/30 bg-transparent text-white hover:bg-white/10"
              onClick={() => favoriteMutation.mutate({ soundId })}
              disabled={favoriteMutation.isPending}
              aria-label="Save sound to favorites"
            >
              <Heart className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  const desktopRail = navigation ? (
    <VideoDesktopRail
      title={soundData?.name ?? "Sound Collection"}
      description="Track one sound, preview it, and branch out without losing the video flow."
      summary={
        <div className="rounded-[1.35rem] border border-border/70 bg-background/75 px-4 py-3">
          <p className="text-sm font-medium text-foreground">
            {soundData?.artistName ?? "Audio source"}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {soundData
              ? `${formatCount(soundData.usageCount)} videos use this sound${soundData.isOriginal ? " and it is marked original." : "."}`
              : "Preview the sound and watch how creators are using it."}
          </p>
        </div>
      }
      controls={
        soundData ? (
          <div className="grid gap-3">
            <Button
              type="button"
              variant="secondary"
              className="justify-between rounded-2xl"
              onClick={handlePlayAudio}
            >
              <span>{isAudioPlaying ? "Pause Preview" : "Play Preview"}</span>
              {isAudioPlaying ? (
                <Pause className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Play className="h-4 w-4" aria-hidden="true" />
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="justify-between rounded-2xl"
              onClick={() => favoriteMutation.mutate({ soundId })}
              disabled={favoriteMutation.isPending}
            >
              <span>Save Sound</span>
              <Heart className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        ) : null
      }
      quickLinks={navigation.shortcuts.slice(0, 4)}
    />
  ) : null;

  const renderVideo = useCallback(
    (video: SoundVideoFeedResponse["items"][number], index: number) => (
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
              <p className="text-lg font-semibold">
                No videos using this sound yet
              </p>
              <p className="text-sm text-white/60">
                Be the first to create with this sound.
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
