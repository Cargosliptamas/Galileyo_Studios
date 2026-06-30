"use client";

import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { motion } from "motion/react";

import { Button } from "@galileyo/ui/button";

import { env } from "~/env/client";
import { FadeUp, STUDIOS_SPRING } from "./motion";
import { StudiosCountdown } from "./studios-countdown";

export function StudiosHero() {
  const trailerUrl = env.NEXT_PUBLIC_EPISODE_1_TRAILER_URL;
  const nextEpisodeDate = env.NEXT_PUBLIC_NEXT_EPISODE_DATE;

  return (
    <section className="studios-grain relative isolate flex min-h-svh w-full overflow-hidden">
      {/* Scene: real trailer footage, or a directional dark base when absent. */}
      <div className="absolute inset-0 -z-30">
        {trailerUrl ? (
          <video
            src={trailerUrl}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="studios-hero-drift h-full w-full bg-[radial-gradient(140%_120%_at_50%_120%,rgb(var(--studios-bg))_0%,transparent_60%),linear-gradient(135deg,rgb(var(--studios-surface))_0%,rgb(var(--studios-bg))_45%,rgb(var(--studios-bg))_100%)]" />
        )}
      </div>

      {/* Directional gold key-light, raking in from the upper right. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(120%_90%_at_78%_18%,rgb(var(--studios-accent-hi)/0.20)_0%,rgb(var(--studios-accent)/0.07)_28%,transparent_56%)]"
      />

      {/* Thin gold light streak across the key-light. */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-10%] top-[20%] -z-20 h-0.5 w-[70%] bg-[linear-gradient(90deg,transparent,rgb(var(--studios-accent-hi)/0.55),transparent)] shadow-[0_0_40px_6px_rgb(var(--studios-accent-hi)/0.18)] [filter:blur(1.5px)]"
      />

      {/* Deep vignette plus bottom scrim so the low title card stays legible. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(130%_130%_at_50%_38%,transparent_42%,rgb(var(--studios-bg)/0.55)_78%,rgb(var(--studios-bg)/0.95)_100%),linear-gradient(to_bottom,rgb(var(--studios-bg)/0.10)_0%,transparent_30%,rgb(var(--studios-bg))_100%)]"
      />

      {/* Film-frame corner crop marks. */}
      <span
        aria-hidden
        className="pointer-events-none absolute left-7 top-24 z-20 size-6 border-l border-t border-[rgb(var(--studios-text)/0.2)]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute right-7 top-24 z-20 size-6 border-r border-t border-[rgb(var(--studios-text)/0.2)]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-7 left-7 z-20 size-6 border-b border-l border-[rgb(var(--studios-text)/0.2)]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-7 right-7 z-20 size-6 border-b border-r border-[rgb(var(--studios-text)/0.2)]"
      />

      {/* Content anchored low-left, like a film title card. */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-start justify-end px-5 pb-16 pt-32 text-left md:px-8 md:pb-20">
        <FadeUp onMount delay={0}>
          <p className="font-display inline-flex items-center gap-4 text-[11px] uppercase tracking-[0.5em] text-[rgb(var(--studios-accent))] md:text-sm">
            <span
              aria-hidden
              className="h-px w-12 bg-[rgb(var(--studios-accent)/0.55)]"
            />
            Episode 01 · Available Now
          </p>
        </FadeUp>

        <FadeUp onMount delay={0.06}>
          <h1 className="font-display mt-6 leading-[0.82] tracking-[-0.01em] text-[rgb(var(--studios-text))]">
            <span className="block text-[clamp(4.5rem,15vw,11rem)]">
              GALILEYO
            </span>
            <span className="block text-[clamp(4.5rem,15vw,11rem)] text-[rgb(var(--studios-accent))] [text-shadow:0_0_60px_rgb(var(--studios-accent)/0.25)]">
              STUDIOS
            </span>
          </h1>
        </FadeUp>

        <FadeUp onMount delay={0.12}>
          <p className="font-editorial mt-7 max-w-[38ch] text-lg italic leading-relaxed text-[rgb(var(--studios-text-muted))] md:text-2xl">
            Original short-form films from the front lines of the new
            resistance.
          </p>
        </FadeUp>

        <FadeUp
          onMount
          delay={0.18}
          className="mt-11 flex w-full flex-col items-start gap-10 md:flex-row md:items-end md:gap-14"
        >
          <div className="flex flex-wrap gap-3.5">
            <motion.div whileTap={{ scale: 0.97 }} transition={STUDIOS_SPRING}>
              <Button
                asChild
                size="lg"
                className="font-display h-[54px] rounded-full bg-[rgb(var(--studios-accent))] px-7 text-[15px] uppercase tracking-[0.22em] text-[rgb(var(--studios-bg))] shadow-[0_18px_50px_-16px_rgb(var(--studios-accent)/0.8)] hover:bg-[rgb(var(--studios-accent-hi))]"
              >
                <Link href="/watch/episode-1">
                  <Play className="size-4" aria-hidden />
                  Watch Episode 1 Free
                </Link>
              </Button>
            </motion.div>
            <motion.div whileTap={{ scale: 0.97 }} transition={STUDIOS_SPRING}>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="font-display h-[54px] rounded-full border border-[rgb(var(--studios-accent)/0.45)] bg-transparent px-7 text-[15px] uppercase tracking-[0.22em] text-[rgb(var(--studios-text))] hover:border-[rgb(var(--studios-accent))] hover:bg-[rgb(var(--studios-accent)/0.08)] hover:text-[rgb(var(--studios-accent-hi))]"
              >
                <Link href="/pricing">
                  Become a Producer
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </Button>
            </motion.div>
          </div>

          <StudiosCountdown
            targetDate={nextEpisodeDate}
            className="items-start md:ml-auto md:items-end"
          />
        </FadeUp>
      </div>
    </section>
  );
}
