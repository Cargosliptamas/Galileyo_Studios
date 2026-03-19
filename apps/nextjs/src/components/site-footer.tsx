"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Smartphone } from "lucide-react";

import { Button } from "@galileyo/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@galileyo/ui/dialog";
import { ThemeToggle } from "@galileyo/ui/theme";

import { AppIcon } from "./app-icon";
import { useNativeBridge } from "./layout/native-app-bridge";
import {
  NATIVE_APP_DOWNLOAD_DESCRIPTION,
  NATIVE_APP_DOWNLOAD_TITLE,
  NativeAppDownloadOptions,
} from "./public-site/native-app-download-options";
import { SiteStatus } from "./site-status";

const DISABLED_PATHS = [
  "/chat",
  "/dashboard",
  "/studio",
  "/videos",
  "/feature-showcase",
];

export function SiteFooter() {
  const pathname = usePathname();
  const { isRunningInNativeApp } = useNativeBridge();
  const [isNativeAppDialogOpen, setIsNativeAppDialogOpen] = useState(false);

  const isDisabled = DISABLED_PATHS.some((path) => pathname.includes(path));

  if (isDisabled || isRunningInNativeApp) {
    return null;
  }

  return (
    <footer className="border-b border-slate-200 bg-card/95 px-4 backdrop-blur-sm transition-colors dark:border-slate-800 dark:bg-slate-950/95 md:px-6">
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

        <div className="flex flex-col items-center justify-center gap-3">
          <Dialog
            open={isNativeAppDialogOpen}
            onOpenChange={setIsNativeAppDialogOpen}
          >
            <DialogTrigger asChild>
              <Button size="lg" className="min-w-52 rounded-xl px-6">
                <Smartphone className="mr-2 h-4 w-4" />
                Download Mobile App
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{NATIVE_APP_DOWNLOAD_TITLE}</DialogTitle>
                <DialogDescription>
                  {NATIVE_APP_DOWNLOAD_DESCRIPTION}
                </DialogDescription>
              </DialogHeader>
              <NativeAppDownloadOptions showDedicatedPageLink />
            </DialogContent>
          </Dialog>
          <p className="text-center text-xs text-slate-500 dark:text-slate-400">
            iOS, Google Play, and direct Android APK options available.
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between border-t border-slate-200 pt-8 dark:border-slate-800 sm:flex-row">
          <p className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} Galileyo. All rights reserved.
            <ThemeToggle />
          </p>
          <div className="mt-4 flex items-center gap-4 sm:mt-0">
            <SiteStatus />
          </div>
        </div>
      </div>
    </footer>
  );
}
