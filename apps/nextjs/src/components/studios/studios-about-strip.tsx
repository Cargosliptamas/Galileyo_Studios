import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { CAST_PREVIEW } from "~/lib/studios/cast";
import { StudiosCastGrid } from "./studios-cast-grid";

export function StudiosAboutStrip() {
  return (
    <section className="border-t border-[rgb(var(--studios-border))]/40 bg-[rgb(var(--studios-bg))] py-24 md:py-32">
      <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
        <div className="mb-12 flex flex-col gap-4 md:mb-16 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-display text-xs uppercase tracking-[0.4em] text-[rgb(var(--studios-accent))]">
              Voiceover Cast, Episode 1
            </p>
            <h2 className="font-display mt-3 text-4xl text-[rgb(var(--studios-text))] md:text-5xl">
              The voices behind
              <br />
              the resistance.
            </h2>
          </div>
          <p className="font-editorial max-w-md text-sm text-[rgb(var(--studios-text-muted))]">
            Confirmed performers lending their voices to Episode 1. Headshots
            and character names land as each is locked in writing.
          </p>
        </div>

        <StudiosCastGrid members={CAST_PREVIEW} />

        <div className="mt-12 flex justify-center">
          <Link
            href="/studios/about"
            className="font-display inline-flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-[rgb(var(--studios-accent))] transition-colors hover:text-[rgb(var(--studios-accent-hi))]"
          >
            Meet the team
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
