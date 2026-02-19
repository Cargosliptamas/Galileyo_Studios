/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, Building2 } from "lucide-react";

import { cn } from "@galileyo/ui";
import { Button } from "@galileyo/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@galileyo/ui/dialog";

import type { Partner } from "~/lib/server/types";
import Interweave from "../ui/interweave";

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildSummary(description: string, maxLength = 140): string {
  const plain = stripHtml(description);
  if (plain.length <= maxLength) {
    return plain;
  }

  const raw = plain.slice(0, maxLength);
  const cut = raw.lastIndexOf(" ");
  return `${cut > 0 ? raw.slice(0, cut) : raw}...`;
}

export function PartnersGrid({
  partners,
  compact = false,
}: {
  partners: Partner[];
  compact?: boolean;
}) {
  const [selectedPartnerId, setSelectedPartnerId] = useState<number | null>(
    null,
  );

  const selectedPartner = useMemo(
    () => partners.find((partner) => partner.id === selectedPartnerId) ?? null,
    [partners, selectedPartnerId],
  );

  if (!partners.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-8 text-center dark:border-slate-700 dark:bg-slate-800/40">
        <Building2 className="mx-auto mb-3 h-6 w-6 text-slate-500 dark:text-slate-400" />
        <p className="text-slate-700 dark:text-slate-300">
          Featured partners will appear here soon.
        </p>
      </div>
    );
  }

  return (
    <>
      <div
        className={cn(
          "grid gap-6",
          compact
            ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-4"
            : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        )}
      >
        {partners.map((partner) => {
          const summary = buildSummary(partner.description);
          return (
            <article
              key={partner.id}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white/70 shadow-sm transition-all hover:-translate-y-1 hover:border-cyan-500/40 hover:shadow-xl dark:border-slate-700 dark:bg-slate-900/60"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                {partner.image ? (
                  <img
                    src={partner.image}
                    alt={partner.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-cyan-600 via-blue-600 to-slate-800">
                    <span className="text-5xl font-black text-white/90">
                      {partner.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-4 p-5">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  {partner.name}
                </h3>
                <p className="min-h-[48px] text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {summary}
                </p>
                <Button
                  onClick={() => setSelectedPartnerId(partner.id)}
                  className="w-full"
                  variant={compact ? "outline" : "primary"}
                >
                  Learn More
                </Button>
              </div>
            </article>
          );
        })}
      </div>

      <Dialog
        open={!!selectedPartner}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedPartnerId(null);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] w-[95vw] max-w-3xl overflow-y-auto p-0">
          {selectedPartner ? (
            <div className="overflow-hidden rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-950">
                  {selectedPartner.image ? (
                    <img
                      src={selectedPartner.image}
                      alt={selectedPartner.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-cyan-600 via-blue-600 to-slate-800">
                      <span className="text-6xl font-black text-white/90">
                        {selectedPartner.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col p-6">
                  <DialogHeader className="text-left">
                    <DialogTitle className="text-2xl text-slate-900 dark:text-slate-100">
                      {selectedPartner.name}
                    </DialogTitle>
                    <DialogDescription className="text-slate-600 dark:text-slate-300">
                      Partner profile
                    </DialogDescription>
                  </DialogHeader>

                  <div className="mt-4 flex-1 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                    <Interweave content={selectedPartner.description} />
                  </div>

                  <DialogFooter className="mt-6">
                    <Button asChild className="w-full sm:w-auto">
                      <a
                        href={selectedPartner.link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Visit Partner Site
                        <ArrowUpRight className="ml-1 h-4 w-4" />
                      </a>
                    </Button>
                  </DialogFooter>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
