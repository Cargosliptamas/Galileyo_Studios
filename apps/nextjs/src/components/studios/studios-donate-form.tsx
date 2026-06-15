"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import posthog from "posthog-js";

import { cn } from "@galileyo/ui";
import { Button } from "@galileyo/ui/button";

import { env } from "~/env/client";
import { STUDIOS_EASE, STUDIOS_SPRING } from "./motion";

const PRESET_AMOUNTS = [10, 25, 50, 100] as const;
const MIN_AMOUNT = 1;
const MAX_AMOUNT = 50000;

type State =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success" }
  | { kind: "error"; message: string };

export function StudiosDonateForm() {
  const reduce = useReducedMotion();
  const [amount, setAmount] = useState<number>(25);
  const [customAmount, setCustomAmount] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });

  function selectPreset(value: number) {
    setAmount(value);
    setCustomAmount("");
  }

  function handleCustomChange(value: string) {
    setCustomAmount(value);
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      setAmount(Math.floor(parsed));
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state.kind === "submitting") return;

    if (
      !Number.isInteger(amount) ||
      amount < MIN_AMOUNT ||
      amount > MAX_AMOUNT
    ) {
      setState({
        kind: "error",
        message: `Please choose an amount between $${MIN_AMOUNT} and $${MAX_AMOUNT.toLocaleString()}.`,
      });
      return;
    }

    posthog.capture("studios_donate_clicked", { amount });
    setState({ kind: "submitting" });

    try {
      const search = new URLSearchParams(window.location.search);
      const utm = {
        utmSource: search.get("utm_source") ?? undefined,
        utmMedium: search.get("utm_medium") ?? undefined,
        utmCampaign: search.get("utm_campaign") ?? undefined,
      };

      // When Stripe is live, send donors straight to hosted Checkout. Until
      // then, fall back to capturing the email and intended amount as a lead.
      if (env.NEXT_PUBLIC_STRIPE_ENABLED) {
        const res = await fetch("/studios/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            kind: "donation",
            amountCents: amount * 100,
            email,
            ...utm,
          }),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as {
            error?: string;
          };
          setState({
            kind: "error",
            message: data.error ?? "Something went wrong. Please try again.",
          });
          return;
        }
        const data = (await res.json()) as { url: string | null };
        if (data.url) {
          window.location.href = data.url;
          return;
        }
        setState({ kind: "error", message: "Could not start checkout." });
        return;
      }

      const res = await fetch("/studios/api/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, amount, ...utm }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setState({
          kind: "error",
          message: data.error ?? "Something went wrong. Please try again.",
        });
        return;
      }

      setState({ kind: "success" });
    } catch {
      setState({ kind: "error", message: "Network error. Please try again." });
    }
  }

  if (state.kind === "success") {
    return (
      <motion.div
        className="flex flex-col items-center gap-4 rounded-2xl border border-[rgb(var(--studios-success))]/40 bg-[rgb(var(--studios-success))]/10 p-8 text-center md:p-10"
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
        animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: STUDIOS_EASE }}
      >
        <motion.span
          initial={reduce ? { opacity: 0 } : { scale: 0.8, opacity: 0 }}
          animate={
            reduce ? { opacity: 1 } : { scale: [0.8, 1.06, 1], opacity: 1 }
          }
          transition={{ duration: 0.5, ease: STUDIOS_EASE, times: [0, 0.6, 1] }}
        >
          <CheckCircle2
            className="size-8 text-[rgb(var(--studios-success))]"
            aria-hidden
          />
        </motion.span>
        <h2 className="font-display text-2xl text-[rgb(var(--studios-text))] md:text-3xl">
          Thank you. You&apos;re on the list.
        </h2>
        <p className="font-editorial max-w-md text-sm text-[rgb(var(--studios-text-muted))]">
          Donations open this week. Leave your email and we will notify you the
          moment they go live.
        </p>
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-6 rounded-2xl border border-[rgb(var(--studios-border))]/70 bg-[rgb(var(--studios-surface))]/60 p-6 md:p-10"
    >
      <div>
        <p className="font-display text-xs uppercase tracking-[0.32em] text-[rgb(var(--studios-accent))]">
          Choose an amount
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {PRESET_AMOUNTS.map((value) => {
            const active = !customAmount && amount === value;
            return (
              <motion.button
                key={value}
                type="button"
                onClick={() => selectPreset(value)}
                whileTap={reduce ? undefined : { scale: 0.97 }}
                animate={{ scale: active && !reduce ? 1.03 : 1 }}
                transition={STUDIOS_SPRING}
                className={cn(
                  "font-display rounded-xl border px-4 py-4 text-lg transition-colors",
                  active
                    ? "border-[rgb(var(--studios-accent))] bg-[rgb(var(--studios-accent))]/10 text-[rgb(var(--studios-accent-hi))]"
                    : "border-[rgb(var(--studios-border))]/70 text-[rgb(var(--studios-text))] hover:border-[rgb(var(--studios-accent))]/50",
                )}
              >
                ${value}
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="studios-donate-custom"
          className="font-display text-xs uppercase tracking-[0.28em] text-[rgb(var(--studios-text-muted))]"
        >
          Or enter a custom amount
        </label>
        <div className="relative">
          <span className="font-display pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[rgb(var(--studios-text-muted))]">
            $
          </span>
          <input
            id="studios-donate-custom"
            type="number"
            min={MIN_AMOUNT}
            max={MAX_AMOUNT}
            step={1}
            inputMode="numeric"
            value={customAmount}
            onChange={(event) => handleCustomChange(event.target.value)}
            placeholder="Custom amount"
            className="h-12 w-full rounded-full border border-[rgb(var(--studios-border))]/80 bg-[rgb(var(--studios-bg))]/80 pl-8 pr-4 text-sm text-[rgb(var(--studios-text))] outline-none focus:border-[rgb(var(--studios-accent))] focus:ring-2 focus:ring-[rgb(var(--studios-accent))]/40"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="studios-donate-email"
          className="font-display text-xs uppercase tracking-[0.28em] text-[rgb(var(--studios-text-muted))]"
        >
          Email
        </label>
        <input
          id="studios-donate-email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@yourdomain.com"
          disabled={state.kind === "submitting"}
          className="h-12 w-full rounded-full border border-[rgb(var(--studios-border))]/80 bg-[rgb(var(--studios-bg))]/80 px-4 text-sm text-[rgb(var(--studios-text))] outline-none placeholder:text-[rgb(var(--studios-text-muted))]/70 focus:border-[rgb(var(--studios-accent))] focus:ring-2 focus:ring-[rgb(var(--studios-accent))]/40 disabled:opacity-60"
        />
      </div>

      <Button
        type="submit"
        disabled={state.kind === "submitting"}
        className="font-display h-12 rounded-full bg-[rgb(var(--studios-accent))] text-xs uppercase tracking-[0.25em] text-[rgb(var(--studios-bg))] hover:bg-[rgb(var(--studios-accent-hi))] disabled:opacity-70"
      >
        {state.kind === "submitting" ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          `Donate $${amount.toLocaleString()}`
        )}
      </Button>

      {state.kind === "error" ? (
        <p className="text-center text-sm text-[rgb(var(--studios-danger))]">
          {state.message}
        </p>
      ) : (
        <p className="font-editorial text-center text-xs text-[rgb(var(--studios-text-muted))]">
          Donations open this week. Leave your email and we will notify you.
        </p>
      )}
    </form>
  );
}
