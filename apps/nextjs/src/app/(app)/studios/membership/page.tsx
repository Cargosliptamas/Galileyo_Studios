import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, X } from "lucide-react";

import { cn } from "@galileyo/ui";
import { Button } from "@galileyo/ui/button";

import { StudiosCheckoutButton } from "~/components/studios/studios-checkout-button";
import { StudiosEmailGate } from "~/components/studios/studios-email-gate";

export const metadata: Metadata = {
  title: "Bronze All-Access",
  description:
    "Bronze All-Access. $24 a year for every Studios episode, the full BTS cut, ad-free playback, and partner discounts.",
};

const INCLUSIONS = [
  "All 7 episodes streamable on Studios any time",
  "Ad-free playback across every episode",
  "Behind-the-scenes feature-length cut",
  "Weekly exclusive drops between episodes",
  "Affiliate discounts (Escape Zone, Ghost Phone, more)",
  "Vote on production calls with Brett Miller",
  "Bronze-only community channel",
  "First-look at producer announcements",
];

interface PlanColumn {
  id: "per-episode" | "bronze" | "free";
  badge: string;
  title: string;
  price: string;
  priceNote: string;
  caption: string;
  rows: { label: string; included: boolean | "limited" }[];
  cta?: { label: string; href: string; variant: "primary" | "ghost" };
  featured?: boolean;
}

const COLUMNS: PlanColumn[] = [
  {
    id: "per-episode",
    badge: "Pay per episode",
    title: "$7 each",
    price: "$49",
    priceNote: "$7 × 7 episodes",
    caption: "Buy them one at a time as they drop.",
    rows: [
      { label: "All 7 episodes", included: true },
      { label: "Ad-free playback", included: true },
      { label: "Behind-the-scenes cut", included: false },
      { label: "Affiliate discounts", included: false },
      { label: "Community access", included: false },
    ],
    cta: {
      label: "Buy per episode",
      href: "/studios/episodes",
      variant: "ghost",
    },
  },
  {
    id: "bronze",
    badge: "Best value",
    title: "Bronze All-Access",
    price: "$24",
    priceNote: "Per year. Save $25.",
    caption: "Everything we make on Studios, included.",
    rows: [
      { label: "All 7 episodes", included: true },
      { label: "Ad-free playback", included: true },
      { label: "Behind-the-scenes cut", included: true },
      { label: "Affiliate discounts", included: true },
      { label: "Community access", included: true },
    ],
    // TODO(brett-miller): swap for live Stripe subscription once accounts are connected.
    cta: {
      label: "Get Bronze All-Access",
      href: "#checkout-coming-soon",
      variant: "primary",
    },
    featured: true,
  },
  {
    id: "free",
    badge: "Free",
    title: "Email unlock",
    price: "$0",
    priceNote: "Episode 1 only",
    caption: "Drop your email, watch the pilot, decide from there.",
    rows: [
      { label: "All 7 episodes", included: "limited" },
      { label: "Ad-free playback", included: true },
      { label: "Behind-the-scenes cut", included: false },
      { label: "Affiliate discounts", included: false },
      { label: "Community access", included: false },
    ],
    cta: { label: "Watch Episode 1 free", href: "/studios", variant: "ghost" },
  },
];

