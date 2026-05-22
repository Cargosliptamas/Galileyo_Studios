import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Gamepad2 } from "lucide-react";

import { cn } from "@galileyo/ui";
import { Button } from "@galileyo/ui/button";

import { StudiosExecutiveInquiryModal } from "~/components/studios/studios-executive-inquiry-modal";
import { StudiosFundingProgress } from "~/components/studios/studios-funding-progress";
import { env } from "~/env/client";

export const metadata: Metadata = {
  title: "Producers",
  description:
    "Fund the films and the game. Three film tiers and one game tier. Names in the credits, BTS access, and a seat at the table.",
};

interface FilmTier {
  id: "associate" | "contributing" | "executive";
  name: string;
  price: string;
  priceLabel?: string;
  blurb: string;
  inclusions: string[];
  cta:
    | { kind: "link"; href: string; label: string }
    | { kind: "modal"; label: string };
  slots?: { total: number; taken: number };
  featured?: boolean;
}

const FILM_TIERS: FilmTier[] = [
  {
    id: "associate",
    name: "Associate Producer",
    price: "$50",
    blurb:
      "Lock in your seat. Get your name credited and the full series in your library.",
    inclusions: [
      "Your name in the end credits of one episode",
      "Digital download of all 7 episodes",
      "Signed digital poster",
      "Early access to behind-the-scenes drops",
    ],
    // TODO(brett-miller): swap for live Stripe checkout once accounts are connected.
    cta: { kind: "link", href: "#checkout-coming-soon", label: "Back this tier" },
  },
  {
    id: "contributing",
    name: "Contributing Producer",
    price: "$200",
    blurb:
      "The sweet spot. Bronze All-Access bundled in, a physical poster on the wall, and the full BTS cut.",
    inclusions: [
      "Everything in Associate, plus:",
      "Physical signed poster mailed to you",
      "Bronze All-Access membership included",
      "Exclusive community access",
      "Full-length behind-the-scenes cut",
    ],
    // TODO(brett-miller): swap for live Stripe checkout once accounts are connected.
    cta: { kind: "link", href: "#checkout-coming-soon", label: "Back this tier" },
    featured: true,
  },
  {
    id: "executive",
    name: "Executive Producer",
    price: "$250K",
    priceLabel: "7 slots only",
    blurb:
      "Take a real seat at the table. Screen credit, on-set visits, and the agreement is structured for equity-style upside.",
    inclusions: [
      "Everything above, plus:",
      "Screen credit as Executive Producer",
      "On-set visit during production",
      "Dinner with the Bretts",
      "Equity-style upside per producer agreement",
    ],
    cta: { kind: "modal", label: "Schedule a Call" },
    // TODO(brett-miller): confirm slotsTaken count once first slot closes.
    slots: { total: 7, taken: 0 },
  },
];

const GAME_INCLUSIONS = [
  "Free copy of the game on release",
  "Your name credited in the game",
  "Early-access build before public launch",
  "Private playtest invites during development",
];

const GAME_MILESTONES = ["$250K", "$500K", "$1M"];

