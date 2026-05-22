import type { Metadata } from "next";
import {
  ArrowRight,
  Crown,
  Download,
  MessageSquare,
  Mic,
  PanelTopOpen,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

import { cn } from "@galileyo/ui";
import { Button } from "@galileyo/ui/button";

import { StudiosSponsorInquiryForm } from "~/components/studios/studios-sponsor-inquiry-form";
import { SPONSORS } from "~/lib/studios/partners";

export const metadata: Metadata = {
  title: "Sponsors",
  description:
    "Reach the people the rest of media can't. Sponsor inventory, audience demographics, and a media kit for Galileyo Studios.",
};

const AUDIENCE_STATS: { label: string; value: string; detail: string }[] = [
  // TODO(brett-miller): replace with confirmed audience numbers once analytics ramp up.
  {
    label: "Email list",
    value: "120K+",
    detail: "Galileyo platform subscribers",
  },
  {
    label: "Episode 1 target",
    value: "5M views",
    detail: "Trailer + episode combined",
  },
  { label: "US viewership", value: "78%", detail: "Domestic core audience" },
  {
    label: "Faith + freedom buyer",
    value: "62%",
    detail: "Self-identified, high intent",
  },
];

interface InventoryTile {
  icon: typeof ShoppingBag;
  title: string;
  blurb: string;
  starting?: string;
}

const INVENTORY: InventoryTile[] = [
  {
    icon: ShoppingBag,
    title: "Product placement",
    blurb:
      "On-screen product integration across the series. The hero uses it, the camera shows it.",
    starting: "From $25K",
  },
  {
    icon: PanelTopOpen,
    title: "End-card sponsorship",
    blurb:
      "Branded close-out card on every episode and the trailer. First and last impression.",
    starting: "From $15K",
  },
  {
    icon: Crown,
    title: "Title sponsor",
    blurb:
      "Series-wide co-presented branding. Logo on the main title card, the marketing, and the site.",
    starting: "From $250K",
  },
  {
    icon: Sparkles,
    title: "Affiliate marketplace",
    blurb:
      "Discount-driven affiliate listing on the partner page. Performance-based, link tracked.",
    starting: "Rev-share",
  },
  {
    icon: Mic,
    title: "Podcast ad-read",
    blurb:
      "Host-read ads on the companion podcast and the behind-the-scenes feed.",
    starting: "From $7.5K",
  },
  {
    icon: MessageSquare,
    title: "Banner inventory",
    blurb:
      "Site banner placement on Studios pages outside the player. Strong below-the-fold real estate.",
    starting: "From $5K",
  },
];

export default function SponsorsPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden">
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-br from-rose-500/25 via-zinc-900 to-zinc-950"
          aria-hidden
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(11,11,13,0.4)_0%,rgba(11,11,13,0.92)_85%,rgb(11,11,13)_100%)]" />
        <div className="mx-auto flex min-h-[55vh] w-full max-w-6xl flex-col justify-end px-5 py-20 md:px-8 md:py-28">
          <p className="font-display text-xs uppercase tracking-[0.4em] text-[rgb(var(--studios-accent))]">
            Sponsors
          </p>
          <h1 className="font-display mt-4 text-[clamp(2.25rem,9vw,3.5rem)] leading-[1.05] text-[rgb(var(--studios-text))] md:text-7xl">
            Reach the people
            <br />
            the rest of media can&apos;t.
          </h1>
          <p className="font-editorial mt-6 max-w-2xl text-lg text-[rgb(var(--studios-text-muted))] md:text-xl">
            Seven episodes. A companion game. A built-in audience that already
            tunes in for the message. Sponsor the show and your brand sits
            inside the story, not next to it.
          </p>
        </div>
      </section>

      <section className="border-t border-[rgb(var(--studios-border))]/40 bg-[rgb(var(--studios-bg))] py-20 md:py-28">
        <div className="mx-auto w-full max-w-6xl px-5 md:px-8">
          <div className="mb-10 max-w-2xl">
            <p className="font-display text-[11px] uppercase tracking-[0.4em] text-[rgb(var(--studios-accent))]">
              The audience
            </p>
            <h2 className="font-display mt-3 text-3xl text-[rgb(var(--studios-text))] md:text-5xl">
              Who watches Studios.
            </h2>
            <p className="font-editorial mt-3 text-base text-[rgb(var(--studios-text-muted))]">
              Numbers below are launch targets and platform-wide baselines. Full
              third-party demographic report ships with the media kit.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
            {AUDIENCE_STATS.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-[rgb(var(--studios-border))]/70 bg-[rgb(var(--studios-surface))]/70 p-5 md:p-6"
              >
                <p className="font-display text-[10px] uppercase tracking-[0.3em] text-[rgb(var(--studios-text-muted))]">
                  {stat.label}
                </p>
                <p className="font-display mt-3 text-3xl text-[rgb(var(--studios-accent))] md:text-4xl">
                  {stat.value}
                </p>
                <p className="font-editorial mt-2 text-xs text-[rgb(var(--studios-text-muted))]">
                  {stat.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[rgb(var(--studios-border))]/40 bg-[rgb(var(--studios-bg))] py-20 md:py-28">
        <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
          <div className="mb-10 max-w-2xl">
            <p className="font-display text-[11px] uppercase tracking-[0.4em] text-[rgb(var(--studios-accent))]">
              Inventory
            </p>
            <h2 className="font-display mt-3 text-3xl text-[rgb(var(--studios-text))] md:text-5xl">
              Six ways to show up.
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {INVENTORY.map((tile) => {
              const Icon = tile.icon;
              return (
                <article
                  key={tile.title}
                  className="flex flex-col gap-4 rounded-2xl border border-[rgb(var(--studios-border))]/70 bg-[rgb(var(--studios-surface))]/70 p-6 md:p-7"
                >
                  <span className="flex size-11 items-center justify-center rounded-full bg-[rgb(var(--studios-accent))]/15 text-[rgb(var(--studios-accent))]">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <div>
                    <h3 className="font-display text-xl text-[rgb(var(--studios-text))]">
                      {tile.title}
                    </h3>
                    {tile.starting ? (
                      <p className="font-display mt-1 text-[11px] uppercase tracking-[0.28em] text-[rgb(var(--studios-accent))]">
                        {tile.starting}
                      </p>
                    ) : null}
                  </div>
                  <p className="font-editorial text-sm leading-relaxed text-[rgb(var(--studios-text-muted))]">
                    {tile.blurb}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-[rgb(var(--studios-border))]/40 bg-[rgb(var(--studios-bg))] py-20 md:py-28">
        <div className="mx-auto w-full max-w-6xl px-5 md:px-8">
          <div className="mb-10 max-w-2xl">
            <p className="font-display text-[11px] uppercase tracking-[0.4em] text-[rgb(var(--studios-accent))]">
              Already onboard
            </p>
            <h2 className="font-display mt-3 text-3xl text-[rgb(var(--studios-text))] md:text-5xl">
              Brands shipping with us.
            </h2>
            <p className="font-editorial mt-3 text-base text-[rgb(var(--studios-text-muted))]">
              {/* TODO(brett-miller): confirm with each brand before adding logos. */}
              Confirmed partners below. Logo assets land once each contract
              closes.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6 md:gap-4">
            {SPONSORS.map((sponsor) => {
              const isPlaceholder = sponsor.status === "placeholder";
              return (
                <div
                  key={sponsor.id}
                  className={cn(
                    "flex h-24 items-center justify-center rounded-xl border bg-[rgb(var(--studios-surface))]/40 px-4 text-center",
                    isPlaceholder
                      ? "border-dashed border-[rgb(var(--studios-border))]/60 text-[rgb(var(--studios-text-muted))]/50"
                      : "border-[rgb(var(--studios-border))]/60 text-[rgb(var(--studios-text-muted))]",
                  )}
                >
                  <span className="font-display text-base uppercase tracking-[0.22em]">
                    {sponsor.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-[rgb(var(--studios-border))]/40 bg-[rgb(var(--studios-bg))] py-20 md:py-28">
        <div className="mx-auto w-full max-w-5xl px-5 md:px-8">
          <div className="grid gap-6 rounded-3xl border border-[rgb(var(--studios-accent))]/40 bg-[rgb(var(--studios-surface))] p-8 md:grid-cols-[1.4fr_1fr] md:p-12">
            <div>
              <p className="font-display text-[11px] uppercase tracking-[0.4em] text-[rgb(var(--studios-accent))]">
                Media kit
              </p>
              <h3 className="font-display mt-3 text-3xl text-[rgb(var(--studios-text))] md:text-4xl">
                Full deck, audience report, and rate card.
              </h3>
              <p className="font-editorial mt-3 text-base text-[rgb(var(--studios-text-muted))]">
                {/* TODO(brett-miller): swap the placeholder PDF in /public for the production media kit before launch. */}
                Includes inventory specs, episode synopses, audience profile,
                and pricing. PDF, ten pages.
              </p>
            </div>
            <div className="flex items-center justify-start md:justify-end">
              <Button
                asChild
                className="font-display h-12 rounded-full bg-[rgb(var(--studios-accent))] px-7 text-xs uppercase tracking-[0.25em] text-[rgb(11,11,13)] hover:bg-[rgb(var(--studios-accent-hi))]"
              >
                <a
                  href="/studios/galileyo-studios-media-kit.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                >
                  <Download className="size-4" aria-hidden />
                  Download the kit
                  <ArrowRight className="size-4" aria-hidden />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section
        id="inquiry"
        className="border-t border-[rgb(var(--studios-border))]/40 bg-[rgb(var(--studios-bg))] py-20 md:py-28"
      >
        <div className="mx-auto w-full max-w-4xl px-5 md:px-8">
          <StudiosSponsorInquiryForm />
        </div>
      </section>
    </>
  );
}
