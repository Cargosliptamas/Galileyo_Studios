"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  Mail,
  Play,
  User,
} from "lucide-react";
import posthog from "posthog-js";

import { cn } from "@galileyo/ui";
import { Button } from "@galileyo/ui/button";

interface StudiosEmailGateProps {
  className?: string;
  variant?: "band" | "compact";
  headline?: string;
  description?: string;
}

type State =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success" }
  | { kind: "error"; message: string };

export function StudiosEmailGate({
  className,
  variant = "band",
  headline = "Unlock Episode 1, free.",
  description = "Drop your email and we'll send you the link. No spam, no nonsense.",
}: StudiosEmailGateProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state.kind === "submitting") return;

    setState({ kind: "submitting" });
    try {
      const search = new URLSearchParams(window.location.search);
      const res = await fetch("/api/email-gate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name: name.trim() || undefined,
          utmSource: search.get("utm_source") ?? undefined,
          utmMedium: search.get("utm_medium") ?? undefined,
          utmCampaign: search.get("utm_campaign") ?? undefined,
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

      posthog.capture("studios_email_captured", { variant });
      setState({ kind: "success" });
    } catch {
      setState({
        kind: "error",
        message: "Network error. Please try again.",
      });
    }
  }

  const isBand = variant === "band";

  return (
    <section
      className={cn(
        "relative border-y border-[rgb(var(--studios-border))]/60 bg-[rgb(var(--studios-surface))]/40 backdrop-blur-sm",
        isBand ? "py-16 md:py-20" : "rounded-2xl py-10",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 px-5 text-center md:px-8">
        <span className="font-display text-xs uppercase tracking-[0.4em] text-[rgb(var(--studios-accent))]">
          Free Access
        </span>
        <h2 className="font-display text-3xl text-[rgb(var(--studios-text))] md:text-5xl">
          {headline}
        </h2>
        <p className="font-editorial max-w-2xl text-base text-[rgb(var(--studios-text-muted))] md:text-lg">
          {description}
        </p>

        {state.kind === "success" ? (
          <div className="flex w-full max-w-xl flex-col items-center gap-6">
            <div className="flex items-center gap-3 rounded-full border border-[rgb(var(--studios-success))]/40 bg-[rgb(var(--studios-success))]/10 px-5 py-3 text-sm text-[rgb(var(--studios-success))]">
              <CheckCircle2 className="size-5" aria-hidden />
              You&apos;re in. Episode 1 unlocked. Check your inbox shortly.
            </div>
            <p className="font-editorial max-w-md text-sm text-[rgb(var(--studios-text-muted))]">
              Create a free Galileyo account to keep every episode, your watch
              history, and producer perks in one place.
            </p>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Button
                asChild
                className="font-display h-11 w-full rounded-full bg-[rgb(var(--studios-accent))] text-xs uppercase tracking-[0.25em] text-[rgb(var(--studios-bg))] hover:bg-[rgb(var(--studios-accent-hi))] sm:w-auto sm:min-w-[15rem]"
              >
                <Link href="/sign-up">
                  Create your free account
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="font-display h-11 w-full rounded-full border-[rgb(var(--studios-accent))]/60 bg-transparent text-xs uppercase tracking-[0.25em] text-[rgb(var(--studios-text))] hover:bg-[rgb(var(--studios-accent))]/10 sm:w-auto sm:min-w-[12rem]"
              >
                <Link href="/watch/episode-1">
                  <Play className="size-4 fill-current" aria-hidden />
                  Watch now
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex w-full max-w-xl flex-col gap-3"
          >
            <label htmlFor="studios-name" className="sr-only">
              Your name
            </label>
            <div className="relative">
              <User
                aria-hidden
                className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[rgb(var(--studios-text-muted))]"
              />
              <input
                id="studios-name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name (optional)"
                disabled={state.kind === "submitting"}
                className="h-12 w-full rounded-full border border-[rgb(var(--studios-border))]/80 bg-[rgb(var(--studios-bg))]/80 pl-11 pr-4 text-sm text-[rgb(var(--studios-text))] outline-none placeholder:text-[rgb(var(--studios-text-muted))]/70 focus:border-[rgb(var(--studios-accent))] focus:ring-2 focus:ring-[rgb(var(--studios-accent))]/40 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <label htmlFor="studios-email" className="sr-only">
                Email address
              </label>
              <div className="relative flex-1">
                <Mail
                  aria-hidden
                  className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[rgb(var(--studios-text-muted))]"
                />
                <input
                  id="studios-email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@yourdomain.com"
                  disabled={state.kind === "submitting"}
                  className="h-12 w-full rounded-full border border-[rgb(var(--studios-border))]/80 bg-[rgb(var(--studios-bg))]/80 pl-11 pr-4 text-sm text-[rgb(var(--studios-text))] outline-none placeholder:text-[rgb(var(--studios-text-muted))]/70 focus:border-[rgb(var(--studios-accent))] focus:ring-2 focus:ring-[rgb(var(--studios-accent))]/40 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
              <Button
                type="submit"
                disabled={state.kind === "submitting"}
                className="font-display h-12 w-full rounded-full bg-[rgb(var(--studios-accent))] text-xs uppercase tracking-[0.25em] text-[rgb(var(--studios-bg))] hover:bg-[rgb(var(--studios-accent-hi))] disabled:opacity-70 sm:w-auto sm:min-w-[10rem]"
              >
                {state.kind === "submitting" ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : (
                  "Unlock Episode 1"
                )}
              </Button>
            </div>
          </form>
        )}

        {state.kind === "error" ? (
          <p className="text-sm text-[rgb(var(--studios-danger))]">
            {state.message}
          </p>
        ) : null}
      </div>
    </section>
  );
}
