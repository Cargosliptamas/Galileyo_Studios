"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  // ClockIcon,
  GiftIcon,
  XIcon,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@galileyo/ui/dialog";

export interface PromoTeaserDialogProps {
  endDate: string;
  promoHref?: string;
  storageKey?: string;
  teaserTitle?: string;
  teaserSubtitle?: string;
  dialogTitle?: string;
  dialogDescription?: string;
  deadlineLabel?: string;
  primaryActionLabel?: string;
  dialogImageSrc?: string;
  dialogImageAlt?: string;
  dialogInfoItems?: readonly string[];
}

function isPromoActive(endDate: string) {
  const endTimestamp = new Date(endDate).getTime();
  return Number.isFinite(endTimestamp) && endTimestamp > Date.now();
}

export default function PromoTeaserDialog({
  endDate,
  promoHref = "/backpack-giveaway",
  storageKey = "promo-teaser-backpack-giveaway-2026-dismissed",
  teaserTitle = "Limited-Time Promotion",
  teaserSubtitle = "Tap to view details",
  dialogTitle = "Special Promotion",
  dialogDescription = "Check out our latest promotion and limited-time offer.",
  // deadlineLabel,
  primaryActionLabel = "View Promotion",
  dialogImageSrc,
  dialogImageAlt = "Promotion image",
  dialogInfoItems = [],
}: PromoTeaserDialogProps) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const promoIsActive = useMemo(() => isPromoActive(endDate), [endDate]);

  const dialogSeenKey = `${storageKey}-dialog-seen`;

  useEffect(() => {
    if (!promoIsActive) {
      setIsVisible(false);
      return;
    }

    const isDismissed = sessionStorage.getItem(storageKey) === "1";
    if (isDismissed) {
      setIsVisible(false);
      return;
    }

    setIsVisible(true);

    const dialogSeen = localStorage.getItem(dialogSeenKey) === "1";
    if (!dialogSeen) {
      setIsDialogOpen(true);
    }
  }, [promoIsActive, storageKey, dialogSeenKey]);

  const closeDialog = () => {
    localStorage.setItem(dialogSeenKey, "1");
    setIsDialogOpen(false);
  };

  const dismissForSession = (e: React.MouseEvent) => {
    e.stopPropagation();
    sessionStorage.setItem(storageKey, "1");
    closeDialog();
    setIsVisible(false);
  };

  const handlePrimaryAction = () => {
    localStorage.setItem(dialogSeenKey, "1");
    setIsDialogOpen(false);
    router.push(promoHref);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <>
      {/* ── Floating teaser bar ── */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={
          reduceMotion
            ? { opacity: 1, y: 0, scale: 1 }
            : {
                opacity: 1,
                y: [0, -6, 0],
                scale: 1,
              }
        }
        transition={
          reduceMotion
            ? { duration: 0.25, ease: "easeOut" }
            : {
                opacity: { duration: 0.4, ease: "easeOut" },
                y: {
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                  repeatType: "loop",
                  ease: "easeInOut",
                },
              }
        }
        className="fixed bottom-3 left-3 right-3 z-40 sm:bottom-5 sm:left-auto sm:right-5 sm:w-auto"
      >
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={isDialogOpen}
          onClick={() => setIsDialogOpen(true)}
          className="group relative flex min-h-[52px] w-full animate-shimmer items-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 bg-[length:200%_100%] px-4 py-3 text-left text-white shadow-lg shadow-cyan-500/25 transition-shadow hover:shadow-xl hover:shadow-cyan-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:shadow-cyan-500/15 dark:hover:shadow-cyan-500/25 dark:focus-visible:ring-offset-slate-950 sm:min-w-[320px]"
        >
          <span
            aria-hidden="true"
            className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm"
          >
            <GiftIcon className="h-5 w-5" />
          </span>

          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2">
              <span className="block text-sm font-bold leading-tight">
                {teaserTitle}
              </span>
            </span>
            <span className="block text-xs font-medium text-white/80">
              {teaserSubtitle}
            </span>
          </span>

          <span
            role="button"
            tabIndex={0}
            onClick={dismissForSession}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                dismissForSession(e as unknown as React.MouseEvent);
              }
            }}
            aria-label="Dismiss promotion teaser for this session"
            className="right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-white/10 text-white/60 transition-colors hover:bg-white/25 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          >
            <XIcon className="h-3.5 w-3.5" />
          </span>
        </button>
      </motion.div>

      {/* ── Promo dialog ── */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) closeDialog();
          else setIsDialogOpen(true);
        }}
      >
        <DialogContent className="w-[calc(100%-1.5rem)] max-w-md gap-0 overflow-hidden p-0">
          {/* Decorative blurs */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full bg-cyan-500/15 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-12 -right-12 h-36 w-36 rounded-full bg-blue-500/10 blur-3xl"
          />

          {/* Hero image */}
          {dialogImageSrc && (
            <div className="relative">
              <Image
                src={dialogImageSrc}
                alt={dialogImageAlt}
                width={641}
                height={389}
                className="h-auto w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
            </div>
          )}

          <div className="relative space-y-4 px-6 pb-6 pt-4">
            <DialogHeader className="space-y-3">
              <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-gradient-to-r from-cyan-500/15 to-blue-500/15 px-3 py-1 text-xs font-semibold text-cyan-600 dark:text-cyan-300">
                <GiftIcon aria-hidden="true" className="h-3.5 w-3.5" />
                Giveaway
              </div>
              <DialogTitle className="text-xl font-bold leading-snug">
                {dialogTitle}
              </DialogTitle>
              <DialogDescription className="text-left text-sm leading-relaxed">
                {dialogDescription}
              </DialogDescription>
            </DialogHeader>

            {/* Deadline badge */}
            {/* {deadlineLabel && (
              <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-500/30 dark:bg-amber-500/10">
                <ClockIcon
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400"
                />
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                  {deadlineLabel}
                </span>
              </div>
            )} */}

            {/* Info items */}
            {dialogInfoItems.length > 0 && (
              <ul className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                {dialogInfoItems.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <CheckCircleIcon
                      aria-hidden="true"
                      className="mt-0.5 h-4 w-4 shrink-0 text-cyan-500"
                    />
                    <span className="text-sm leading-snug text-slate-700 dark:text-slate-200">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {/* CTA buttons */}
            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={handlePrimaryAction}
                className="group/cta inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-cyan-500/20 transition-all hover:shadow-lg hover:shadow-cyan-500/30 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950"
              >
                {primaryActionLabel}
                <ArrowRightIcon
                  aria-hidden="true"
                  className="h-4 w-4 transition-transform group-hover/cta:translate-x-0.5"
                />
              </button>
              <button
                type="button"
                onClick={closeDialog}
                className="min-h-[44px] rounded-xl px-4 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:text-slate-400 dark:hover:text-slate-200"
              >
                Maybe later
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
