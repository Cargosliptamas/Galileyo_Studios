"use client";

import { useCallback, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bookmark,
  Download,
  GitBranch,
  Heart,
  MessageCircle,
  Repeat2,
  Share2,
} from "lucide-react";

import { cn } from "@galileyo/ui";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@galileyo/ui/hover-card";
import { toast } from "@galileyo/ui/toast";

import type { VideoReactionCount } from "~/types/video";
import { formatCount } from "~/lib/format";
import { useTRPC } from "~/trpc/react";
import { DuetStitchModal } from "./duet-stitch-modal";
import { VideoShareModal } from "./video-share-modal";

const reactionOptions = [
  { type: "like" as const, emoji: "👍", label: "Like", id: 1 },
  { type: "dislike" as const, emoji: "👎", label: "Dislike", id: 2 },
  { type: "laugh" as const, emoji: "🤣", label: "Laugh", id: 3 },
  { type: "love" as const, emoji: "❤️", label: "Love", id: 4 },
  { type: "fire" as const, emoji: "🔥", label: "Fire", id: 5 },
  { type: "disgust" as const, emoji: "🤢", label: "Disgust", id: 6 },
];

interface VideoSidebarProps {
  videoId: number;
  likeCount: number;
  commentCount: number;
  shareCount?: number;
  isLiked: boolean;
  isShared?: boolean;
  isSaved?: boolean;
  userReactionId?: number | null;
  reactions?: VideoReactionCount[];
  allowSharing?: boolean;
  allowDuet?: boolean;
  allowStitch?: boolean;
  allowDownload?: boolean;
  playbackUrl?: string | null;
  videoCaption?: string | null;
  thumbnailUrl?: string | null;
  creatorName?: string;
  creatorImage?: string | null;
  onCommentClick?: () => void;
  className?: string;
  interactive?: boolean;
}

