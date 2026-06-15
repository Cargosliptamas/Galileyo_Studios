"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useReducedMotion } from "motion/react";

import { cn } from "@galileyo/ui";

import { STUDIOS_EASE } from "./motion";

interface StudiosFundingProgressProps {
  current: number;
  target: number;
  label?: string;
  className?: string;
  tone?: "gold" | "ember";
}

const COMPACT_USD = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
  style: "currency",
  currency: "USD",
});

const FULL_USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function formatAmount(value: number, compact: boolean) {
  return compact ? COMPACT_USD.format(value) : FULL_USD.format(value);
}

export function StudiosFundingProgress({
  current,
  target,
  label,
  className,
  tone = "gold",
}: StudiosFundingProgressProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const [display, setDisplay] = useState(0);

  const safeTarget = Math.max(target, 1);
  const pct = Math.min(100, Math.max(0, (current / safeTarget) * 100));
  const useCompact = target >= 100_000;

  // Roll the raised figure up from zero when it scrolls into view.
  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setDisplay(current);
      return;
    }
    const controls = animate(0, current, {
      duration: 0.8,
      ease: STUDIOS_EASE,
      onUpdate: (value) => setDisplay(value),
    });
    return () => controls.stop();
  }, [inView, current, reduce]);

  return (
    <div ref={ref} className={cn("w-full space-y-2", className)}>
      {label ? (
        <p className="font-display text-[11px] uppercase tracking-[0.3em] text-[rgb(var(--studios-text-muted))]">
          {label}
        </p>
      ) : null}
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-display text-xl text-[rgb(var(--studios-text))] md:text-2xl">
          {formatAmount(display, useCompact)}{" "}
          <span className="text-sm text-[rgb(var(--studios-text-muted))]">
            raised
          </span>
        </p>
        <p className="font-display text-sm text-[rgb(var(--studios-text-muted))]">
          of {formatAmount(target, useCompact)}
        </p>
      </div>
      <div className="relative h-2 overflow-hidden rounded-full bg-[rgb(var(--studios-surface-hi))]">
        <motion.div
          className={cn(
            "absolute inset-y-0 left-0 w-full origin-left rounded-full",
            tone === "gold"
              ? "bg-gradient-to-r from-[rgb(var(--studios-accent))] to-[rgb(var(--studios-accent-hi))]"
              : "bg-gradient-to-r from-[rgb(var(--studios-danger))] to-[rgb(var(--studios-accent-hi))]",
          )}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: inView ? pct / 100 : 0 }}
          transition={{ duration: reduce ? 0 : 0.8, ease: STUDIOS_EASE }}
        />
      </div>
      <p className="text-xs text-[rgb(var(--studios-text-muted))]">
        {pct < 1
          ? "Help us hit the first milestone."
          : `${pct.toFixed(1)}% to next milestone.`}
      </p>
    </div>
  );
}
