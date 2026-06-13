"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Copy, Facebook, Heart } from "lucide-react";
import posthog from "posthog-js";

import { Button } from "@galileyo/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@galileyo/ui/dialog";

import type { Episode } from "~/lib/studios/episodes";
import { StudiosPartnershipCta } from "./studios-partnership-cta";

const SHARE_TEXT =
  "I just watched Episode 1 of an AI-made series, free to stream:";

interface StudiosPostCreditsUpsellProps {
  open: boolean;
  episode: Episode;
  onClose: () => void;
}

function getShareUrl(): string {
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  return `${origin}/studios?utm_source=share`;
}

export function StudiosPostCreditsUpsell({
  open,
  episode,
  onClose,
}: StudiosPostCreditsUpsellProps) {
  const [copied, setCopied] = useState(false);
  const nextEpisodeSlug = `episode-${episode.number + 1}`;

  function shareToX() {
    posthog.capture("studios_share_clicked", { platform: "x" });
    const url = getShareUrl();
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        SHARE_TEXT,
      )}&url=${encodeURIComponent(url)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  function shareToFacebook() {
    posthog.capture("studios_share_clicked", { platform: "facebook" });
    const url = getShareUrl();
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  async function copyLink() {
    posthog.capture("studios_share_clicked", { platform: "copy" });
    try {
      await navigator.clipboard.writeText(`${SHARE_TEXT} ${getShareUrl()}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent className="studios-theme border-[rgb(var(--studios-border))] bg-[rgb(var(--studios-surface))] text-[rgb(var(--studios-text))] sm:max-w-xl">
        <DialogHeader className="text-left">
          <p className="font-display text-xs uppercase tracking-[0.32em] text-[rgb(var(--studios-accent))]">
            You finished Episode {episode.number}
          </p>
          <DialogTitle className="font-display mt-3 text-3xl md:text-4xl">
            You watched Episode {episode.number}. Now what?
          </DialogTitle>
          <DialogDescription className="font-editorial mt-3 text-base text-[rgb(var(--studios-text-muted))]">
            Episodes 2 through 7 are coming. Help us make them faster, unlock
            what is next, and spread the word.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 flex flex-col gap-3">
          <Button
            asChild
            className="font-display h-12 w-full rounded-full bg-[rgb(var(--studios-accent))] text-xs uppercase tracking-[0.25em] text-[rgb(11,11,13)] hover:bg-[rgb(var(--studios-accent-hi))]"
          >
            <Link href="/studios/donate">
              <Heart className="size-4" aria-hidden />
              Donate to fund the next episode
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="font-display h-12 w-full rounded-full border-[rgb(var(--studios-accent))]/60 bg-transparent text-xs uppercase tracking-[0.25em] text-[rgb(var(--studios-text))] hover:bg-[rgb(var(--studios-accent))]/10"
          >
            <Link href={`/studios/episodes/${nextEpisodeSlug}`}>
              Unlock Episode {episode.number + 1} for $7
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="font-display h-12 w-full rounded-full border-[rgb(var(--studios-accent))]/60 bg-transparent text-xs uppercase tracking-[0.25em] text-[rgb(var(--studios-text))] hover:bg-[rgb(var(--studios-accent))]/10"
          >
            <Link href="/studios/membership">
              Bronze All-Access, $24 per year
            </Link>
          </Button>
        </div>

        <div className="mt-6 border-t border-[rgb(var(--studios-border))]/50 pt-5">
          <p className="font-display text-center text-[11px] uppercase tracking-[0.28em] text-[rgb(var(--studios-text-muted))]">
            Share Episode 1, free
          </p>
          <div className="mt-3 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={shareToX}
              aria-label="Share on X"
              className="font-display inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-[rgb(var(--studios-border))]/70 text-xs uppercase tracking-[0.2em] text-[rgb(var(--studios-text))] transition-colors hover:border-[rgb(var(--studios-accent))]/60 hover:text-[rgb(var(--studios-accent))]"
            >
              X
            </button>
            <button
              type="button"
              onClick={shareToFacebook}
              aria-label="Share on Facebook"
              className="font-display inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-[rgb(var(--studios-border))]/70 text-xs uppercase tracking-[0.2em] text-[rgb(var(--studios-text))] transition-colors hover:border-[rgb(var(--studios-accent))]/60 hover:text-[rgb(var(--studios-accent))]"
            >
              <Facebook className="size-4" aria-hidden />
              Facebook
            </button>
            <button
              type="button"
              onClick={copyLink}
              aria-label="Copy share link"
              className="font-display inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-[rgb(var(--studios-border))]/70 text-xs uppercase tracking-[0.2em] text-[rgb(var(--studios-text))] transition-colors hover:border-[rgb(var(--studios-accent))]/60 hover:text-[rgb(var(--studios-accent))]"
            >
              {copied ? (
                <>
                  <Check className="size-4" aria-hidden />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="size-4" aria-hidden />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>

        <StudiosPartnershipCta variant="compact" className="mt-6" />
      </DialogContent>
    </Dialog>
  );
}
