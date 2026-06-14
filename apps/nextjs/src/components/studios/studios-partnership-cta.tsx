"use client";

import posthog from "posthog-js";

import { cn } from "@galileyo/ui";

const PARTNERSHIP_MAILTO =
  "mailto:Brett@Galileyo.com?subject=Galileyo Studios Partnership";

interface StudiosPartnershipCtaProps {
  className?: string;
  variant?: "band" | "compact";
}

export function StudiosPartnershipCta({
  className,
  variant = "band",
}: StudiosPartnershipCtaProps) {
  function handleClick() {
    posthog.capture("studios_partnership_cta_clicked", { variant });
  }

  if (variant === "compact") {
    return (
      <a
        href={PARTNERSHIP_MAILTO}
        onClick={handleClick}
        className={cn(
          "font-display block text-center text-[11px] uppercase tracking-[0.28em] text-[rgb(var(--studios-text-muted))] transition-colors duration-200 hover:text-[rgb(var(--studios-accent))]",
          className,
        )}
      >
        For Partnership info, contact Brett@Galileyo.com
      </a>
    );
  }

  return (
    <section
      className={cn(
        "border-t border-[rgb(var(--studios-border))]/40 bg-[rgb(var(--studios-surface))]/30",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-2 px-5 py-6 text-center md:flex-row md:justify-center md:gap-3 md:px-8">
        <span className="font-display text-[11px] uppercase tracking-[0.32em] text-[rgb(var(--studios-text-muted))]">
          For Partnership info, contact
        </span>
        <a
          href={PARTNERSHIP_MAILTO}
          onClick={handleClick}
          className="font-display text-sm uppercase tracking-[0.28em] text-[rgb(var(--studios-accent))] transition-colors duration-200 hover:text-[rgb(var(--studios-accent-hi))]"
        >
          Brett@Galileyo.com
        </a>
      </div>
    </section>
  );
}
