import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";

import { AFFILIATE_OFFERS } from "~/lib/studios/partners";

export function StudiosAffiliateTeaser() {
  return (
    <section className="border-t border-[rgb(var(--studios-border))]/40 bg-[rgb(var(--studios-bg))] py-24 md:py-32">
      <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-display text-xs uppercase tracking-[0.4em] text-[rgb(var(--studios-accent))]">
              Partner Deals
            </p>
            <h2 className="font-display mt-3 text-4xl text-[rgb(var(--studios-text))] md:text-5xl">
              Gear you actually use.
              <br />
              Discounts you actually keep.
            </h2>
          </div>
          <p className="font-editorial max-w-md text-base text-[rgb(var(--studios-text-muted))] md:text-lg">
            Brands the Studios universe runs on. Watch the films, take the
            discount, support the next episode at the same time.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {AFFILIATE_OFFERS.map((offer) => (
            <a
              key={offer.id}
              href={offer.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex h-full flex-col rounded-2xl border border-[rgb(var(--studios-border))]/70 bg-[rgb(var(--studios-surface))]/70 p-7 transition-all duration-300 hover:-translate-y-1 hover:border-[rgb(var(--studios-accent))]/60 hover:shadow-[0_25px_60px_-30px_rgba(200,160,74,0.45)]"
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
              <h3 className="font-display mt-6 text-2xl text-[rgb(var(--studios-text))]">
                {offer.name}
              </h3>
              <p className="font-display mt-4 text-3xl text-[rgb(var(--studios-accent))]">
                {offer.discountLine}
              </p>
              <p className="font-editorial mt-4 text-sm leading-relaxed text-[rgb(var(--studios-text-muted))]">
                {offer.description}
              </p>
              <span className="font-display mt-auto pt-6 text-xs uppercase tracking-[0.3em] text-[rgb(var(--studios-accent-hi))]">
                Open the offer →
              </span>
            </a>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Link
            href="/studios/affiliates"
            className="font-display inline-flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-[rgb(var(--studios-accent))] transition-colors hover:text-[rgb(var(--studios-accent-hi))]"
          >
            See all partner deals
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
