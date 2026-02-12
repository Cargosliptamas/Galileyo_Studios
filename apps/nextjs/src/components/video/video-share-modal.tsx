"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Copy, Loader2, Repeat2, Share2 } from "lucide-react";

import { Button } from "@galileyo/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@galileyo/ui/dialog";
import { Textarea } from "@galileyo/ui/textarea";
import { toast } from "@galileyo/ui/toast";

import { getVideoThumbnailProxyUrl } from "~/lib/video-proxy";
import { useTRPC } from "~/trpc/react";

interface VideoShareModalProps {
  videoId: number;
  videoCaption?: string | null;
  thumbnailUrl?: string | null;
  creatorName: string;
  isShared: boolean;
  allowSharing: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VideoShareModal({
  videoId,
  videoCaption,
  thumbnailUrl,
  creatorName,
  isShared,
  allowSharing,
  open,
  onOpenChange,
}: VideoShareModalProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [caption, setCaption] = useState("");
  const [copied, setCopied] = useState(false);

  const shareMutation = useMutation(
    trpc.video.share.mutationOptions({
      onSuccess: () => {
        toast.success("Video shared to your followers!");
        void queryClient.invalidateQueries(trpc.video.list.pathFilter());
        void queryClient.invalidateQueries(trpc.video.getById.pathFilter());
        onOpenChange(false);
        setCaption("");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const unshareMutation = useMutation(
    trpc.video.unshare.mutationOptions({
      onSuccess: () => {
        toast.success("Share removed");
        void queryClient.invalidateQueries(trpc.video.list.pathFilter());
        void queryClient.invalidateQueries(trpc.video.getById.pathFilter());
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const handleShare = () => {
    shareMutation.mutate({
      videoId,
      caption: caption.trim() || undefined,
    });
  };

  const handleUnshare = () => {
    unshareMutation.mutate({ videoId });
  };

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/videos?v=${videoId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const isPending = shareMutation.isPending || unshareMutation.isPending;
  const resolvedThumbnailUrl = getVideoThumbnailProxyUrl(videoId, thumbnailUrl);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Video
          </DialogTitle>
          <DialogDescription>
            Share this video to your followers or copy the link
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Video Preview */}
          <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
            {thumbnailUrl ? (
              <img
                src={resolvedThumbnailUrl}
                alt="Video thumbnail"
                className="h-16 w-16 rounded-md object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-md bg-muted-foreground/10">
                <Share2 className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">
                {videoCaption ?? "Video"}
              </p>
              <p className="text-xs text-muted-foreground">by {creatorName}</p>
            </div>
          </div>

          {/* Share to Feed Section */}
          {allowSharing && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Repeat2 className="h-4 w-4" />
                Repost to your feed
              </div>

              {isShared ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    You have already shared this video
                  </p>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={handleUnshare}
                    disabled={isPending}
                  >
                    {unshareMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Removing...
                      </>
                    ) : (
                      "Remove Repost"
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Textarea
                    placeholder="Add a caption (optional)"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    maxLength={500}
                    rows={3}
                    className="resize-none"
                  />
                  <p className="text-right text-xs text-muted-foreground">
                    {caption.length}/500
                  </p>
                  <Button
                    className="w-full"
                    onClick={handleShare}
                    disabled={isPending}
                  >
                    {shareMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sharing...
                      </>
                    ) : (
                      <>
                        <Repeat2 className="mr-2 h-4 w-4" />
                        Share to Your Followers
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}

          {!allowSharing && (
            <p className="text-sm text-muted-foreground">
              Reposting is disabled for this video by the creator
            </p>
          )}

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                or
              </span>
            </div>
          </div>

          {/* Copy Link Section */}
          <Button variant="outline" className="w-full" onClick={handleCopyLink}>
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4 text-green-500" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy Link
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
