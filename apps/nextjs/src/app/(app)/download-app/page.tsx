import Link from "next/link";
import { BadgeCheck, LifeBuoy, ShieldCheck } from "lucide-react";

import { buttonVariants } from "@galileyo/ui/button";

import {
  NATIVE_APP_DOWNLOAD_DESCRIPTION,
  NATIVE_APP_DOWNLOAD_TITLE,
  NativeAppDownloadOptions,
} from "~/components/public-site/native-app-download-options";

export default function DownloadAppPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(14,165,233,0.18),transparent_32%),radial-gradient(circle_at_92%_20%,rgba(8,145,178,0.2),transparent_34%),radial-gradient(circle_at_50%_95%,rgba(15,23,42,0.12),transparent_45%)] dark:bg-[radial-gradient(circle_at_12%_8%,rgba(34,211,238,0.14),transparent_34%),radial-gradient(circle_at_92%_20%,rgba(56,189,248,0.15),transparent_36%),radial-gradient(circle_at_50%_95%,rgba(15,23,42,0.55),transparent_45%)]" />

      <section className="relative border-b border-slate-200/70 py-20 dark:border-slate-800/70">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-700 dark:text-cyan-200">
            <BadgeCheck className="h-4 w-4" />
            Official download channels
          </div>

          <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
            {NATIVE_APP_DOWNLOAD_TITLE}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-slate-600 dark:text-slate-300 sm:text-xl">
            {NATIVE_APP_DOWNLOAD_DESCRIPTION}
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white/85 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/75">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Secure Destinations
              </p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Every button points to verified store or first-party download
                endpoints.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white/85 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/75">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Multiple Install Paths
              </p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Choose managed stores or direct APK delivery based on your
                device policy.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white/85 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/75 sm:col-span-2 lg:col-span-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Open in New Tab
              </p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Downloads open separately so you can return to Galileyo without
                losing context.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
              Select Your Platform
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-slate-600 dark:text-slate-300">
              Pick the distribution method that matches your operating system
              and install policy.
            </p>
          </div>
          <NativeAppDownloadOptions mode="detailed" />
        </div>
      </section>

      <section className="relative pb-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Installation Support
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Need help with install or device compatibility?
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  Our support team can help with account setup, app access, and
                  platform-specific installation questions.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:min-w-52">
                <Link
                  href="/contact"
                  className={buttonVariants({ variant: "primary" })}
                >
                  <LifeBuoy className="mr-2 h-4 w-4" />
                  Contact Support
                </Link>
                <Link
                  href="/faq"
                  className={buttonVariants({ variant: "outline" })}
                >
                  Browse FAQ
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
