"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

import { Button } from "@galileyo/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@galileyo/ui/dialog";

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success" }
  | { kind: "error"; message: string };

interface StudiosExecutiveInquiryModalProps {
  triggerLabel: string;
  triggerClassName?: string;
}

export function StudiosExecutiveInquiryModal({
  triggerLabel,
  triggerClassName,
}: StudiosExecutiveInquiryModalProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  function reset() {
    setName("");
    setEmail("");
    setPhone("");
    setNotes("");
    setStatus({ kind: "idle" });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status.kind === "submitting") return;
    setStatus({ kind: "submitting" });

    try {
      const res = await fetch("/studios/api/executive-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, notes }),
      });
      if (!res.ok && res.status !== 404) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        setStatus({
          kind: "error",
          message: data.error ?? "Something went wrong. Please email us instead.",
        });
        return;
      }
      setStatus({ kind: "success" });
    } catch {
      setStatus({
        kind: "error",
        message:
          "Network error. You can also reach us at brett@galileyo.com.",
      });
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" className={triggerClassName}>
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="studios-theme border-[rgb(var(--studios-border))] bg-[rgb(var(--studios-surface))] text-[rgb(var(--studios-text))] sm:max-w-lg">
        <DialogHeader className="text-left">
          <DialogTitle className="font-display text-3xl">
            Executive Producer
          </DialogTitle>
          <DialogDescription className="font-editorial text-base text-[rgb(var(--studios-text-muted))]">
            Limited to 7 slots. Schedule a call and we&apos;ll walk you through
            the agreement, perks, and on-set visit.
          </DialogDescription>
        </DialogHeader>

        {status.kind === "success" ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle2 className="size-10 text-[rgb(var(--studios-success))]" />
            <p className="font-display text-xl">Request received.</p>
            <p className="font-editorial text-sm text-[rgb(var(--studios-text-muted))]">
              We&apos;ll reach out within 48 hours to set up the call.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="grid gap-2">
              <label
                htmlFor="exec-name"
                className="font-display text-[11px] uppercase tracking-[0.28em] text-[rgb(var(--studios-text-muted))]"
              >
                Name
              </label>
              <input
                id="exec-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                className="h-11 rounded-md border border-[rgb(var(--studios-border))] bg-[rgb(var(--studios-bg))] px-4 text-sm text-[rgb(var(--studios-text))] outline-none focus:border-[rgb(var(--studios-accent))]"
              />
            </div>
            <div className="grid gap-2">
              <label
                htmlFor="exec-email"
                className="font-display text-[11px] uppercase tracking-[0.28em] text-[rgb(var(--studios-text-muted))]"
              >
                Email
              </label>
              <input
                id="exec-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="h-11 rounded-md border border-[rgb(var(--studios-border))] bg-[rgb(var(--studios-bg))] px-4 text-sm text-[rgb(var(--studios-text))] outline-none focus:border-[rgb(var(--studios-accent))]"
              />
            </div>
            <div className="grid gap-2">
              <label
                htmlFor="exec-phone"
                className="font-display text-[11px] uppercase tracking-[0.28em] text-[rgb(var(--studios-text-muted))]"
              >
                Phone (optional)
              </label>
              <input
                id="exec-phone"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="h-11 rounded-md border border-[rgb(var(--studios-border))] bg-[rgb(var(--studios-bg))] px-4 text-sm text-[rgb(var(--studios-text))] outline-none focus:border-[rgb(var(--studios-accent))]"
              />
            </div>
            <div className="grid gap-2">
              <label
                htmlFor="exec-notes"
                className="font-display text-[11px] uppercase tracking-[0.28em] text-[rgb(var(--studios-text-muted))]"
              >
                Anything we should know
              </label>
              <textarea
                id="exec-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={3}
                className="rounded-md border border-[rgb(var(--studios-border))] bg-[rgb(var(--studios-bg))] px-4 py-3 text-sm text-[rgb(var(--studios-text))] outline-none focus:border-[rgb(var(--studios-accent))]"
              />
            </div>

            {status.kind === "error" ? (
              <p className="text-sm text-[rgb(var(--studios-danger))]">
                {status.message}
              </p>
            ) : null}

            <Button
              type="submit"
              disabled={status.kind === "submitting"}
              className="font-display h-11 w-full rounded-full bg-[rgb(var(--studios-accent))] text-xs uppercase tracking-[0.25em] text-[rgb(11,11,13)] hover:bg-[rgb(var(--studios-accent-hi))]"
            >
              {status.kind === "submitting" ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                "Schedule the Call"
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
