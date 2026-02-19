import Link from "next/link";
import { ArrowRight, Handshake } from "lucide-react";

import { cn } from "@galileyo/ui";
import { buttonVariants } from "@galileyo/ui/button";

import { getPartners } from "~/lib/server/partners";
import { PartnersGrid } from "./partners-grid";

export async function PartnersPage() {
  const { list: partners } = await getPartners({
    page: 1,
    pageSize: 100,
    revalidate: 300,
  });

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 py-20 dark:border-slate-800">
        <div className="pointer-events-none absolute -left-20 top-16 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-8 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-200">
            <Handshake className="h-4 w-4" />
            Trusted Network
          </div>
          <h1 className="mt-6 max-w-3xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
            Galileyo Featured Partners
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-200">
            Meet organizations that strengthen communication, preparedness, and
            resilience across our ecosystem.
          </p>
          <div className="mt-8">
            <Link
              href="/sign-up"
              className={cn(buttonVariants({ variant: "primary" }))}
            >
              Join Galileyo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Partner Directory
            </h2>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              Select a partner to view details and open their official website.
            </p>
          </div>

          <PartnersGrid partners={partners} />
        </div>
      </section>
    </div>
  );
}