export function VideoSidebar({
  videoId,
  likeCount,
  commentCount,
  shareCount = 0,
  isLiked: _isLiked,
  isShared = false,
  isSaved = false,
  userReactionId = null,
  reactions: _reactions = [],
  allowSharing = true,
  allowDuet = true,
  allowStitch = true,
  allowDownload = false,
  playbackUrl,
  videoCaption,
  thumbnailUrl,
  creatorName = "Creator",
  creatorImage,
  onCommentClick,
  className,
  interactive = true,
}: VideoSidebarProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDuetStitchModal, setShowDuetStitchModal] = useState(false);
  const [optimisticSaved, setOptimisticSaved] = useState(isSaved);
  const [isDownloading, setIsDownloading] = useState(false);
  const [optimisticReactionId, setOptimisticReactionId] = useState<
    number | null
  >(userReactionId);
  const [optimisticLikeCount, setOptimisticLikeCount] = useState(likeCount);

  const setReactionMutation = useMutation(
    trpc.video.setReaction.mutationOptions({
      onSuccess: (data) => {
        setOptimisticReactionId(data.reactionId);
        void queryClient.invalidateQueries(trpc.video.list.pathFilter());
        void queryClient.invalidateQueries(trpc.video.getById.pathFilter());
      },
      onError: () => {
        // Revert optimistic updates
        setOptimisticReactionId(userReactionId);
        setOptimisticLikeCount(likeCount);
        toast.error("Failed to set reaction");
      },
    }),
  );

  const handleReactionClick = useCallback(
    (reactionId: number) => {
      if (!interactive) {
        return;
      }

      if (optimisticReactionId === reactionId) {
        // Toggle off
        setOptimisticReactionId(null);
        setOptimisticLikeCount((prev) => Math.max(prev - 1, 0));
      } else {
        const wasReacted = optimisticReactionId !== null;
        setOptimisticReactionId(reactionId);
        if (!wasReacted) {
          setOptimisticLikeCount((prev) => prev + 1);
        }
      }
      setReactionMutation.mutate({ videoId, reactionId });
    },
    [interactive, optimisticReactionId, setReactionMutation, videoId],
  );

  // Double-tap triggers default "like" reaction (id: 1)
  const _handleDefaultLike = useCallback(() => {
    if (!optimisticReactionId) {
      handleReactionClick(1);
    }
  }, [optimisticReactionId, handleReactionClick]);

  const toggleSaveMutation = useMutation({
    mutationFn: async () => {
      return (
        trpc.video as unknown as {
          toggleSave: {
            mutate: (input: { videoId: number }) => Promise<{ saved: boolean }>;
          };
        }
      ).toggleSave.mutate({ videoId });
    },
    onMutate: () => {
      setOptimisticSaved(!optimisticSaved);
    },
    onSuccess: (data) => {
      setOptimisticSaved(data.saved);
      toast.success(data.saved ? "Saved to collection" : "Removed from saved");
      void queryClient.invalidateQueries({ queryKey: ["video", "list"] });
      void queryClient.invalidateQueries({ queryKey: ["video", "saved"] });
    },
    onError: () => {
      setOptimisticSaved(isSaved);
      toast.error("Failed to save video");
    },
  });

  const handleSave = () => {
    if (!interactive) {
      return;
    }
    toggleSaveMutation.mutate();
  };

  const handleShare = () => {
    if (!interactive) {
      return;
    }
    setShowShareModal(true);
  };

  const handleDownload = async () => {
    if (!interactive) {
      return;
    }

    if (!playbackUrl || !allowDownload) {
      toast.error("Download not available for this video");
      return;
    }

    setIsDownloading(true);
    try {
      const response = await fetch(playbackUrl);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `video-${videoId}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success("Download started");
    } catch {
      await navigator.clipboard.writeText(
        `${window.location.origin}/videos?v=${videoId}`,
      );
      toast.info(
        "Video link copied - direct download requires the creator's permission",
      );
    } finally {
      setIsDownloading(false);
    }
  };

  // Get the current reaction emoji to display
  const currentReaction = optimisticReactionId
    ? reactionOptions.find((r) => r.id === optimisticReactionId)
    : null;

  const handleNativeShare = async () => {
    if (!interactive) {
      return;
    }

    const url = `${window.location.origin}/videos/${videoId}`;
    if ("share" in navigator) {
      try {
        await navigator.share({
          title: "Check out this video!",
          url,
        });
      } catch {
        // User cancelled
      }
      return;
    }

    const clipboard = window.navigator.clipboard;
    if (typeof clipboard.writeText === "function") {
      await clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
      return;
    }

    toast.info("Sharing is not supported on this browser");
  };

  const reactionButton = (
    <button
      onClick={() => {
        if (currentReaction) {
          handleReactionClick(currentReaction.id);
        } else {
          handleReactionClick(4);
        }
      }}
      disabled={!interactive || setReactionMutation.isPending}
      className="flex flex-col items-center gap-1 transition-transform hover:scale-110 disabled:pointer-events-none disabled:opacity-100"
    >
      <div
        className={cn(
          "transition-all",
          setReactionMutation.isPending && "opacity-50",
        )}
      >
        {currentReaction ? (
          <span className="flex h-6 w-6 items-center justify-center text-xl sm:h-8 sm:w-8 sm:text-2xl">
            {currentReaction.emoji}
          </span>
        ) : (
          <Heart className="h-6 w-6 text-foreground drop-shadow-md sm:h-8 sm:w-8" />
        )}
      </div>
      <span className="text-[10px] font-medium text-foreground drop-shadow-md sm:text-xs">
        {formatCount(optimisticLikeCount)}
      </span>
    </button>
  );

  return (
    <>
      <div
        className={cn(
          "z-50 flex flex-col items-center gap-3 sm:gap-5",
          className,
        )}
      >
        {interactive ? (
          <HoverCard openDelay={200} closeDelay={100}>
            <HoverCardTrigger asChild>{reactionButton}</HoverCardTrigger>
            <HoverCardContent
              side="left"
              align="center"
              className="w-auto border-border bg-popover p-2 shadow-lg"
            >
              <div className="flex items-center gap-1">
                {reactionOptions.map((reaction) => (
                  <button
                    key={reaction.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReactionClick(reaction.id);
                    }}
                    className={cn(
                      "rounded-full p-2 text-xl transition-all hover:scale-125 hover:bg-accent",
                      optimisticReactionId === reaction.id &&
                        "scale-110 bg-accent",
                    )}
                    aria-label={reaction.label}
                  >
                    {reaction.emoji}
                  </button>
                ))}
              </div>
            </HoverCardContent>
          </HoverCard>
        ) : (
          reactionButton
        )}

        <button
          onClick={interactive ? onCommentClick : undefined}
          disabled={!interactive}
          className="flex flex-col items-center gap-1 transition-transform hover:scale-110 disabled:pointer-events-none disabled:opacity-100"
        >
          <MessageCircle className="h-6 w-6 text-foreground drop-shadow-md sm:h-8 sm:w-8" />
          <span className="text-[10px] font-medium text-foreground drop-shadow-md sm:text-xs">
            {formatCount(commentCount)}
          </span>
        </button>

        <button
          onClick={handleShare}
          disabled={!interactive}
          className="flex flex-col items-center gap-1 transition-transform hover:scale-110 disabled:pointer-events-none disabled:opacity-100"
        >
          <Repeat2
            className={cn(
              "h-6 w-6 drop-shadow-md transition-colors sm:h-8 sm:w-8",
              isShared ? "text-green-500" : "text-foreground",
            )}
          />
          <span className="text-[10px] font-medium text-foreground drop-shadow-md sm:text-xs">
            {shareCount > 0 ? formatCount(shareCount) : "Repost"}
          </span>
        </button>

        <button
          onClick={handleNativeShare}
          disabled={!interactive}
          className="flex flex-col items-center gap-1 transition-transform hover:scale-110 disabled:pointer-events-none disabled:opacity-100"
        >
          <Share2 className="h-6 w-6 text-foreground drop-shadow-md sm:h-8 sm:w-8" />
          <span className="text-[10px] font-medium text-foreground drop-shadow-md sm:text-xs">
            Share
          </span>
        </button>

        <button
          onClick={handleSave}
          disabled={!interactive || toggleSaveMutation.isPending}
          className="flex flex-col items-center gap-1 transition-transform hover:scale-110 disabled:pointer-events-none disabled:opacity-100"
        >
          <Bookmark
            className={cn(
              "h-6 w-6 drop-shadow-md transition-colors sm:h-8 sm:w-8",
              optimisticSaved
                ? "fill-yellow-500 text-yellow-500"
                : "text-foreground",
              toggleSaveMutation.isPending && "opacity-50",
            )}
          />
          <span className="text-[10px] font-medium text-foreground drop-shadow-md sm:text-xs">
            {optimisticSaved ? "Saved" : "Save"}
          </span>
        </button>

        {(allowDuet || allowStitch) && (
          <button
            onClick={interactive ? () => setShowDuetStitchModal(true) : undefined}
            disabled={!interactive}
            className="flex flex-col items-center gap-1 transition-transform hover:scale-110 disabled:pointer-events-none disabled:opacity-100"
          >
            <GitBranch className="h-6 w-6 text-foreground drop-shadow-md sm:h-8 sm:w-8" />
            <span className="text-[10px] font-medium text-foreground drop-shadow-md sm:text-xs">
              Duet
            </span>
          </button>
        )}

        {allowDownload && (
          <button
            onClick={handleDownload}
            disabled={!interactive || isDownloading}
            className="flex flex-col items-center gap-1 transition-transform hover:scale-110 disabled:pointer-events-none disabled:opacity-100"
          >
            <Download
              className={cn(
                "h-6 w-6 text-foreground drop-shadow-md sm:h-8 sm:w-8",
                isDownloading && "opacity-50",
              )}
            />
            <span className="text-[10px] font-medium text-foreground drop-shadow-md sm:text-xs">
              {isDownloading ? "..." : "Download"}
            </span>
          </button>
        )}
      </div>

      {interactive && (
        <VideoShareModal
          videoId={videoId}
          videoCaption={videoCaption}
          thumbnailUrl={thumbnailUrl}
          creatorName={creatorName}
          isShared={isShared}
          allowSharing={allowSharing}
          open={showShareModal}
          onOpenChange={setShowShareModal}
        />
      )}

      {interactive && (
        <DuetStitchModal
          videoId={videoId}
          videoThumbnailUrl={thumbnailUrl}
          creatorName={creatorName}
          creatorImage={creatorImage}
          allowDuet={allowDuet}
          allowStitch={allowStitch}
          open={showDuetStitchModal}
          onOpenChange={setShowDuetStitchModal}
        />
      )}
    </>
  );
}
