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
import { Label } from "@galileyo/ui/label";
import { RadioGroup, RadioGroupItem } from "@galileyo/ui/radio-group";
import { Textarea } from "@galileyo/ui/textarea";
import { toast } from "@galileyo/ui/toast";

import { useTRPC } from "~/trpc/react";

interface PostShareModalProps {
  postId: number;
  postTitle: string;
  postBody: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PostShareModal({
  postId,
  postTitle,
  postBody,
  open,
  onOpenChange,
}: PostShareModalProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [caption, setCaption] = useState("");
  const [copied, setCopied] = useState(false);
  const [audience, setAudience] = useState<"public" | "friends">("public");

  const shareMutation = useMutation(
    trpc.feed.share.mutationOptions({
      onSuccess: async () => {
        toast.success("Post reposted");
        await queryClient.invalidateQueries(trpc.feed.pathFilter());
        onOpenChange(false);
        setCaption("");
        setAudience("public");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to repost");
      },
    }),
  );

  const handleRepost = () => {
    shareMutation.mutate({
      id_original_news: postId,
      user_feed: audience,
      caption: caption.trim() || undefined,
    });
  };

  const getShareUrl = () => `${window.location.origin}/dashboard/${postId}`;

  const handleShareOutside = async () => {
    const url = getShareUrl();
    if ("share" in navigator) {
      try {
        await navigator.share({
          title: postTitle || "Check out this post",
          url,
        });
        return;
      } catch {
        // User canceled the native share dialog.
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const truncatedBody =
    postBody.length > 150 ? `${postBody.slice(0, 150)}...` : postBody;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Post
          </DialogTitle>
          <DialogDescription>
            Repost to your feed or share this link outside the app
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg bg-muted p-3">
            <p className="text-sm font-semibold">{postTitle}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {truncatedBody}
            </p>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Repost to your feed</Label>
            <RadioGroup
              value={audience}
              onValueChange={(value) =>
                setAudience(value === "friends" ? "friends" : "public")
              }
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="public" id="repost-public" />
                <Label htmlFor="repost-public" className="cursor-pointer">
                  Public feed
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="friends" id="repost-friends" />
                <Label htmlFor="repost-friends" className="cursor-pointer">
                  Friends-only feed
                </Label>
              </div>
            </RadioGroup>
            <Textarea
              placeholder="Add a caption (optional)"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              maxLength={512}
              rows={3}
              className="resize-none"
            />
            <p className="text-right text-xs text-muted-foreground">
              {caption.length}/512
            </p>
            <Button
              className="w-full"
              onClick={handleRepost}
              disabled={shareMutation.isPending}
            >
              {shareMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Reposting...
                </>
              ) : (
                <>
                  <Repeat2 className="mr-2 h-4 w-4" />
                  Repost
                </>
              )}
            </Button>
          </div>

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

          <Button
            variant="outline"
            className="w-full"
            onClick={handleShareOutside}
          >
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4 text-green-500" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Share Outside App
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
