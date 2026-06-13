"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import posthog from "posthog-js";

import { cn } from "@galileyo/ui";
import { Button } from "@galileyo/ui/button";

import { env } from "~/env/client";

export type StudiosCheckoutKind =
  | "episode"
  | "bronze"
  | "ad_free"
  | "producer_associate"
  | "producer_contributing"
  | "producer_game"
  | "donation";

interface StudiosCheckoutButtonProps {
  kind: StudiosCheckoutKind;
  label: string;
  episodeSlug?: string;
  amountCents?: number;
  className?: string;
  variant?: "primary" | "outline";
  children?: React.ReactNode;
}

type State = "idle" | "loading" | "soon" | "error";

const VARIANT_CLASS: Record<"primary" | "outline", string> = {
  primary:
    "bg-[rgb(var(--studios-accent))] text-[rgb(11,11,13)] hover:bg-[rgb(var(--studios-accent-hi))]",
  outline:
    "border border-[rgb(var(--studios-accent))]/60 bg-transparent text-[rgb(var(--studios-text))] hover:bg-[rgb(var(--studios-accent))]/10",
};

export function StudiosCheckoutButton({
  kind,
  label,
  episodeSlug,
  amountCents,
  className,
  variant = "primary",
  children,
}: StudiosCheckoutButtonProps) {
  const [state, setState] = useState<State>("idle");

  async function handleClick() {
    posthog.capture("studios_checkout_started", { kind });

    // Until Stripe is enabled, surface a friendly "coming this week" state
    // instead of hitting the checkout route.
    if (!env.NEXT_PUBLIC_STRIPE_ENABLED) {
      setState("soon");
      return;
    }

    setState("loading");
    try {
      const search = new URLSearchParams(window.location.search);
      const res = await fetch("/studios/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          episodeSlug,
          amountCents,
          cancelPath: window.location.pathname,
          utmSource: search.get("utm_source") ?? undefined,
          utmMedium: search.get("utm_medium") ?? undefined,
          utmCampaign: search.get("utm_campaign") ?? undefined,
        }),
      });

      if (!res.ok) {
        setState("error");
        return;
      }

      const data = (await res.json()) as { url: string | null };
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setState("error");
    } catch {
      setState("error");
    }
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Button
        type="button"
        onClick={handleClick}
        disabled={state === "loading"}
        className={cn(
          "font-display h-12 w-full rounded-full text-xs uppercase tracking-[0.25em] disabled:opacity-70",
          VARIANT_CLASS[variant],
        )}
      >
        {state === "loading" ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          (children ?? label)
        )}
      </Button>
      {state === "soon" ? (
        <p className="font-editorial text-center text-xs text-[rgb(var(--studios-text-muted))]">
          Payments open this week. Check back soon.
        </p>
      ) : null}
      {state === "error" ? (
        <p className="text-center text-xs text-[rgb(var(--studios-danger))]">
          Something went wrong. Please try again.
        </p>
      ) : null}
    </div>
  );
}
