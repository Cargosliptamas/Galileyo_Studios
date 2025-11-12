import Image from "next/image";
import Link from "next/link";

import { Button } from "@galileyo/ui/button";
import { ThemeToggle } from "@galileyo/ui/theme";

import { getStatus } from "~/trpc/server";
import { AppIcon } from "./app-icon";

export async function SiteFooter() {
  const status = await getStatus();

  return (
    <footer className="border-b border-slate-200 bg-white/95 px-4 backdrop-blur-sm transition-colors dark:border-slate-800 dark:bg-slate-950/95 md:px-6">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Footer Links */}
        <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <Link href="/">
              <AppIcon />
            </Link>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-slate-900 dark:text-white">
              Product
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/#features"
                  className="text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="/#pricing"
                  className="text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-slate-900 dark:text-white">
              Resources
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  Do you have something to share with our audience?
                </a>
              </li>
              {/* <li>
                <Link
                  href="/blog"
                  className="text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  Blog
                </Link>
              </li> */}
              <li>
                <a
                  href="https://galileyo.instatus.com"
                  target="_blank"
                  className="text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  System Status
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-slate-900 dark:text-white">
              Support
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/contact"
                  className="text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  Contact Us
                </Link>
              </li>
              {/* <li>
                <Link
                  href="/help-center"
                  className="text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  Help Center
                </Link>
              </li> */}
              <li>
                <Link
                  href="/terms-of-service"
                  className="text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy-policy"
                  className="text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          <a
            href="https://apps.apple.com/us/app/galileyo-account-app/id6475311208"
            target="_blank"
            className="max-w-52"
          >
            <Image
              src="/app_store_badge.svg"
              alt="Galileyo"
              width={300}
              height={200}
              className="object-cover"
            />
          </a>
          <a
            href="https://play.google.com/store/apps/details?id=com.alwaysreachable.app"
            target="_blank"
            className="max-w-52"
          >
            <Image
              src="/google_play_badge.png"
              alt="Galileyo"
              width={500}
              height={500}
              className="h-full w-full object-cover"
            />
          </a>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between border-t border-slate-200 pt-8 dark:border-slate-800 sm:flex-row">
          <p className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} Galileyo. All rights reserved.
            <ThemeToggle />
          </p>
          <div className="mt-4 flex items-center gap-4 sm:mt-0">
            {status !== null && (
              <Button
                variant="ghost"
                className="flex items-center gap-1"
                asChild
              >
                <Link href={status.url} target="_blank">
                  <div
                    className={`h-2 w-2 animate-pulse rounded-full ${status.status === "UP" ? "bg-green-400" : status.status === "HASISSUES" ? "bg-yellow-400" : "bg-red-400"}`}
                  ></div>
                  <span className="text-sm text-green-400">
                    {status.status === "UP"
                      ? "All systems operational"
                      : status.status === "HASISSUES"
                        ? "Some systems are experiencing issues"
                        : "Some systems are under maintenance"}
                  </span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
