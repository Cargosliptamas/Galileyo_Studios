import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { EPISODES } from "~/lib/studios/episodes";
import { StudiosEpisodeCard } from "./studios-episode-card";

export function StudiosEpisodeRoadmap() {
  const [episode1, episode2, episode3, episode4, episode5, episode6, episode7] =
    EPISODES;

  return (
    <section className="border-t border-[rgb(var(--studios-border))]/40 bg-[rgb(var(--studios-bg))] py-24 md:py-32">
      <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
        <div className="mb-12 flex flex-col gap-4 md:mb-16 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-display text-xs uppercase tracking-[0.4em] text-[rgb(var(--studios-accent))]">
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

        <div
          className="grid grid-cols-1 gap-4 md:grid-cols-4 md:gap-5"
          style={{
            gridTemplateAreas: `
              "ep1 ep1 ep2 ep3"
              "ep1 ep1 ep4 ep5"
              "ep6 ep6 ep7 ep7"
            `,
          }}
        >
          <div style={{ gridArea: "ep1" }} className="min-h-[24rem] md:min-h-0">
            <StudiosEpisodeCard episode={episode1} variant="hero" />
          </div>
          <div style={{ gridArea: "ep2" }}>
            <StudiosEpisodeCard episode={episode2} />
          </div>
          <div style={{ gridArea: "ep3" }}>
            <StudiosEpisodeCard episode={episode3} />
          </div>
          <div style={{ gridArea: "ep4" }}>
            <StudiosEpisodeCard episode={episode4} />
          </div>
          <div style={{ gridArea: "ep5" }}>
            <StudiosEpisodeCard episode={episode5} />
          </div>
          <div style={{ gridArea: "ep6" }}>
            <StudiosEpisodeCard episode={episode6} variant="wide" />
          </div>
          <div style={{ gridArea: "ep7" }}>
            <StudiosEpisodeCard episode={episode7} variant="wide" />
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-4 text-center md:mt-16">
          <p className="font-editorial text-base text-[rgb(var(--studios-text-muted))] md:text-lg">
            Each episode is funded by you. Become a producer to make it happen.
          </p>
          <Link
            href="/studios/producers"
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
