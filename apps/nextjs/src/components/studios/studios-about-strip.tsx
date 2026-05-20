import Link from "next/link";
import { ArrowRight, Camera } from "lucide-react";

import { cn } from "@galileyo/ui";

import { CAST_PREVIEW } from "~/lib/studios/cast";

const TONES = [
  "from-amber-500/20",
  "from-rose-500/20",
  "from-emerald-500/15",
  "from-sky-500/20",
  "from-violet-500/20",
  "from-orange-500/20",
];

export function StudiosAboutStrip() {
  return (
    <section className="border-t border-[rgb(var(--studios-border))]/40 bg-[rgb(var(--studios-bg))] py-24 md:py-32">
      <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
        <div className="mb-12 flex flex-col gap-4 md:mb-16 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-display text-xs uppercase tracking-[0.4em] text-[rgb(var(--studios-accent))]">
              The People
            </p>
            <h2 className="font-display mt-3 text-4xl text-[rgb(var(--studios-text))] md:text-5xl">
              Meet the team behind
              <br />
              the resistance.
            </h2>
          </div>
          <p className="font-editorial max-w-md text-sm text-[rgb(var(--studios-text-muted))]">
            Cast list pending confirmation. Names locked in writing only.
            We&apos;ll publish headshots and bios as each contract closes.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6 md:gap-5">
          {CAST_PREVIEW.map((member, index) => (
            <article
              key={member.id}
              className="flex flex-col rounded-2xl border border-[rgb(var(--studios-border))]/60 bg-[rgb(var(--studios-surface))]/60 p-3 text-center transition-colors hover:border-[rgb(var(--studios-accent))]/50"
            >
              <div
                className={cn(
                  "relative mb-3 flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br via-zinc-900 to-zinc-950",
                  TONES[index % TONES.length],
                )}
              >
                <Camera className="size-7 text-white/30" aria-hidden />
                {member.status === "pending" ? (
                  <span className="font-display absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-[rgb(var(--studios-bg))]/80 px-2 py-0.5 text-[9px] uppercase tracking-[0.28em] text-[rgb(var(--studios-text-muted))] backdrop-blur-sm">
                    TBC
                  </span>
                ) : null}
              </div>
              <p className="font-display text-sm text-[rgb(var(--studios-text))]">
                {member.name}
              </p>
              <p className="font-display text-[10px] uppercase tracking-[0.3em] text-[rgb(var(--studios-text-muted))]">
                {member.role}
              </p>
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
