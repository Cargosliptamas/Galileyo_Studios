import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import { Button } from "@galileyo/ui/button";

const INCLUSIONS = [
  "All 7 episodes streamable any time",
  "Ad-free playback across Studios",
  "Behind-the-scenes feature-length cut",
  "Weekly exclusive drops",
  "Affiliate discounts (Escape Zone, Ghost Phone, more)",
  "Build the next episode with Brett Miller",
];

export function StudiosBronzeUpsell() {
  return (
    <section className="border-t border-[rgb(var(--studios-border))]/40 bg-[rgb(var(--studios-bg))] py-24 md:py-32">
      <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
        <article className="overflow-hidden rounded-3xl border border-[rgb(var(--studios-border))]/70 bg-[rgb(var(--studios-surface))]/80 p-8 md:p-14">
          <div className="grid gap-10 md:grid-cols-[1.2fr_1fr] md:gap-14">
            <div className="space-y-6">
              <p className="font-display text-xs uppercase tracking-[0.4em] text-[rgb(var(--studios-accent))]">
                Bronze All-Access
              </p>
              <h2 className="font-display text-4xl text-[rgb(var(--studios-text))] md:text-6xl">
                $24 a year.
                <br />
                All seven.
              </h2>
              <p className="font-editorial max-w-md text-base text-[rgb(var(--studios-text-muted))] md:text-lg">
                One ticket gets you Episode 1. Bronze gets you every episode,
                ad-free, plus the work-in-progress that never makes it to the
                final cut.
              </p>
              <ul className="grid gap-3 sm:grid-cols-2">
                {INCLUSIONS.map((line) => (
                  <li
                    key={line}
                    className="flex items-start gap-3 text-sm text-[rgb(var(--studios-text))]"
                  >
                    <Check
                      className="mt-0.5 size-4 shrink-0 text-[rgb(var(--studios-accent))]"
                      aria-hidden
                    />
                    <span className="font-editorial leading-relaxed">
                      {line}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="pt-2">
                <Button
                  asChild
                  className="font-display h-12 rounded-full bg-[rgb(var(--studios-accent))] px-8 text-xs uppercase tracking-[0.25em] text-[rgb(var(--studios-bg))] hover:bg-[rgb(var(--studios-accent-hi))]"
                >
                  <Link href="/pricing">
                    Get Bronze All-Access
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="flex flex-col justify-center rounded-2xl border border-[rgb(var(--studios-border))]/60 bg-[rgb(var(--studios-bg))]/70 p-6 md:p-8">
              <p className="font-display text-[11px] uppercase tracking-[0.3em] text-[rgb(var(--studios-text-muted))]">
                The math
              </p>
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div className="rounded-xl border border-[rgb(var(--studios-border))]/60 bg-[rgb(var(--studios-surface))]/70 p-5">
                  <p className="font-display text-xs uppercase tracking-[0.28em] text-[rgb(var(--studios-text-muted))]">
                    Per Episode
                  </p>
                  <p className="font-display mt-3 text-3xl text-[rgb(var(--studios-text))]">
                    $49
                  </p>
                  <p className="mt-1 text-[11px] text-[rgb(var(--studios-text-muted))]">
                    $7 × 7
                  </p>
                </div>
                <div className="rounded-xl border border-[rgb(var(--studios-accent))]/60 bg-[rgb(var(--studios-accent))]/10 p-5">
                  <p className="font-display text-xs uppercase tracking-[0.28em] text-[rgb(var(--studios-accent))]">
                    Bronze
                  </p>
                  <p className="font-display mt-3 text-3xl text-[rgb(var(--studios-accent-hi))]">
                    $24
                  </p>
                  <p className="mt-1 text-[11px] text-[rgb(var(--studios-text-muted))]">
                    Per year
                  </p>
                </div>
                <div className="rounded-xl border border-[rgb(var(--studios-border))]/60 bg-[rgb(var(--studios-surface))]/70 p-5">
                  <p className="font-display text-xs uppercase tracking-[0.28em] text-[rgb(var(--studios-text-muted))]">
                    You Save
                  </p>
                  <p className="font-display mt-3 text-3xl text-[rgb(var(--studios-text))]">
                    $25
                  </p>
                  <p className="mt-1 text-[11px] text-[rgb(var(--studios-text-muted))]">
                    On year 1
                  </p>
                </div>
              </div>
              <p className="font-editorial mt-6 text-center text-sm text-[rgb(var(--studios-text-muted))]">
                Cancel any time. Existing Galileyo subscribers can layer Bronze
                on top.
              </p>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
