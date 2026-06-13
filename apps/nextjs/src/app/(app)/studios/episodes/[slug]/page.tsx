import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Camera, Lock, Play } from "lucide-react";

import { cn } from "@galileyo/ui";
import { Button } from "@galileyo/ui/button";

import { StudiosEmailGate } from "~/components/studios/studios-email-gate";
import { hasEpisode1Access } from "~/lib/studios/access";
import { getEpisodeBySlugDb } from "~/lib/studios/episodes-db";
import { AFFILIATE_OFFERS } from "~/lib/studios/partners";

interface Params {
  slug: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const episode = await getEpisodeBySlugDb(slug);
  if (!episode) return { title: "Episode not found" };
  return {
    title: `Episode ${episode.number}: ${episode.title}`,
    description: episode.synopsis,
  };
}

const HERO_GRADIENTS: Record<number, string> = {
  1: "from-amber-500/40 via-zinc-900 to-zinc-950",
  2: "from-rose-500/30 via-zinc-900 to-zinc-950",
  3: "from-emerald-500/20 via-zinc-900 to-zinc-950",
  4: "from-sky-500/30 via-zinc-900 to-zinc-950",
  5: "from-violet-500/30 via-zinc-900 to-zinc-950",
  6: "from-orange-500/30 via-zinc-900 to-zinc-950",
  7: "from-teal-500/30 via-zinc-900 to-zinc-950",
};

function formatRuntime(runtime: number | undefined) {
  if (!runtime) return "Runtime TBD";
  const minutes = Math.floor(runtime / 60);
  const seconds = runtime % 60;
  return `${minutes} min ${seconds.toString().padStart(2, "0")} sec`;
}

const FEATURED_PRODUCTS = ["bivystick", "ghost-phone", "escape-zone"];

