import Link from "next/link";
import { ArrowUpRight, Lock, Play } from "lucide-react";

import { cn } from "@galileyo/ui";

import type { Episode } from "~/lib/studios/episodes";

interface StudiosEpisodeCardProps {
  episode: Episode;
  variant?: "hero" | "standard" | "wide";
  className?: string;
}

const HERO_GRADIENTS: Record<number, string> = {
  1: "from-amber-500/30 via-zinc-900 to-zinc-950",
  2: "from-rose-500/20 via-zinc-900 to-zinc-950",
  3: "from-emerald-500/15 via-zinc-900 to-zinc-950",
  4: "from-sky-500/20 via-zinc-900 to-zinc-950",
  5: "from-violet-500/20 via-zinc-900 to-zinc-950",
  6: "from-orange-500/20 via-zinc-900 to-zinc-950",
  7: "from-teal-500/20 via-zinc-900 to-zinc-950",
};

export function StudiosEpisodeCard({
  episode,
  variant = "standard",
  className,
}: StudiosEpisodeCardProps) {
  const isHero = variant === "hero";
  const isWide = variant === "wide";
  const isAvailable = episode.status === "available";
  const gradient = HERO_GRADIENTS[episode.number] ?? HERO_GRADIENTS[1];

  const detailHref = `/studios/episodes/${episode.slug}`;
  const watchHref = `/studios/watch/${episode.slug}`;
  const ctaHref = isAvailable ? watchHref : detailHref;

  return (
    <Link
      href={ctaHref}
      className={cn(
        "group relative isolate flex h-full flex-col overflow-hidden rounded-2xl border border-[rgb(var(--studios-border))]/70 bg-[rgb(var(--studios-surface))] transition-all duration-300 hover:-translate-y-1 hover:border-[rgb(var(--studios-accent))]/60 hover:shadow-[0_25px_60px_-30px_rgba(200,160,74,0.55)]",
        className,
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden bg-zinc-950",
          isHero || isWide ? "aspect-[16/9] md:aspect-auto md:h-full" : "aspect-video",
        )}
      >
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br opacity-90 transition-transform duration-700 group-hover:scale-105",
            gradient,
          )}
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(11,11,13,0.95)_0%,rgba(11,11,13,0.35)_55%,transparent_100%)]" />

        <span
          aria-hidden
          className="font-display absolute right-4 top-4 text-7xl leading-none tracking-tighter text-white/10 md:text-9xl"
        >
          {episode.number.toString().padStart(2, "0")}
        </span>

        <div className="absolute left-5 top-5 flex items-center gap-2">
          <span className="font-display rounded-full bg-[rgb(var(--studios-bg))]/80 px-3 py-1 text-[10px] uppercase tracking-[0.32em] text-[rgb(var(--studios-accent))] backdrop-blur-sm">
            EP {episode.number.toString().padStart(2, "0")}
          </span>
        </div>

        <div className="absolute right-5 top-5">
          <span
            className={cn(
              "font-display rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.28em] backdrop-blur-sm",
              isAvailable
                ? "bg-[rgb(var(--studios-accent))]/95 text-[rgb(11,11,13)]"
                : "bg-[rgb(var(--studios-bg))]/80 text-[rgb(var(--studios-text-muted))]",
            )}
          >
            {episode.releaseLabel}
          </span>
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          {isAvailable ? (
            <span className="flex size-16 items-center justify-center rounded-full bg-[rgb(var(--studios-accent))]/95 text-[rgb(11,11,13)] opacity-90 shadow-lg shadow-black/40 transition-transform duration-300 group-hover:scale-110 md:size-20">
              <Play className="size-6 fill-current md:size-8" aria-hidden />
            </span>
          ) : (
            <span className="flex size-14 items-center justify-center rounded-full border border-[rgb(var(--studios-text-muted))]/40 bg-[rgb(var(--studios-bg))]/70 text-[rgb(var(--studios-text-muted))] backdrop-blur-sm md:size-16">
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
              Watch Now
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
    </Link>
  );
}
