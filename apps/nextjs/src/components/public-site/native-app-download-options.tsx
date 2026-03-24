import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { Apple, ArrowUpRight, Download, Play } from "lucide-react";

import { cn } from "@galileyo/ui";
import { buttonVariants } from "@galileyo/ui/button";

export const NATIVE_APP_DOWNLOAD_TITLE = "Download Galileyo for Mobile";
export const NATIVE_APP_DOWNLOAD_DESCRIPTION =
  "Choose your platform and install from official Galileyo distribution channels.";

interface NativeAppDownloadLink {
  id: string;
  label: string;
  href: string;
  description: string;
  ctaLabel: string;
  platformHint: string;
  delivery: string;
  icon: LucideIcon;
  iconClassName: string;
}

export const NATIVE_APP_DOWNLOAD_LINKS: NativeAppDownloadLink[] = [
  {
    id: "google-play",
    label: "Google Play Store",
    href: "https://play.google.com/store/apps/details?id=com.galileyo.android",
    description: "Install through Google Play.",
    ctaLabel: "Open Play Store",
    platformHint: "Managed updates",
    delivery: "Best for most Android devices.",
    icon: Play,
    iconClassName: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
  },
  {
    id: "apple-store",
    label: "Apple App Store",
    href: "https://apps.apple.com/us/app/galileyo-account-app/id6475311208",
    description: "Install through the Apple App Store.",
    ctaLabel: "Open Apple Store",
    platformHint: "Official iOS",
    delivery: "For iPhone and iPad.",
    icon: Apple,
    iconClassName: "bg-slate-900/10 text-slate-800 dark:text-slate-100",
  },
  {
    id: "de-googled-apk",
    label: "Android APK (De-googled)",
    href: "https://galileyo.com/api/uploads/app/galileyo-android.apk",
    description: "Download the APK directly from Galileyo.",
    ctaLabel: "Download APK",
    platformHint: "Direct binary",
    delivery: "For de-googled Android distributions.",
    icon: Download,
    iconClassName: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-300",
  },
];

export function NativeAppDownloadOptions({
  className,
  showDedicatedPageLink = false,
  mode = "compact",
}: {
  className?: string;
  showDedicatedPageLink?: boolean;
  mode?: "compact" | "detailed";
}) {
  if (mode === "detailed") {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="grid gap-4 md:grid-cols-3">
          {NATIVE_APP_DOWNLOAD_LINKS.map((link) => (
            <article
              key={link.id}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/90 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/80"
            >
              <div className="flex h-full flex-col p-6">
                <div className="mb-5 flex items-start justify-between gap-2">
                  <div
                    className={cn(
                      "inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200/70 dark:border-slate-700",
                      link.iconClassName,
                    )}
                  >
                    <link.icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {link.platformHint}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {link.label}
                </h3>
                <p className="mt-2 min-h-10 text-sm text-slate-600 dark:text-slate-300">
                  {link.description}
                </p>

                <Link
                  href={link.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className={buttonVariants({ variant: "primary" })}
                >
                  <span>{link.ctaLabel}</span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>

                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                  {link.delivery}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid gap-3">
        {NATIVE_APP_DOWNLOAD_LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noreferrer noopener"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-auto w-full flex-col items-start justify-start gap-1 whitespace-normal px-4 py-3 text-left",
            )}
          >
            <span>{link.label}</span>
            <span className="text-xs text-muted-foreground">
              {link.description}
            </span>
          </a>
        ))}
      </div>

      {showDedicatedPageLink ? (
        <div className="text-center">
          <Link
            href="/download-app"
            className="text-sm text-cyan-600 transition-colors hover:text-cyan-500 hover:underline dark:text-cyan-400 dark:hover:text-cyan-300"
          >
            View full download page
          </Link>
        </div>
      ) : null}
    </div>
  );
}