export default async function EpisodeDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const episode = await getEpisodeBySlugDb(slug);
  if (!episode) {
    notFound();
  }

  const isEpisode1 = episode.number === 1;
  const isAvailable = episode.status === "available";
  const hasAccess = isEpisode1 ? await hasEpisode1Access() : false;
  const gradient = HERO_GRADIENTS[episode.number] ?? HERO_GRADIENTS[1];

  const featuredProducts = AFFILIATE_OFFERS.filter((offer) =>
    FEATURED_PRODUCTS.includes(offer.id),
  );

  return (
    <>
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div
            className={cn("h-full w-full bg-gradient-to-br", gradient)}
            aria-hidden
          />
        </div>
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(11,11,13,0.5)_0%,rgba(11,11,13,0.85)_80%,rgb(11,11,13)_100%)]" />

        <div className="mx-auto flex min-h-[70vh] w-full max-w-6xl flex-col justify-end px-5 py-20 md:px-8 md:py-28">
          <Link
            href="/studios"
            className="font-display mb-8 text-xs uppercase tracking-[0.3em] text-[rgb(var(--studios-text-muted))] transition-colors hover:text-[rgb(var(--studios-accent))]"
          >
            ← Studios
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-display rounded-full bg-[rgb(var(--studios-bg))]/80 px-3 py-1 text-[11px] uppercase tracking-[0.32em] text-[rgb(var(--studios-accent))] backdrop-blur-sm">
              EP {episode.number.toString().padStart(2, "0")}
            </span>
            <span
              className={cn(
                "font-display rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.28em] backdrop-blur-sm",
                isAvailable
                  ? "bg-[rgb(var(--studios-accent))]/95 text-[rgb(11,11,13)]"
                  : "bg-[rgb(var(--studios-bg))]/80 text-[rgb(var(--studios-text-muted))]",
              )}
            >
              {episode.releaseLabel}
            </span>
            <span className="font-display rounded-full bg-[rgb(var(--studios-bg))]/80 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-[rgb(var(--studios-text-muted))] backdrop-blur-sm">
              {formatRuntime(episode.runtime)}
            </span>
          </div>
          <h1 className="font-display mt-6 break-words text-[clamp(2.25rem,9vw,3.5rem)] leading-[1.05] text-[rgb(var(--studios-text))] md:text-7xl">
            {episode.title}
          </h1>
          <p className="font-editorial mt-6 max-w-2xl text-lg text-[rgb(var(--studios-text-muted))] md:text-xl">
            {episode.synopsis}
          </p>
        </div>
      </section>

      <section className="border-t border-[rgb(var(--studios-border))]/40 bg-[rgb(var(--studios-bg))] py-20 md:py-24">
        <div className="mx-auto w-full max-w-5xl px-5 md:px-8">
          {isAvailable ? (
            hasAccess ? (
              <div className="flex flex-col items-center gap-5 rounded-2xl border border-[rgb(var(--studios-accent))]/60 bg-[rgb(var(--studios-surface))]/80 p-10 text-center md:p-14">
                <p className="font-display text-xs uppercase tracking-[0.4em] text-[rgb(var(--studios-accent))]">
                  Unlocked
                </p>
                <h2 className="font-display text-3xl text-[rgb(var(--studios-text))] md:text-4xl">
                  You&apos;re in. Press play.
                </h2>
                <Button
                  asChild
                  size="lg"
                  className="font-display h-12 min-w-[16rem] rounded-full bg-[rgb(var(--studios-accent))] text-sm uppercase tracking-[0.25em] text-[rgb(11,11,13)] hover:bg-[rgb(var(--studios-accent-hi))]"
                >
                  <Link href={`/studios/watch/${episode.slug}`}>
                    <Play className="size-4 fill-current" aria-hidden />
                    Watch Now
                  </Link>
                </Button>
              </div>
            ) : (
              <StudiosEmailGate
                variant="band"
                headline="Watch Episode 1 free."
                description="One email. One link. We'll keep it short."
              />
            )
          ) : (
            <div className="flex flex-col items-center gap-5 rounded-2xl border border-[rgb(var(--studios-border))]/70 bg-[rgb(var(--studios-surface))]/60 p-10 text-center md:p-14">
              <span className="flex size-12 items-center justify-center rounded-full border border-[rgb(var(--studios-text-muted))]/40 bg-[rgb(var(--studios-bg))]/80 text-[rgb(var(--studios-text-muted))]">
                <Lock className="size-5" aria-hidden />
              </span>
              <p className="font-display text-xs uppercase tracking-[0.4em] text-[rgb(var(--studios-accent))]">
                In production
              </p>
              <h2 className="font-display text-3xl text-[rgb(var(--studios-text))] md:text-4xl">
                This episode is being made right now.
              </h2>
              <p className="font-editorial max-w-xl text-base text-[rgb(var(--studios-text-muted))]">
                Help fund it. Producers get a credit, the full BTS cut, and
                early access the day the file renders.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="font-display h-12 min-w-[14rem] rounded-full bg-[rgb(var(--studios-accent))] text-xs uppercase tracking-[0.25em] text-[rgb(11,11,13)] hover:bg-[rgb(var(--studios-accent-hi))]"
                >
                  <Link href="/studios/producers">
                    Become a Producer
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="font-display h-12 min-w-[14rem] rounded-full border-[rgb(var(--studios-accent))]/60 bg-transparent text-xs uppercase tracking-[0.25em] text-[rgb(var(--studios-text))] hover:bg-[rgb(var(--studios-accent))]/10"
                >
                  <Link href="/studios/membership">Get Bronze All-Access</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-[rgb(var(--studios-border))]/40 bg-[rgb(var(--studios-bg))] py-20 md:py-24">
        <div className="mx-auto w-full max-w-6xl px-5 md:px-8">
          <p className="font-display text-xs uppercase tracking-[0.4em] text-[rgb(var(--studios-accent))]">
            Featured Cast
          </p>
          <h2 className="font-display mt-3 text-3xl text-[rgb(var(--studios-text))] md:text-4xl">
            Who&apos;s in this one.
          </h2>
          <p className="font-editorial mt-3 max-w-xl text-sm text-[rgb(var(--studios-text-muted))]">
            Cast list pending confirmation. Headshots and bios publish as
            contracts close.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 md:gap-5">
            {Array.from({ length: 4 }).map((_, index) => (
              <article
                key={index}
                className="flex flex-col rounded-2xl border border-[rgb(var(--studios-border))]/60 bg-[rgb(var(--studios-surface))]/60 p-3 text-center"
              >
                <div className="mb-3 flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-zinc-800 via-zinc-900 to-zinc-950">
                  <Camera className="size-7 text-white/30" aria-hidden />
                </div>
                <p className="font-display text-sm text-[rgb(var(--studios-text))]">
                  Cast TBC
                </p>
                <p className="font-display text-[10px] uppercase tracking-[0.3em] text-[rgb(var(--studios-text-muted))]">
                  Role pending
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[rgb(var(--studios-border))]/40 bg-[rgb(var(--studios-bg))] py-20 md:py-24">
        <div className="mx-auto w-full max-w-6xl px-5 md:px-8">
          <p className="font-display text-xs uppercase tracking-[0.4em] text-[rgb(var(--studios-accent))]">
            Featured In This Episode
          </p>
          <h2 className="font-display mt-3 text-3xl text-[rgb(var(--studios-text))] md:text-4xl">
            Gear from the set.
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
            {featuredProducts.map((offer) => (
              <a
                key={offer.id}
                href={offer.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-2xl border border-[rgb(var(--studios-border))]/70 bg-[rgb(var(--studios-surface))]/70 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[rgb(var(--studios-accent))]/60"
              >
                <p className="font-display text-[11px] uppercase tracking-[0.3em] text-[rgb(var(--studios-text-muted))]">
                  {offer.category}
                </p>
                <p className="font-display mt-3 text-2xl text-[rgb(var(--studios-text))]">
                  {offer.name}
                </p>
                <p className="font-display mt-2 text-xl text-[rgb(var(--studios-accent))]">
                  {offer.discountLine}
                </p>
                <p className="font-editorial mt-4 text-sm text-[rgb(var(--studios-text-muted))]">
                  {offer.description}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[rgb(var(--studios-border))]/40 bg-[rgb(var(--studios-bg))] py-20 md:py-24">
        <div className="mx-auto w-full max-w-6xl px-5 md:px-8">
          <p className="font-display text-xs uppercase tracking-[0.4em] text-[rgb(var(--studios-accent))]">
            Behind the Scenes
          </p>
          <h2 className="font-display mt-3 text-3xl text-[rgb(var(--studios-text))] md:text-4xl">
            From the cutting room floor.
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className={cn(
                  "relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl border border-[rgb(var(--studios-border))]/60 bg-gradient-to-br via-zinc-900 to-zinc-950",
                  HERO_GRADIENTS[(index % 7) + 1],
                )}
              >
                <Camera className="size-8 text-white/30" aria-hidden />
                <span className="font-display absolute bottom-3 right-3 rounded-full bg-[rgb(var(--studios-bg))]/80 px-2 py-0.5 text-[9px] uppercase tracking-[0.28em] text-[rgb(var(--studios-text-muted))] backdrop-blur-sm">
                  Still pending
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
