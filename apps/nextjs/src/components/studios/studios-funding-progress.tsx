import { cn } from "@galileyo/ui";

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
  const safeTarget = Math.max(target, 1);
  const pct = Math.min(100, Math.max(0, (current / safeTarget) * 100));
  const useCompact = target >= 100_000;

  return (
    <div className={cn("w-full space-y-2", className)}>
      {label ? (
        <p className="font-display text-[11px] uppercase tracking-[0.3em] text-[rgb(var(--studios-text-muted))]">
          {label}
        </p>
      ) : null}
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-display text-xl text-[rgb(var(--studios-text))] md:text-2xl">
          {formatAmount(current, useCompact)}{" "}
          <span className="text-sm text-[rgb(var(--studios-text-muted))]">
            raised
          </span>
        </p>
        <p className="font-display text-sm text-[rgb(var(--studios-text-muted))]">
          of {formatAmount(target, useCompact)}
        </p>
      </div>
      <div className="relative h-2 overflow-hidden rounded-full bg-[rgb(var(--studios-surface-hi))]">
        <div
          className={cn(
            "absolute inset-y-0 left-0 rounded-full transition-all duration-700",
            tone === "gold"
              ? "bg-gradient-to-r from-[rgb(var(--studios-accent))] to-[rgb(var(--studios-accent-hi))]"
              : "bg-gradient-to-r from-amber-500 to-rose-400",
          )}
          style={{ width: `${pct}%` }}
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
