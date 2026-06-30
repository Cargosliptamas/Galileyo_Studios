"use client";

import Link from "next/link";
import { ArrowUpRight, Lock, Play } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@galileyo/ui";

import type { Episode } from "~/lib/studios/episodes";
import { STUDIOS_SPRING } from "./motion";

interface StudiosEpisodeCardProps {
  episode: Episode;
  variant?: "hero" | "standard" | "wide";
  className?: string;
}

const MotionLink = motion.create(Link);

// Single, token-pure scene gradient. The free hero glows gold; coming-soon
// cards sit back behind a near-neutral dark wash so Episode 1 reads as the
// clear lead.
const ART_AVAILABLE =
  "bg-[linear-gradient(135deg,rgb(var(--studios-accent)/0.32)_0%,rgb(var(--studios-surface-hi))_55%,rgb(var(--studios-bg))_100%)]";
const ART_SOON =
  "bg-[linear-gradient(135deg,rgb(var(--studios-accent)/0.10)_0%,rgb(var(--studios-surface-hi))_45%,rgb(var(--studios-bg))_100%)]";

export function StudiosEpisodeCard({
  episode,
  variant = "standard",
  className,
}: StudiosEpisodeCardProps) {
  const reduce = useReducedMotion();
  const isHero = variant === "hero";
  const isWide = variant === "wide";
  const isAvailable = episode.status === "available";
  const isFree = episode.isFree === true;
  const epNumber = episode.number.toString().padStart(2, "0");

  const detailHref = `/show/${episode.slug}`;
  const watchHref = `/watch/${episode.slug}`;
  const ctaHref = isAvailable ? watchHref : detailHref;

  return (
    <MotionLink
      href={ctaHref}
      whileHover={reduce ? undefined : { y: -6, rotateZ: 0.6 }}
      whileTap={reduce ? undefined : { scale: 0.99 }}
      transition={STUDIOS_SPRING}
      className={cn(
        "group relative isolate flex h-full flex-col overflow-hidden rounded-2xl border border-[rgb(var(--studios-border))]/70 bg-[rgb(var(--studios-surface))] transition-[border-color,box-shadow] duration-300 hover:border-[rgb(var(--studios-accent))]/60 hover:shadow-[0_30px_70px_-30px_rgb(var(--studios-accent)/0.5)]",
        // Coming-soon cards sit back so the free episode reads as the hero.
        !isAvailable && "opacity-[0.92]",
        className,
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden bg-[rgb(var(--studios-bg))]",
          isHero || isWide
            ? "aspect-[16/9] md:aspect-auto md:h-full"
            : "aspect-video",
        )}
      >
        <div
          className={cn(
            "absolute inset-0 transition-transform duration-700 group-hover:scale-[1.06]",
            isAvailable ? ART_AVAILABLE : ART_SOON,
          )}
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgb(var(--studios-bg)/0.96)_0%,rgb(var(--studios-bg)/0.35)_55%,transparent_100%)]" />

        <span
          aria-hidden
          className={cn(
            "font-display pointer-events-none absolute -top-2 right-2 leading-none tracking-tighter text-[rgb(var(--studios-text)/0.06)]",
            isHero || isWide
              ? "text-[7rem] md:text-[13rem]"
              : "text-8xl md:text-9xl",
          )}
        >
          {epNumber}
        </span>

        <div className="absolute left-5 top-5 z-10 flex items-center gap-2">
          <span className="font-display rounded-full bg-[rgb(var(--studios-bg))]/80 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-[rgb(var(--studios-accent))] backdrop-blur-sm">
            EP {epNumber}
          </span>
          {isFree ? (
            <span className="font-display rounded-full bg-[rgb(var(--studios-accent))] px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-[rgb(var(--studios-bg))]">
              Free
            </span>
          ) : null}
        </div>

        <div className="absolute right-5 top-5 z-10">
          <span
            className={cn(
              "font-display rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.28em] backdrop-blur-sm",
              isAvailable
                ? "bg-[rgb(var(--studios-accent))]/95 text-[rgb(var(--studios-bg))]"
                : "bg-[rgb(var(--studios-bg))]/80 text-[rgb(var(--studios-text-muted))]",
            )}
          >
            {episode.releaseLabel}
          </span>
        </div>

        <div className="absolute inset-0 z-10 flex items-center justify-center">
          {isAvailable ? (
            <span className="flex size-16 items-center justify-center rounded-full bg-[rgb(var(--studios-accent))]/95 text-[rgb(var(--studios-bg))] shadow-[0_10px_30px_rgb(var(--studios-bg)/0.45)] transition-transform duration-300 group-hover:scale-110 md:size-20">
              <Play className="size-6 fill-current md:size-8" aria-hidden />
            </span>
          ) : (
            <span className="flex size-14 items-center justify-center rounded-full border border-[rgb(var(--studios-text-muted))]/40 bg-[rgb(var(--studios-bg))]/70 text-[rgb(var(--studios-text-muted))] backdrop-blur-sm transition-transform duration-300 group-hover:scale-105 md:size-16">
              <Lock className="size-5 md:size-6" aria-hidden />
            </span>
          )}
        </div>
      </div>

      <div
        className={cn(
          "relative flex flex-1 flex-col gap-3 p-5",
          isHero ? "md:p-8" : "md:p-6",
        )}
      >
        <h3
          className={cn(
            "font-display leading-tight text-[rgb(var(--studios-text))]",
            isHero ? "text-3xl md:text-5xl" : "text-xl md:text-2xl",
          )}
        >
          {episode.title}
        </h3>
        <p
          className={cn(
            "font-editorial text-[rgb(var(--studios-text-muted))]",
            isHero ? "text-base md:text-lg" : "line-clamp-2 text-sm",
          )}
        >
          {episode.synopsis}
        </p>

        <div className="mt-auto flex items-center justify-between pt-3">
          {isAvailable ? (
            <span className="font-display text-xs uppercase tracking-[0.28em] text-[rgb(var(--studios-accent))]">
              {isFree ? "Watch Free" : "Watch Now"}
            </span>
          ) : (
            <span className="font-display text-xs uppercase tracking-[0.28em] text-[rgb(var(--studios-text-muted))]">
              Help fund this episode
            </span>
          )}
          <ArrowUpRight
            className="size-4 text-[rgb(var(--studios-text-muted))] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[rgb(var(--studios-accent))]"
            aria-hidden
          />
        </div>
      </div>
    </MotionLink>
  );
}
