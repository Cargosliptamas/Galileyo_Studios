"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, Music, Pause, Play, Users } from "lucide-react";

import { cn } from "@galileyo/ui";
import { Badge } from "@galileyo/ui/badge";
import { Button } from "@galileyo/ui/button";
import { toast } from "@galileyo/ui/toast";

import { useTRPC } from "~/trpc/react";

export interface SoundData {
  id: number;
  name: string;
  artistName: string;
  audioUrl: string | null;
  coverUrl: string | null;
  duration: number | null;
  usageCount: number;
  isOriginal: boolean;
  creator: {
    name: string;
    image: string | null;
  };
}

interface SoundCardProps {
  sound: SoundData;
  isFavorited?: boolean;
  showFavorite?: boolean;
  className?: string;
}

export function SoundCard({
  sound,
  isFavorited = false,
  showFavorite = true,
  className,
}: SoundCardProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [optimisticFavorite, setOptimisticFavorite] = useState(isFavorited);

  const favoriteMutation = useMutation(
    trpc.video.toggleSoundFavorite.mutationOptions({
      onMutate: () => {
        setOptimisticFavorite(!optimisticFavorite);
      },
      onSuccess: (data) => {
        setOptimisticFavorite(data.favorited);
        toast.success(
          data.favorited ? "Added to favorites" : "Removed from favorites",
        );
        void queryClient.invalidateQueries(
          trpc.video.getFavoriteSounds.pathFilter(),
        );
      },
      onError: () => {
        setOptimisticFavorite(isFavorited);
        toast.error("Failed to update favorite");
      },
    }),
  );

  const handlePlayToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!sound.audioUrl) {
      toast.error("No audio available for this sound");
      return;
    }

    if (isPlaying && audio) {
      audio.pause();
      setIsPlaying(false);
    } else {
      if (audio) {
        void audio.play();
      } else {
        const newAudio = new Audio(sound.audioUrl);
        newAudio.onended = () => setIsPlaying(false);
        newAudio.onerror = () => {
          toast.error("Failed to play audio");
          setIsPlaying(false);
        };
        void newAudio.play();
        setAudio(newAudio);
      }
      setIsPlaying(true);
    }
  };

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    favoriteMutation.mutate({ soundId: sound.id });
  };

  const formatDuration = (seconds: number | null): string => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatUsageCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <Link
      href={`/videos/sound/${sound.id}`}
      className={cn(
        "group flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50",
        className,
      )}
    >
      {/* Cover Art / Play Button */}
      <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
        {sound.coverUrl ? (
          <img
            src={sound.coverUrl}
            alt={sound.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Music className="h-6 w-6 text-white" />
          </div>
        )}
        <button
          onClick={handlePlayToggle}
          className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
        >
          {isPlaying ? (
            <Pause className="h-6 w-6 text-white" />
          ) : (
            <Play className="h-6 w-6 text-white" />
          )}
        </button>
      </div>

      {/* Sound Info */}
      <div className="flex-1 overflow-hidden">
        <div className="flex items-center gap-2">
          <h4 className="truncate font-medium">{sound.name}</h4>
          {sound.isOriginal && (
            <Badge variant="secondary" className="h-5 text-[10px]">
              Original
            </Badge>
          )}
        </div>
        <p className="truncate text-sm text-muted-foreground">
          {sound.artistName}
        </p>
        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
          {sound.duration && <span>{formatDuration(sound.duration)}</span>}
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {formatUsageCount(sound.usageCount)} videos
          </span>
        </div>
      </div>

      {/* Actions */}
      {showFavorite && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 flex-shrink-0"
          onClick={handleFavoriteToggle}
          disabled={favoriteMutation.isPending}
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-colors",
              optimisticFavorite && "fill-red-500 text-red-500",
            )}
          />
        </Button>
      )}
    </Link>
  );
}