export default function MembershipPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden">
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-br from-amber-500/30 via-zinc-900 to-zinc-950"
          aria-hidden
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgb(var(--studios-bg)/0.4)_0%,rgb(var(--studios-bg)/0.92)_85%,rgb(var(--studios-bg))_100%)]" />
        <div className="mx-auto flex min-h-[55vh] w-full max-w-6xl flex-col justify-end px-5 py-20 md:px-8 md:py-28">
          <p className="font-display text-xs uppercase tracking-[0.4em] text-[rgb(var(--studios-accent))]">
            Bronze All-Access
          </p>
          <h1 className="font-display mt-4 text-[clamp(2.25rem,9vw,3.5rem)] leading-[1.05] text-[rgb(var(--studios-text))] md:text-7xl">
            $24 a year.
            <br />
            All seven episodes.
          </h1>
          <p className="font-editorial mt-6 max-w-2xl text-lg text-[rgb(var(--studios-text-muted))] md:text-xl">
            One ticket gets you Episode 1. Bronze gets you the whole series, the
            work-in-progress cut, the community, and the discounts. No ads, no
            episodes locked away, no monthly squeeze.
          </p>
        </div>
      </section>

      <section className="border-t border-[rgb(var(--studios-border))]/40 bg-[rgb(var(--studios-bg))] py-20 md:py-28">
        <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="font-display text-[11px] uppercase tracking-[0.4em] text-[rgb(var(--studios-accent))]">
              Three ways to watch
            </p>
            <h2 className="font-display mt-3 text-3xl text-[rgb(var(--studios-text))] md:text-5xl">
              Pick the one that fits.
            </h2>
            <p className="font-editorial mt-3 text-base text-[rgb(var(--studios-text-muted))]">
              Bronze pays for itself by Episode 4. The other two columns are
              here in case you want to dip a toe in first.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {COLUMNS.map((col) => (
              <article
                key={col.id}
                className={cn(
                  "relative flex flex-col rounded-2xl border bg-[rgb(var(--studios-surface))] p-7 transition-all duration-300 md:p-9",
                  col.featured
                    ? "border-[rgb(var(--studios-accent))]/70 shadow-[0_30px_80px_-40px_rgba(200,160,74,0.55)] md:scale-[1.02]"
                    : "border-[rgb(var(--studios-border))]/70",
                )}
              >
                {col.featured ? (
                  <span className="font-display absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[rgb(var(--studios-accent))] px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-[rgb(var(--studios-bg))]">
                    Best value
                  </span>
                ) : null}
                <p className="font-display text-[11px] uppercase tracking-[0.32em] text-[rgb(var(--studios-text-muted))]">
                  {col.badge}
                </p>
                <h3 className="font-display mt-3 text-2xl text-[rgb(var(--studios-text))]">
                  {col.title}
                </h3>
                <div className="mt-4 flex items-baseline gap-3">
                  <p
                    className={cn(
                      "font-display text-5xl",
                      col.featured
                        ? "text-[rgb(var(--studios-accent-hi))]"
                        : "text-[rgb(var(--studios-text))]",
                    )}
                  >
                    {col.price}
                  </p>
                  <p className="font-display text-[10px] uppercase tracking-[0.28em] text-[rgb(var(--studios-text-muted))]">
                    {col.priceNote}
                  </p>
                </div>
                <p className="font-editorial mt-3 text-sm text-[rgb(var(--studios-text-muted))]">
                  {col.caption}
                </p>

                <ul className="mt-6 space-y-3 border-t border-[rgb(var(--studios-border))]/60 pt-5 text-sm">
                  {col.rows.map((row) => (
                    <li
                      key={row.label}
                      className="flex items-start gap-3 text-[rgb(var(--studios-text))]"
                    >
                      {row.included === true ? (
                        <Check
                          className="mt-0.5 size-4 shrink-0 text-[rgb(var(--studios-accent))]"
                          aria-hidden
                        />
                      ) : row.included === "limited" ? (
                        <span
                          className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--studios-accent))]/20 text-[9px] font-bold text-[rgb(var(--studios-accent))]"
                          aria-hidden
                        >
                          1
                        </span>
                      ) : (
                        <X
                          className="mt-0.5 size-4 shrink-0 text-[rgb(var(--studios-text-muted))]/60"
                          aria-hidden
                        />
                      )}
                      <span className="font-editorial leading-relaxed">
                        {row.label}
                        {row.included === "limited" ? (
                          <span className="ml-1 text-[10px] uppercase tracking-[0.18em] text-[rgb(var(--studios-text-muted))]">
                            Episode 1 only
                          </span>
                        ) : null}
                      </span>
                    </li>
                  ))}
                </ul>

                {col.cta ? (
                  <div className="mt-8 pt-2">
                    {col.id === "bronze" ? (
                      <StudiosCheckoutButton
                        kind="bronze"
                        label={col.cta.label}
                      />
                    ) : (
                      <Button
                        asChild
                        className={cn(
                          "font-display h-12 w-full rounded-full text-xs uppercase tracking-[0.25em]",
                          col.cta.variant === "primary"
                            ? "bg-[rgb(var(--studios-accent))] text-[rgb(var(--studios-bg))] hover:bg-[rgb(var(--studios-accent-hi))]"
                            : "border border-[rgb(var(--studios-accent))]/70 bg-transparent text-[rgb(var(--studios-text))] hover:bg-[rgb(var(--studios-accent))]/10",
                        )}
                      >
                        <Link href={col.cta.href}>
                          {col.cta.label}
                          {col.cta.variant === "primary" ? (
                            <ArrowRight className="size-4" aria-hidden />
                          ) : null}
                        </Link>
                      </Button>
                    )}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[rgb(var(--studios-border))]/40 bg-[rgb(var(--studios-bg))] py-20 md:py-28">
        <div className="mx-auto w-full max-w-6xl px-5 md:px-8">
          <div className="mb-10 max-w-2xl">
            <p className="font-display text-[11px] uppercase tracking-[0.4em] text-[rgb(var(--studios-accent))]">
              What you get
            </p>
            <h2 className="font-display mt-3 text-3xl text-[rgb(var(--studios-text))] md:text-5xl">
              Everything in Bronze.
            </h2>
            <p className="font-editorial mt-3 text-base text-[rgb(var(--studios-text-muted))]">
              Built so you keep getting value between episodes, not just on
              release day.
            </p>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2">
            {INCLUSIONS.map((line) => (
              <li
                key={line}
                className="flex items-start gap-3 rounded-xl border border-[rgb(var(--studios-border))]/60 bg-[rgb(var(--studios-surface))]/60 p-4 text-[rgb(var(--studios-text))]"
              >
                <Check
                  className="mt-0.5 size-5 shrink-0 text-[rgb(var(--studios-accent))]"
                  aria-hidden
                />
                <span className="font-editorial leading-relaxed">{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="checkout-coming-soon"
        className="border-t border-[rgb(var(--studios-border))]/40 bg-[rgb(var(--studios-bg))] py-20 md:py-24"
      >
        <div className="mx-auto w-full max-w-3xl px-5 md:px-8">
          <div className="rounded-3xl border border-[rgb(var(--studios-accent))]/40 bg-[rgb(var(--studios-surface))]/80 p-8 text-center md:p-12">
            <p className="font-display text-[11px] uppercase tracking-[0.4em] text-[rgb(var(--studios-accent))]">
              Phase 3 launch
            </p>
            <h3 className="font-display mt-3 text-3xl text-[rgb(var(--studios-text))] md:text-4xl">
              Bronze checkout opens with Episode 2.
            </h3>
            <p className="font-editorial mt-3 text-base text-[rgb(var(--studios-text-muted))]">
              {/* TODO(brett-miller): replace with confirmed Episode 2 date once locked. */}
              Drop your email and we will send the link the day Bronze goes live
              and the day Episode 2 drops. Same email, both notifications.
            </p>
          </div>

          <div className="mt-8">
            <StudiosEmailGate
              variant="band"
              headline="Get the Bronze launch link."
              description="One email, no follow-ups, just the link the moment checkout opens."
            />
          </div>
        </div>
      </section>
    </>
  );
}
