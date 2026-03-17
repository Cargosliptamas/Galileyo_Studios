"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BadgeCheck, Eye, UserMinus, UserPlus } from "lucide-react";

import { cn } from "@galileyo/ui";
import { Avatar, AvatarFallback, AvatarImage } from "@galileyo/ui/avatar";
import { Button } from "@galileyo/ui/button";
import { toast } from "@galileyo/ui/toast";

import { getInfluencerImageUrl, getUserImageUrl } from "~/lib/image";
import { useTRPC } from "~/trpc/react";
import { VideoCaption } from "./video-caption";

interface VideoInfoProps {
  creator: {
    id: number;
    name: string;
    image: string | null;
    isVerified?: boolean;
    isInfluencer?: boolean;
    subscriptionId?: number | null;
  };
  caption: string | null;
  viewCount?: number;
  isFollowing?: boolean;
  currentUserId?: number;
  className?: string;
  interactive?: boolean;
}

export function VideoInfo({
  creator,
  caption,
  viewCount = 0,
  isFollowing: initialIsFollowing = false,
  currentUserId,
  className,
  interactive = true,
}: VideoInfoProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [optimisticFollowing, setOptimisticFollowing] =
    useState(initialIsFollowing);

  const followMutation = useMutation(
    trpc.feed.setSubscription.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries(trpc.video.list.pathFilter());
      },
      onError: () => {
        setOptimisticFollowing(!optimisticFollowing);
        toast.error("Failed to update follow status");
      },
    }),
  );

  const handleFollowToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!interactive || !creator.subscriptionId) return;

    const newFollowState = !optimisticFollowing;
    setOptimisticFollowing(newFollowState);
    followMutation.mutate({
      id: creator.subscriptionId,
      subscribed: newFollowState,
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatViewCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const isOwnVideo = currentUserId === creator.id;
  const profileHref = creator.subscriptionId
    ? `/profile/by-subscription/${creator.subscriptionId}`
    : `/profile/${creator.id}`;
  const creatorImageUrl = creator.subscriptionId
    ? getInfluencerImageUrl(creator.image)
    : getUserImageUrl(creator.image);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-3">
        {interactive ? (
          <Link href={profileHref} className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-white">
              {creatorImageUrl ? (
                <AvatarImage src={creatorImageUrl} alt={creator.name} />
              ) : null}
              <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-500 text-white">
                {getInitials(creator.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-white">{creator.name}</span>
                {(creator.isVerified ?? creator.isInfluencer) && (
                  <BadgeCheck className="h-4 w-4 fill-cyan-500 text-white" />
                )}
              </div>
              {viewCount > 0 && (
                <div className="flex items-center gap-1 text-xs text-white/70">
                  <Eye className="h-3 w-3" />
                  <span>{formatViewCount(viewCount)} views</span>
                </div>
              )}
            </div>
          </Link>
        ) : (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-white">
              {creatorImageUrl ? (
                <AvatarImage src={creatorImageUrl} alt={creator.name} />
              ) : null}
              <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-500 text-white">
                {getInitials(creator.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-white">{creator.name}</span>
                {(creator.isVerified ?? creator.isInfluencer) && (
                  <BadgeCheck className="h-4 w-4 fill-cyan-500 text-white" />
                )}
              </div>
              {viewCount > 0 && (
                <div className="flex items-center gap-1 text-xs text-white/70">
                  <Eye className="h-3 w-3" />
                  <span>{formatViewCount(viewCount)} views</span>
                </div>
              )}
            </div>
          </div>
        )}

        {!isOwnVideo && creator.subscriptionId && (
          <Button
            variant={optimisticFollowing ? "outline" : "primary"}
            size="sm"
            className={cn(
              "ml-2 h-8 gap-1 rounded-full px-3 text-xs",
              optimisticFollowing
                ? "border-white/30 bg-transparent text-white hover:bg-white/10"
                : "bg-white text-black hover:bg-white/90",
              !interactive && "pointer-events-none disabled:opacity-100",
            )}
            onClick={interactive ? handleFollowToggle : undefined}
            disabled={!interactive || followMutation.isPending}
          >
            {optimisticFollowing ? (
              <>
                <UserMinus className="h-3 w-3" />
                Following
              </>
            ) : (
              <>
                <UserPlus className="h-3 w-3" />
                Follow
              </>
            )}
          </Button>
        )}
      </div>

      <VideoCaption caption={caption} maxLines={2} />
    </div>
  );
}
