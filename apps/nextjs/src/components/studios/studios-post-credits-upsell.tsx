"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@galileyo/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@galileyo/ui/dialog";

import type { Episode } from "~/lib/studios/episodes";

interface StudiosPostCreditsUpsellProps {
  open: boolean;
  episode: Episode;
  onClose: () => void;
}

export function StudiosPostCreditsUpsell({
  open,
  episode,
  onClose,
}: StudiosPostCreditsUpsellProps) {
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
            Episodes 2 through 7 are coming. Help us make them faster, and get
            all-access with Bronze.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button
            asChild
            className="font-display h-12 flex-1 rounded-full bg-[rgb(var(--studios-accent))] text-xs uppercase tracking-[0.25em] text-[rgb(11,11,13)] hover:bg-[rgb(var(--studios-accent-hi))]"
          >
            <Link href="/studios/membership">
              Get Bronze All-Access
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="font-display h-12 flex-1 rounded-full border-[rgb(var(--studios-accent))]/60 bg-transparent text-xs uppercase tracking-[0.25em] text-[rgb(var(--studios-text))] hover:bg-[rgb(var(--studios-accent))]/10"
          >
            <Link href="/studios/producers">Become a Producer</Link>
          </Button>
        </div>

        <p className="font-editorial mt-4 text-center text-xs text-[rgb(var(--studios-text-muted))]">
          Or browse the roadmap and pick your next episode.
        </p>
      </DialogContent>
    </Dialog>
  );
}
