"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Mail } from "lucide-react";

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
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state.kind === "submitting") return;

    setState({ kind: "submitting" });
    try {
      const res = await fetch("/studios/api/email-gate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
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
          <div className="flex items-center gap-3 rounded-full border border-[rgb(var(--studios-success))]/40 bg-[rgb(var(--studios-success))]/10 px-5 py-3 text-sm text-[rgb(var(--studios-success))]">
            <CheckCircle2 className="size-5" aria-hidden />
            You&apos;re in. Episode 1 unlocked. Check your inbox shortly.
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex w-full max-w-xl flex-col gap-3 sm:flex-row"
          >
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
              className="font-display h-12 min-w-[10rem] rounded-full bg-[rgb(var(--studios-accent))] text-xs uppercase tracking-[0.25em] text-[rgb(11,11,13)] hover:bg-[rgb(var(--studios-accent-hi))] disabled:opacity-70"
            >
              {state.kind === "submitting" ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                "Unlock Episode 1"
              )}
            </Button>
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
