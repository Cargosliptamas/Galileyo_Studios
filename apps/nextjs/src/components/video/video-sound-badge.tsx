"use client";

import Link from "next/link";
import { Disc3, Music } from "lucide-react";

import { cn } from "@galileyo/ui";

interface VideoSoundBadgeProps {
  sound?: {
    id: number;
    name: string;
    artistName?: string;
    isOriginal?: boolean;
  } | null;
  className?: string;
}

export function VideoSoundBadge({ sound, className }: VideoSoundBadgeProps) {
  if (!sound) return null;

  return (
    <Link
      href={`/videos/sound/${sound.id}`}
      className={cn(
        "group flex items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 backdrop-blur-sm transition-colors hover:bg-black/60",
        className,
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Spinning disc animation */}
      <div className="relative flex h-5 w-5 items-center justify-center">
        <Disc3 className="h-5 w-5 animate-spin text-white [animation-duration:3s]" />
      </div>

      {/* Sound info */}
      <div className="flex max-w-[180px] flex-col overflow-hidden">
        <span className="truncate text-xs font-medium text-white">
          {sound.name}
        </span>
        {sound.artistName && (
          <span className="truncate text-[10px] text-white/70">
            {sound.artistName}
          </span>
        )}
      </div>

      {/* Original badge */}
      {sound.isOriginal && (
        <span className="rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-medium text-white">
          Original
        </span>
      )}

      {/* Music icon indicator */}
      <Music className="h-3 w-3 text-white/70 transition-transform group-hover:scale-110" />
    </Link>
  );
}
