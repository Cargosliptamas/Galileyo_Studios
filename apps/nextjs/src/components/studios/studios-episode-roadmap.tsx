import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { Episode } from "~/lib/studios/episodes";
import { EPISODES } from "~/lib/studios/episodes";
import { Stagger, StaggerItem } from "./motion";
import { StudiosEpisodeCard } from "./studios-episode-card";

interface StudiosEpisodeRoadmapProps {
  episodes?: Episode[];
}

export function StudiosEpisodeRoadmap({
  episodes = EPISODES,
}: StudiosEpisodeRoadmapProps) {
  // The grid layout is designed for the seven-episode slate. Fall back to the
  // static array if a caller passes fewer so the layout never renders holes.
  const slate = episodes.length >= 7 ? episodes : EPISODES;
  const [episode1, episode2, episode3, episode4, episode5, episode6, episode7] =
    slate;

  if (
    !episode1 ||
    !episode2 ||
    !episode3 ||
    !episode4 ||
    !episode5 ||
    !episode6 ||
    !episode7
  ) {
    return null;
  }

  return (
    <section className="border-t border-[rgb(var(--studios-border))]/40 bg-[rgb(var(--studios-bg))] py-24 md:py-32">
      <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
        <div className="mb-12 flex flex-col gap-4 md:mb-16 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-display inline-flex items-center gap-4 text-xs uppercase tracking-[0.4em] text-[rgb(var(--studios-accent))]">
              <span
                aria-hidden
                className="h-px w-10 bg-[rgb(var(--studios-accent)/0.55)]"
              />
              The Roadmap
            </p>
            <h2 className="font-display mt-3 text-4xl text-[rgb(var(--studios-text))] md:text-6xl">
              Seven episodes,
              <br />
              one at a time.
            </h2>
          </div>
          <p className="font-editorial max-w-md text-base text-[rgb(var(--studios-text-muted))] md:text-lg">
            Each episode is funded by you. Watch the one that&apos;s out. Help
            make the next six happen.
          </p>
        </div>

        {/*
          Single column on mobile so each card gets full width. The asymmetric
          seven-up layout (hero spanning two columns and two rows, two wide cards
          on the bottom row) is reapplied only from md up via span utilities.
          Source order ep1..ep7 places into the same arrangement the old
          grid-template-areas produced, without inline styles that ignore
          breakpoints.
        */}
        <Stagger className="grid grid-cols-1 gap-4 md:grid-cols-4 md:gap-5">
          <StaggerItem
            index={0}
            className="min-h-[24rem] md:col-span-2 md:row-span-2 md:min-h-0"
          >
            <StudiosEpisodeCard episode={episode1} variant="hero" />
          </StaggerItem>
          <StaggerItem index={1}>
            <StudiosEpisodeCard episode={episode2} />
          </StaggerItem>
          <StaggerItem index={2}>
            <StudiosEpisodeCard episode={episode3} />
          </StaggerItem>
          <StaggerItem index={3}>
            <StudiosEpisodeCard episode={episode4} />
          </StaggerItem>
          <StaggerItem index={4}>
            <StudiosEpisodeCard episode={episode5} />
          </StaggerItem>
          <StaggerItem index={5} className="md:col-span-2">
            <StudiosEpisodeCard episode={episode6} variant="wide" />
          </StaggerItem>
          <StaggerItem index={6} className="md:col-span-2">
            <StudiosEpisodeCard episode={episode7} variant="wide" />
          </StaggerItem>
        </Stagger>

        <div className="mt-12 flex flex-col items-center gap-4 text-center md:mt-16">
          <p className="font-editorial text-base text-[rgb(var(--studios-text-muted))] md:text-lg">
            Each episode is funded by you. Become a producer to make it happen.
          </p>
          <Link
            href="/pricing"
            className="font-display inline-flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-[rgb(var(--studios-accent))] transition-colors hover:text-[rgb(var(--studios-accent-hi))]"
          >
            See the producer tiers
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