export default function ProducersPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden">
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-br from-amber-500/25 via-zinc-900 to-zinc-950"
          aria-hidden
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(11,11,13,0.4)_0%,rgba(11,11,13,0.92)_85%,rgb(11,11,13)_100%)]" />
        <div className="mx-auto flex min-h-[55vh] w-full max-w-6xl flex-col justify-end px-5 py-20 md:px-8 md:py-28">
          <p className="font-display text-xs uppercase tracking-[0.4em] text-[rgb(var(--studios-accent))]">
            Become a Producer
          </p>
          <h1 className="font-display mt-4 max-w-3xl text-[clamp(2.25rem,9vw,3.5rem)] leading-[1.05] text-[rgb(var(--studios-text))] md:text-7xl">
            Fund the Films.
            <br />
            Get the Credit.
          </h1>
          <p className="font-editorial mt-6 max-w-2xl text-lg text-[rgb(var(--studios-text-muted))] md:text-xl">
            We are funding seven films and a companion game by selling the
            credits, not the rights. Every dollar from this page goes into the
            next episode. Your name goes on the screen, your money goes on the
            screen, and the rest of the audience gets the result for free or
            for a few bucks. That is the trade.
          </p>
        </div>
      </section>

      <section className="border-t border-[rgb(var(--studios-border))]/40 bg-[rgb(var(--studios-bg))] py-20 md:py-28">
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-5 md:px-8 lg:grid-cols-[1.6fr_1fr] lg:gap-10">
          <div id="film" className="flex flex-col gap-8">
            <div>
              <p className="font-display text-[11px] uppercase tracking-[0.4em] text-[rgb(var(--studios-accent))]">
                Film Producers
              </p>
              <h2 className="font-display mt-3 text-3xl text-[rgb(var(--studios-text))] md:text-5xl">
                Three ways to back the series.
              </h2>
              <p className="font-editorial mt-3 max-w-xl text-base text-[rgb(var(--studios-text-muted))]">
                Pick the tier that fits. Each one credits you on screen and
                ships you the full series.
              </p>
            </div>

            <div className="flex flex-col gap-5">
              {FILM_TIERS.map((tier) => (
                <article
                  id={tier.id}
                  key={tier.id}
                  className={cn(
                    "relative flex flex-col gap-6 rounded-2xl border bg-[rgb(var(--studios-surface))] p-7 transition-all duration-300 md:flex-row md:items-start md:gap-10 md:p-9",
                    tier.featured
                      ? "border-[rgb(var(--studios-accent))]/70 shadow-[0_30px_70px_-30px_rgba(200,160,74,0.5)]"
                      : "border-[rgb(var(--studios-border))]/70 hover:border-[rgb(var(--studios-accent))]/50",
                  )}
                >
                  {tier.featured ? (
                    <span className="font-display absolute -top-3 left-7 rounded-full bg-[rgb(var(--studios-accent))] px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-[rgb(11,11,13)]">
                      Most popular
                    </span>
                  ) : null}

                  <div className="flex flex-col gap-2 md:w-56 md:shrink-0">
                    <h3 className="font-display text-2xl text-[rgb(var(--studios-text))]">
                      {tier.name}
                    </h3>
                    <p className="font-display text-4xl text-[rgb(var(--studios-accent))]">
                      {tier.price}
                    </p>
                    {tier.priceLabel ? (
                      <p className="font-display text-[10px] uppercase tracking-[0.32em] text-[rgb(var(--studios-text-muted))]">
                        {tier.priceLabel}
                      </p>
                    ) : null}
                    {tier.slots ? (
                      <p className="font-display text-[11px] uppercase tracking-[0.28em] text-[rgb(var(--studios-text-muted))]">
                        {tier.slots.taken} of {tier.slots.total} taken
                      </p>
                    ) : null}
                    <p className="font-editorial mt-2 text-sm leading-relaxed text-[rgb(var(--studios-text-muted))]">
                      {tier.blurb}
                    </p>
                  </div>

                  <div className="flex flex-1 flex-col gap-6">
                    <ul className="space-y-3">
                      {tier.inclusions.map((line) => (
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

                    <div className="pt-2 md:max-w-xs">
                      {tier.cta.kind === "modal" ? (
                        <StudiosExecutiveInquiryModal
                          triggerLabel={tier.cta.label}
                          triggerClassName="font-display h-12 w-full rounded-full bg-[rgb(var(--studios-accent))] text-xs uppercase tracking-[0.25em] text-[rgb(11,11,13)] hover:bg-[rgb(var(--studios-accent-hi))]"
                        />
                      ) : (
                        <Button
                          asChild
                          className={cn(
                            "font-display h-12 w-full rounded-full text-xs uppercase tracking-[0.25em]",
                            tier.featured
                              ? "bg-[rgb(var(--studios-accent))] text-[rgb(11,11,13)] hover:bg-[rgb(var(--studios-accent-hi))]"
                              : "border border-[rgb(var(--studios-accent))]/70 bg-transparent text-[rgb(var(--studios-text))] hover:bg-[rgb(var(--studios-accent))]/10",
                          )}
                        >
                          <Link href={tier.cta.href}>{tier.cta.label}</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="rounded-2xl border border-[rgb(var(--studios-border))]/70 bg-[rgb(var(--studios-surface))]/60 p-6 md:p-10">
              <StudiosFundingProgress
                current={env.NEXT_PUBLIC_STUDIOS_FUNDING_FILM_CURRENT}
                target={env.NEXT_PUBLIC_STUDIOS_FUNDING_FILM_TARGET}
                label="Film series funding"
              />
            </div>
          </div>

          <aside
            id="game"
            className="flex flex-col gap-8 lg:sticky lg:top-28 lg:self-start"
          >
            <div>
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-full bg-[rgb(var(--studios-accent))]/15 text-[rgb(var(--studios-accent))]">
                  <Gamepad2 className="size-5" aria-hidden />
                </span>
                <p className="font-display text-[11px] uppercase tracking-[0.4em] text-[rgb(var(--studios-accent))]">
                  Game Producer
                </p>
              </div>
              <h2 className="font-display mt-3 text-3xl text-[rgb(var(--studios-text))] md:text-5xl">
                Help build the game.
              </h2>
              <p className="font-editorial mt-3 text-base text-[rgb(var(--studios-text-muted))]">
                The companion game lives in the same world as the series.
                Producers get on the credits, ship with the alpha, and the
                first copy lands free.
              </p>
            </div>

            <article className="flex flex-col gap-6 rounded-2xl border border-[rgb(var(--studios-accent))]/40 bg-[rgb(var(--studios-surface))] p-7 md:p-9">
              <div className="flex items-baseline gap-3">
                <p className="font-display text-5xl text-[rgb(var(--studios-accent))]">
                  $100+
                </p>
                <p className="font-display text-[11px] uppercase tracking-[0.28em] text-[rgb(var(--studios-text-muted))]">
                  Open tier
                </p>
              </div>
              <ul className="space-y-3">
                {GAME_INCLUSIONS.map((line) => (
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
              <Button
                asChild
                className="font-display h-12 rounded-full bg-[rgb(var(--studios-accent))] text-xs uppercase tracking-[0.25em] text-[rgb(11,11,13)] hover:bg-[rgb(var(--studios-accent-hi))]"
              >
                {/* TODO(brett-miller): swap for live Stripe checkout once accounts are connected. */}
                <Link href="#checkout-coming-soon">
                  Help Build the Game
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </Button>
            </article>

            <div className="rounded-2xl border border-[rgb(var(--studios-border))]/70 bg-[rgb(var(--studios-surface))]/60 p-6 md:p-8">
              <StudiosFundingProgress
                current={env.NEXT_PUBLIC_STUDIOS_FUNDING_GAME_CURRENT}
                target={env.NEXT_PUBLIC_STUDIOS_FUNDING_GAME_TARGET}
                label="Game funding"
                tone="ember"
              />
              <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                {GAME_MILESTONES.map((milestone) => (
                  <div
                    key={milestone}
                    className="rounded-lg border border-[rgb(var(--studios-border))]/60 bg-[rgb(var(--studios-bg))]/70 px-2 py-3"
                  >
                    <p className="font-display text-sm text-[rgb(var(--studios-text))]">
                      {milestone}
                    </p>
                    <p className="font-display text-[9px] uppercase tracking-[0.3em] text-[rgb(var(--studios-text-muted))]">
                      Milestone
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section
        id="checkout-coming-soon"
        className="border-t border-[rgb(var(--studios-border))]/40 bg-[rgb(var(--studios-bg))] py-20 md:py-24"
      >
        <div className="mx-auto w-full max-w-4xl px-5 md:px-8">
          <div className="rounded-2xl border border-dashed border-[rgb(var(--studios-border))]/70 bg-[rgb(var(--studios-surface))]/40 p-8 text-center md:p-12">
            <p className="font-display text-[11px] uppercase tracking-[0.4em] text-[rgb(var(--studios-accent))]">
              Checkout coming soon
            </p>
            <h3 className="font-display mt-3 text-2xl text-[rgb(var(--studios-text))] md:text-3xl">
              Stripe checkout opens in Phase 3.
            </h3>
            <p className="font-editorial mt-3 text-sm text-[rgb(var(--studios-text-muted))]">
              We are finalizing the producer agreement and the payment
              account. Drop your email on the landing page to get the link
              the moment it goes live.
            </p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button
                asChild
                variant="outline"
                className="font-display h-11 rounded-full border-[rgb(var(--studios-accent))]/60 bg-transparent text-xs uppercase tracking-[0.25em] text-[rgb(var(--studios-text))] hover:bg-[rgb(var(--studios-accent))]/10"
              >
                <Link href="/studios">Back to the landing page</Link>
              </Button>
              <StudiosExecutiveInquiryModal
                triggerLabel="Talk to the Bretts"
                triggerClassName="font-display h-11 rounded-full bg-[rgb(var(--studios-accent))] px-6 text-xs uppercase tracking-[0.25em] text-[rgb(11,11,13)] hover:bg-[rgb(var(--studios-accent-hi))]"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
