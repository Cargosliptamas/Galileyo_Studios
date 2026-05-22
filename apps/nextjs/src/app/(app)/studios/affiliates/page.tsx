import type { Metadata } from "next";
import { ExternalLink, Sparkles } from "lucide-react";

import { cn } from "@galileyo/ui";

import { StudiosSponsorInquiryForm } from "~/components/studios/studios-sponsor-inquiry-form";
import { AFFILIATE_OFFERS } from "~/lib/studios/partners";

export const metadata: Metadata = {
  title: "Affiliates",
  description:
    "Exclusive deals from the brands Galileyo Studios runs on. Backpacks, comms, coffee, spirits, the rest.",
};

export default function AffiliatesPage() {
  const featured = AFFILIATE_OFFERS.filter((offer) => offer.featured);
  const rest = AFFILIATE_OFFERS.filter((offer) => !offer.featured);

  return (
    <>
      <section className="relative isolate overflow-hidden">
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-br from-emerald-500/20 via-zinc-900 to-zinc-950"
          aria-hidden
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(11,11,13,0.4)_0%,rgba(11,11,13,0.92)_85%,rgb(11,11,13)_100%)]" />
        <div className="mx-auto flex min-h-[55vh] w-full max-w-6xl flex-col justify-end px-5 py-20 md:px-8 md:py-28">
          <p className="font-display text-xs uppercase tracking-[0.4em] text-[rgb(var(--studios-accent))]">
            Partner Deals
          </p>
          <h1 className="font-display mt-4 text-[clamp(2.25rem,9vw,3.5rem)] leading-[1.05] text-[rgb(var(--studios-text))] md:text-7xl">
            Exclusive deals from
            <br />
            the brands we trust.
          </h1>
          <p className="font-editorial mt-6 max-w-2xl text-lg text-[rgb(var(--studios-text-muted))] md:text-xl">
            Gear, comms, coffee, and a couple things we wish existed before we
            had them. Each link is a real discount, tracked back to Studios, and
            every dollar funds the next episode.
          </p>
        </div>
      </section>

      <section className="border-t border-[rgb(var(--studios-border))]/40 bg-[rgb(var(--studios-bg))] py-20 md:py-28">
        <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
          <div className="mb-10 flex items-center gap-3">
            <Sparkles
              className="size-5 text-[rgb(var(--studios-accent))]"
              aria-hidden
            />
            <p className="font-display text-[11px] uppercase tracking-[0.4em] text-[rgb(var(--studios-accent))]">
              Featured offers
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {featured.map((offer) => (
              <OfferCard key={offer.id} offer={offer} featured />
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[rgb(var(--studios-border))]/40 bg-[rgb(var(--studios-bg))] py-20 md:py-28">
        <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
          <div className="mb-10">
            <p className="font-display text-[11px] uppercase tracking-[0.4em] text-[rgb(var(--studios-accent))]">
              All partners
            </p>
            <h2 className="font-display mt-3 text-3xl text-[rgb(var(--studios-text))] md:text-5xl">
              The whole list.
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        </div>
      </section>

      <section
        id="become-affiliate"
        className="border-t border-[rgb(var(--studios-border))]/40 bg-[rgb(var(--studios-bg))] py-20 md:py-28"
      >
        <div className="mx-auto w-full max-w-4xl px-5 md:px-8">
          <div className="mb-8 max-w-2xl">
            <p className="font-display text-[11px] uppercase tracking-[0.4em] text-[rgb(var(--studios-accent))]">
              Want in?
            </p>
            <h2 className="font-display mt-3 text-3xl text-[rgb(var(--studios-text))] md:text-5xl">
              Become an affiliate.
            </h2>
            <p className="font-editorial mt-3 text-base text-[rgb(var(--studios-text-muted))]">
              If your product fits the audience and you can offer a real
              discount, send us the details and we will follow up with the
              tracking spec and revenue share.
            </p>
          </div>

          <StudiosSponsorInquiryForm
            variant="compact"
            defaultInterest="affiliate"
            title="Pitch your brand."
            description="Quick form. We respond within two business days with terms."
          />
        </div>
      </section>
    </>
  );
}

function OfferCard({
  offer,
  featured = false,
}: {
  offer: (typeof AFFILIATE_OFFERS)[number];
  featured?: boolean;
}) {
  return (
    <a
      href={offer.href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={cn(
        "group flex h-full flex-col rounded-2xl border bg-[rgb(var(--studios-surface))]/70 p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_25px_60px_-30px_rgba(200,160,74,0.45)]",
        featured
          ? "border-[rgb(var(--studios-accent))]/60 md:p-9"
          : "border-[rgb(var(--studios-border))]/70 hover:border-[rgb(var(--studios-accent))]/60",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-display text-[11px] uppercase tracking-[0.3em] text-[rgb(var(--studios-text-muted))]">
          {offer.category}
        </span>
        <ExternalLink
          className="size-4 text-[rgb(var(--studios-text-muted))] transition-colors group-hover:text-[rgb(var(--studios-accent))]"
          aria-hidden
        />
      </div>
      <h3
        className={cn(
          "font-display mt-6 text-[rgb(var(--studios-text))]",
          featured ? "text-3xl md:text-4xl" : "text-2xl",
        )}
      >
        {offer.name}
      </h3>
      <p
        className={cn(
          "font-display mt-4 text-[rgb(var(--studios-accent))]",
          featured ? "text-4xl md:text-5xl" : "text-3xl",
        )}
      >
        {offer.discountLine}
      </p>
      <p className="font-editorial mt-4 text-sm leading-relaxed text-[rgb(var(--studios-text-muted))]">
        {offer.description}
      </p>
      <span className="font-display mt-auto pt-6 text-xs uppercase tracking-[0.3em] text-[rgb(var(--studios-accent-hi))]">
        Open the offer →
      </span>
    </a>
  );
}
