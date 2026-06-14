"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import posthog from "posthog-js";

import type { Episode } from "~/lib/studios/episodes";
import { STUDIOS_EASE } from "~/components/studios/motion";
import { StudiosPostCreditsUpsell } from "~/components/studios/studios-post-credits-upsell";
import { VideoPlayer } from "~/components/video/video-player";

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
  const reduce = useReducedMotion();
  const [isMuted, setIsMuted] = useState(false);
  const [showUpsell, setShowUpsell] = useState(false);

  useEffect(() => {
    posthog.capture("studios_play_started", { episode: episode.slug });
  }, [episode.slug]);

  // Minimal motion: chrome settles in once, the frame fades up, then nothing
  // moves so playback is never fought.
  const chromeHidden = reduce ? { opacity: 0 } : { opacity: 0, y: -4 };
  const chromeShown = reduce ? { opacity: 1 } : { opacity: 1, y: 0 };

  return (
    <div className="relative flex min-h-[calc(100svh-4rem)] flex-col bg-black md:min-h-[calc(100svh-5rem)]">
      <motion.div
        className="absolute left-4 top-4 z-30 flex items-center gap-3 sm:left-6 sm:top-6"
        initial={chromeHidden}
        animate={chromeShown}
        transition={{ duration: 0.3, ease: STUDIOS_EASE }}
      >
        <Link
          href={`/studios/episodes/${episode.slug}`}
          className="font-display inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-white backdrop-blur transition hover:bg-white/20"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Back
        </Link>
      </motion.div>

      <motion.div
        className="pointer-events-none absolute left-4 top-16 z-20 max-w-[18rem] sm:left-6 sm:top-20 sm:max-w-md"
        initial={chromeHidden}
        animate={chromeShown}
        transition={{ duration: 0.3, ease: STUDIOS_EASE, delay: 0.1 }}
      >
        <p className="font-display text-[10px] uppercase tracking-[0.32em] text-[rgb(var(--studios-accent))] sm:text-[11px]">
          Episode {episode.number.toString().padStart(2, "0")}
        </p>
        <h1 className="font-display mt-2 text-xl text-white drop-shadow-md sm:text-3xl">
          {episode.title}
        </h1>
      </motion.div>

      <div className="flex w-full flex-1 items-center justify-center">
        <motion.div
          className="aspect-video w-full max-w-7xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, ease: STUDIOS_EASE }}
        >
          <VideoPlayer
            src={src}
            poster={poster}
            isActive
            isMuted={isMuted}
            onMuteToggle={() => setIsMuted((prev) => !prev)}
            loop={false}
            onEnded={() => {
              posthog.capture("studios_play_completed", {
                episode: episode.slug,
              });
              setShowUpsell(true);
            }}
          />
        </motion.div>
      </div>

      <StudiosPostCreditsUpsell
        open={showUpsell}
        episode={episode}
        onClose={() => setShowUpsell(false)}
      />
    </div>
  );
}
