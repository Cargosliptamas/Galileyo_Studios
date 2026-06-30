import Link from "next/link";
import { Check } from "lucide-react";

import { cn } from "@galileyo/ui";
import { Button } from "@galileyo/ui/button";

import { env } from "~/env/client";
import { StudiosExecutiveInquiryModal } from "./studios-executive-inquiry-modal";
import { StudiosFundingProgress } from "./studios-funding-progress";

interface Tier {
  id: "associate" | "contributing" | "executive";
  label: string;
  price: string;
  priceNote?: string;
  inclusions: string[];
  cta:
    | { kind: "link"; href: string; label: string }
    | { kind: "modal"; label: string };
  highlight?: boolean;
}

const TIERS: Tier[] = [
  {
    id: "associate",
    label: "Associate Producer",
    price: "$50",
    inclusions: [
      "Name in the end credits of one episode",
      "Digital download of all 7 episodes",
      "Signed digital poster",
    ],
    cta: {
      kind: "link",
      href: "/pricing#associate",
      label: "Back this tier",
    },
  },
  {
    id: "contributing",
    label: "Contributing Producer",
    price: "$200",
    inclusions: [
      "Everything in Associate",
      "Physical signed poster",
      "Exclusive community access",
      "Behind-the-scenes feature-length cut",
    ],
    cta: {
      kind: "link",
      href: "/pricing#contributing",
      label: "Back this tier",
    },
    highlight: true,
  },
  {
    id: "executive",
    label: "Executive Producer",
    price: "$250K",
    priceNote: "7 slots only",
    inclusions: [
      "Everything in Contributing",
      "On-set visit and dinner with Brett Miller",
      "Executive Producer screen credit",
      "Equity-style upside per producer agreement",
    ],
    cta: { kind: "modal", label: "Schedule a Call" },
  },
];

export function StudiosProducerTiersPreview() {
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
              Become a Producer
            </p>
            <h2 className="font-display mt-3 text-4xl text-[rgb(var(--studios-text))] md:text-6xl">
              Fund the films.
              <br />
              Get the credit.
            </h2>
          </div>
          <p className="font-editorial max-w-md text-base text-[rgb(var(--studios-text-muted))] md:text-lg">
            Three ways to take ownership of the next six episodes. Every tier
            puts your name in the credits and your money where the cameras are.
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-3">
          {TIERS.map((tier) => (
            <article
              key={tier.id}
              className={cn(
                "relative flex h-full flex-col rounded-2xl border p-7 transition-all duration-300 ease-out",
                tier.highlight
                  ? "z-10 border-[rgb(var(--studios-accent))]/70 bg-[linear-gradient(180deg,rgb(var(--studios-accent)/0.12)_0%,rgb(var(--studios-surface-hi))_30%,rgb(var(--studios-surface))_100%)] shadow-[inset_0_1px_0_rgb(var(--studios-text)/0.06),0_30px_70px_-30px_rgb(var(--studios-accent)/0.5)] ring-1 ring-[rgb(var(--studios-accent)/0.25)] hover:-translate-y-1.5 md:-translate-y-4 md:hover:-translate-y-6"
                  : "border-[rgb(var(--studios-border))]/70 bg-[linear-gradient(180deg,rgb(var(--studios-surface-hi))_0%,rgb(var(--studios-surface))_100%)] shadow-[inset_0_1px_0_rgb(var(--studios-text)/0.06)] hover:-translate-y-1.5 hover:border-[rgb(var(--studios-accent))]/50 hover:shadow-[inset_0_1px_0_rgb(var(--studios-text)/0.06),0_24px_60px_-30px_rgb(var(--studios-accent)/0.35)]",
              )}
            >
              {tier.highlight ? (
                <span className="font-display absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[rgb(var(--studios-accent))] px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-[rgb(var(--studios-bg))] shadow-[0_8px_24px_-8px_rgb(var(--studios-accent)/0.7)]">
                  Most popular
                </span>
              ) : null}
              <h3 className="font-display text-2xl text-[rgb(var(--studios-text))]">
                {tier.label}
              </h3>
              <div className="mt-3 flex items-baseline gap-2">
                <p className="font-display text-5xl text-[rgb(var(--studios-accent))]">
                  {tier.price}
                </p>
                {tier.priceNote ? (
                  <p className="font-display text-xs uppercase tracking-[0.28em] text-[rgb(var(--studios-text-muted))]">
                    {tier.priceNote}
                  </p>
                ) : null}
              </div>

              <ul className="mt-6 space-y-3">
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

              <div className="mt-8 pt-2">
                {tier.cta.kind === "modal" ? (
                  <StudiosExecutiveInquiryModal
                    triggerLabel={tier.cta.label}
                    triggerClassName="font-display h-12 w-full rounded-full bg-[rgb(var(--studios-accent))] text-xs uppercase tracking-[0.25em] text-[rgb(var(--studios-bg))] hover:bg-[rgb(var(--studios-accent-hi))]"
                  />
                ) : (
                  <Button
                    asChild
                    className={cn(
                      "font-display h-12 w-full rounded-full text-xs uppercase tracking-[0.25em]",
                      tier.highlight
                        ? "bg-[rgb(var(--studios-accent))] text-[rgb(var(--studios-bg))] hover:bg-[rgb(var(--studios-accent-hi))]"
                        : "border border-[rgb(var(--studios-accent))]/70 bg-transparent text-[rgb(var(--studios-text))] hover:bg-[rgb(var(--studios-accent))]/10",
                    )}
                  >
                    <Link href={tier.cta.href}>{tier.cta.label}</Link>
                  </Button>
                )}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-[rgb(var(--studios-border))]/70 bg-[linear-gradient(180deg,rgb(var(--studios-surface-hi)/0.6)_0%,rgb(var(--studios-surface)/0.6)_100%)] p-6 shadow-[inset_0_1px_0_rgb(var(--studios-text)/0.05)] md:p-10">
          <StudiosFundingProgress
            current={env.NEXT_PUBLIC_STUDIOS_FUNDING_FILM_CURRENT}
            target={env.NEXT_PUBLIC_STUDIOS_FUNDING_FILM_TARGET}
            label="Film series funding"
          />
        </div>
      </div>
    </section>
  );
}
