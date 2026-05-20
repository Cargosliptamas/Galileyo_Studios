import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { cn } from "@galileyo/ui";

import { SPONSORS } from "~/lib/studios/partners";

export function StudiosSponsorStrip() {
  return (
    <section className="border-t border-[rgb(var(--studios-border))]/40 bg-[rgb(var(--studios-bg))] py-20 md:py-24">
      <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
        <div className="mb-10 text-center">
          <p className="font-display text-xs uppercase tracking-[0.4em] text-[rgb(var(--studios-accent))]">
            Backed By
          </p>
          <h2 className="font-display mt-3 text-3xl text-[rgb(var(--studios-text))] md:text-4xl">
            Brands that show up when it matters.
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
          {SPONSORS.map((sponsor) => {
            const isPlaceholder = sponsor.status === "placeholder";
            return (
              <div
                key={sponsor.id}
                className={cn(
                  "group relative flex h-24 items-center justify-center rounded-xl border border-[rgb(var(--studios-border))]/60 bg-[rgb(var(--studios-surface))]/40 px-4 transition-all duration-300",
                  isPlaceholder
                    ? "border-dashed text-[rgb(var(--studios-text-muted))]/60"
                    : "hover:border-[rgb(var(--studios-accent))]/60 hover:bg-[rgb(var(--studios-surface))]/80",
                )}
              >
                <span
                  className={cn(
                    "font-display text-lg uppercase tracking-[0.22em] transition-colors duration-300",
                    isPlaceholder
                      ? "text-[rgb(var(--studios-text-muted))]/50"
                      : "text-[rgb(var(--studios-text-muted))] grayscale group-hover:text-[rgb(var(--studios-accent-hi))] group-hover:grayscale-0",
                  )}
                >
                  {sponsor.name}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-12 flex flex-col items-center gap-3 text-center">
          <p className="font-editorial max-w-2xl text-base text-[rgb(var(--studios-text-muted))] md:text-lg">
            Want to sponsor? Reach the people the rest of media can&apos;t.
          </p>
          <Link
            href="/studios/sponsors"
            className="font-display inline-flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-[rgb(var(--studios-accent))] transition-colors hover:text-[rgb(var(--studios-accent-hi))]"
          >
            See sponsor inventory
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
