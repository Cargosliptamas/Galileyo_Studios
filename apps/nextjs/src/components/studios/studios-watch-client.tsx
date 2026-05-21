"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { StudiosPostCreditsUpsell } from "~/components/studios/studios-post-credits-upsell";
import { VideoPlayer } from "~/components/video/video-player";
import type { Episode } from "~/lib/studios/episodes";

interface StudiosWatchClientProps {
  episode: Episode;
  src: string;
  poster?: string;
}

export function StudiosWatchClient({
  episode,
  src,
  poster,
}: StudiosWatchClientProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [showUpsell, setShowUpsell] = useState(false);

  return (
    <div className="relative -mt-16 flex min-h-svh flex-col bg-black md:-mt-20">
      <div className="absolute left-4 top-4 z-30 flex items-center gap-3 sm:left-6 sm:top-6">
        <Link
          href={`/studios/episodes/${episode.slug}`}
          className="font-display inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-white backdrop-blur transition hover:bg-white/20"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Back
        </Link>
      </div>

      <div className="pointer-events-none absolute left-4 top-20 z-20 max-w-md sm:left-6">
        <p className="font-display text-[11px] uppercase tracking-[0.32em] text-[rgb(var(--studios-accent))]">
          Episode {episode.number.toString().padStart(2, "0")}
        </p>
        <h1 className="font-display mt-2 text-2xl text-white drop-shadow-md sm:text-3xl">
          {episode.title}
        </h1>
      </div>

      <div className="flex min-h-svh w-full items-center justify-center">
        <div className="aspect-video w-full max-w-7xl">
          <VideoPlayer
            src={src}
            poster={poster}
            isActive
            isMuted={isMuted}
            onMuteToggle={() => setIsMuted((prev) => !prev)}
            loop={false}
            onEnded={() => setShowUpsell(true)}
          />
        </div>
      </div>

      <StudiosPostCreditsUpsell
        open={showUpsell}
        episode={episode}
        onClose={() => setShowUpsell(false)}
      />
    </div>
  );
}
