import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Gift } from "lucide-react";

import { BACKPACK_GIVEAWAY_CAMPAIGN } from "~/lib/promo-campaigns";

export default function BackpackGiveawayPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <section className="relative overflow-hidden border-b border-slate-800/80">
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-slate-950" />
        <div className="absolute -left-24 top-0 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-orange-500/15 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-cyan-200">
            <Gift className="h-4 w-4" />
            2026 Giveaway
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.25fr_1fr] lg:gap-12">
            <div className="space-y-5">
              <h1 className="text-4xl font-black leading-tight text-white sm:text-5xl">
                Sign Up Now and Get Entered to Win
              </h1>
              <p className="max-w-2xl text-lg text-slate-300">
                Join Galileyo for a chance to win a Ballistic Backpack bundle
                with Faraday signal-blocking gear. The estimated retail value is
                over $200.
              </p>
              {/* <p className="inline-flex items-center rounded-md border border-cyan-500/40 bg-cyan-500/10 px-3 py-1.5 text-sm font-medium text-cyan-200">
                Giveaway closes {BACKPACK_GIVEAWAY_CAMPAIGN.endDateDisplay}
              </p> */}
              <div>
                <Link
                  href={BACKPACK_GIVEAWAY_CAMPAIGN.signUpHref}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  Sign Up and Enter Giveaway
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900/70 shadow-2xl shadow-black/30">
              <Image
                src={BACKPACK_GIVEAWAY_CAMPAIGN.heroImagePath}
                alt="Backpack giveaway promotion artwork"
                width={641}
                height={389}
                priority
                className="h-auto w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
