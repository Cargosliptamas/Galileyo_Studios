import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import { CAST_PREVIEW } from "~/lib/studios/cast";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5">
          {CAST_PREVIEW.map((member) => (
            <article
              key={member.id}
              className="flex items-center gap-5 rounded-2xl border border-[rgb(var(--studios-border))]/60 bg-[rgb(var(--studios-surface))]/60 p-5 transition-colors hover:border-[rgb(var(--studios-accent))]/50"
            >
              <div
                className="flex size-16 shrink-0 items-center justify-center rounded-full border border-[rgb(var(--studios-accent))]/40 bg-[rgb(var(--studios-surface-hi))] ring-1 ring-inset ring-[rgb(var(--studios-accent))]/15"
                aria-hidden
              >
                <span className="font-display text-2xl leading-none tracking-[0.08em] text-[rgb(var(--studios-accent))]">
                  {initials(member.name)}
                </span>
              </div>
              <div className="min-w-0">
                <p className="font-display text-lg text-[rgb(var(--studios-text))]">
                  {member.name}
                </p>
                <p className="font-display text-[10px] uppercase tracking-[0.3em] text-[rgb(var(--studios-text-muted))]">
                  {member.role}
                </p>
                {member.imdbUrl ? (
                  <a
                    href={member.imdbUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-display mt-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.3em] text-[rgb(var(--studios-accent))] transition-colors hover:text-[rgb(var(--studios-accent-hi))]"
                  >
                    IMDb
                    <ArrowUpRight className="size-3" aria-hidden />
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </div>

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
