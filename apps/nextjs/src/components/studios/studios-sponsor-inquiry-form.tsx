"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

import { cn } from "@galileyo/ui";
import { Button } from "@galileyo/ui/button";

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success" }
  | { kind: "error"; message: string };

const BUDGET_RANGES = [
  "$5K - $25K",
  "$25K - $100K",
  "$100K - $500K",
  "$500K+",
] as const;

type Interest =
  | "product-placement"
  | "end-card"
  | "affiliate"
  | "banner"
  | "podcast";

const INTERESTS: { id: Interest; label: string }[] = [
  { id: "product-placement", label: "Product placement" },
  { id: "end-card", label: "End-card sponsorship" },
  { id: "affiliate", label: "Affiliate marketplace" },
  { id: "banner", label: "Site banner" },
  { id: "podcast", label: "Podcast ad-read" },
];

interface StudiosSponsorInquiryFormProps {
  defaultInterest?: Interest;
  variant?: "full" | "compact";
  title?: string;
  description?: string;
  className?: string;
}

export function StudiosSponsorInquiryForm({
  defaultInterest,
  variant = "full",
  title = "Tell us what you're trying to reach.",
  description = "We will respond within two business days with inventory, demographics, and a rate sheet.",
  className,
}: StudiosSponsorInquiryFormProps) {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [company, setCompany] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [budgetRange, setBudgetRange] = useState<string>("");
  const [interests, setInterests] = useState<Interest[]>(
    defaultInterest ? [defaultInterest] : [],
  );
  const [notes, setNotes] = useState("");

  function toggleInterest(id: Interest) {
    setInterests((current) =>
      current.includes(id) ? current.filter((i) => i !== id) : [...current, id],
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status.kind === "submitting") return;
    setStatus({ kind: "submitting" });

    try {
      const res = await fetch("/api/sponsor-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: company || undefined,
          contactName,
          email,
          phone: phone || undefined,
          budgetRange: budgetRange || undefined,
          interest: interests.length > 0 ? interests : "sponsor",
          notes: notes || undefined,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setStatus({
          kind: "error",
          message:
            data.error ?? "Something went wrong. Please email us instead.",
        });
        return;
      }
      setStatus({ kind: "success" });
    } catch {
      setStatus({
        kind: "error",
        message: "Network error. You can also reach us at brett@galileyo.com.",
      });
    }
  }

  const fieldClass =
    "h-11 w-full rounded-md border border-[rgb(var(--studios-border))] bg-[rgb(var(--studios-bg))] px-4 text-sm text-[rgb(var(--studios-text))] outline-none focus:border-[rgb(var(--studios-accent))]";
  const labelClass =
    "font-display text-[11px] uppercase tracking-[0.28em] text-[rgb(var(--studios-text-muted))]";

  if (status.kind === "success") {
    return (
      <div
        className={cn(
          "flex flex-col items-center gap-3 rounded-2xl border border-[rgb(var(--studios-accent))]/60 bg-[rgb(var(--studios-surface))] p-8 text-center md:p-12",
          className,
        )}
      >
        <CheckCircle2 className="size-10 text-[rgb(var(--studios-success))]" />
        <p className="font-display text-2xl text-[rgb(var(--studios-text))]">
          Request received.
        </p>
        <p className="font-editorial max-w-md text-sm text-[rgb(var(--studios-text-muted))]">
          We will reach out within two business days with inventory, audience
          stats, and a rate sheet.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "rounded-2xl border border-[rgb(var(--studios-border))]/70 bg-[rgb(var(--studios-surface))]/80 p-7 md:p-10",
        className,
      )}
    >
      <div className="mb-6 max-w-xl">
        <p className="font-display text-[11px] uppercase tracking-[0.4em] text-[rgb(var(--studios-accent))]">
          Sponsor inquiry
        </p>
        <h3 className="font-display mt-2 text-2xl text-[rgb(var(--studios-text))] md:text-3xl">
          {title}
        </h3>
        <p className="font-editorial mt-3 text-sm text-[rgb(var(--studios-text-muted))]">
          {description}
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="grid gap-2">
          <label htmlFor="sp-company" className={labelClass}>
            Company
          </label>
          <input
            id="sp-company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className={fieldClass}
            autoComplete="organization"
          />
        </div>
        <div className="grid gap-2">
          <label htmlFor="sp-contact" className={labelClass}>
            Contact name
          </label>
          <input
            id="sp-contact"
            required
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            className={fieldClass}
            autoComplete="name"
          />
        </div>
        <div className="grid gap-2">
          <label htmlFor="sp-email" className={labelClass}>
            Email
          </label>
          <input
            id="sp-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={fieldClass}
            autoComplete="email"
          />
        </div>
        <div className="grid gap-2">
          <label htmlFor="sp-phone" className={labelClass}>
            Phone (optional)
          </label>
          <input
            id="sp-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={fieldClass}
            autoComplete="tel"
          />
        </div>
      </div>

      {variant === "full" ? (
        <>
          <div className="mt-5 grid gap-2">
            <label htmlFor="sp-budget" className={labelClass}>
              Budget range
            </label>
            <select
              id="sp-budget"
              value={budgetRange}
              onChange={(e) => setBudgetRange(e.target.value)}
              className={cn(fieldClass, "appearance-none pr-10")}
            >
              <option value="">Select a range</option>
              {BUDGET_RANGES.map((range) => (
                <option key={range} value={range}>
                  {range}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-5">
            <p className={labelClass}>Interested in</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {INTERESTS.map((opt) => {
                const active = interests.includes(opt.id);
                return (
                  <button
                    type="button"
                    key={opt.id}
                    onClick={() => toggleInterest(opt.id)}
                    className={cn(
                      "font-display rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.25em] transition-colors",
                      active
                        ? "border-[rgb(var(--studios-accent))] bg-[rgb(var(--studios-accent))]/15 text-[rgb(var(--studios-accent-hi))]"
                        : "border-[rgb(var(--studios-border))]/80 bg-transparent text-[rgb(var(--studios-text-muted))] hover:border-[rgb(var(--studios-accent))]/60 hover:text-[rgb(var(--studios-text))]",
                    )}
                    aria-pressed={active}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      ) : null}

      <div className="mt-5 grid gap-2">
        <label htmlFor="sp-notes" className={labelClass}>
          Notes
        </label>
        <textarea
          id="sp-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          className="w-full rounded-md border border-[rgb(var(--studios-border))] bg-[rgb(var(--studios-bg))] px-4 py-3 text-sm text-[rgb(var(--studios-text))] outline-none focus:border-[rgb(var(--studios-accent))]"
          placeholder="What you are trying to reach, timing, anything we should know."
        />
      </div>

      {status.kind === "error" ? (
        <p className="mt-4 text-sm text-[rgb(var(--studios-danger))]">
          {status.message}
        </p>
      ) : null}

      <div className="mt-6">
        <Button
          type="submit"
          disabled={status.kind === "submitting"}
          className="font-display h-12 rounded-full bg-[rgb(var(--studios-accent))] px-8 text-xs uppercase tracking-[0.25em] text-[rgb(var(--studios-bg))] hover:bg-[rgb(var(--studios-accent-hi))]"
        >
          {status.kind === "submitting" ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            "Send the inquiry"
          )}
        </Button>
      </div>
    </form>
  );
}
