"use client";

import { useEffect, useMemo, useState } from "react";
import { useTimer } from "react-timer-hook";

import { cn } from "@galileyo/ui";

interface StudiosCountdownProps {
  targetDate: string;
  className?: string;
  label?: string;
}

function pad(value: number) {
  return value.toString().padStart(2, "0");
}

function resolveTarget(targetDate: string): Date {
  const parsed = targetDate ? new Date(targetDate) : new Date(NaN);
  if (Number.isNaN(parsed.getTime()) || parsed.getTime() <= Date.now()) {
    return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  return parsed;
}

function CountdownCell({ value, unit }: { value: number; unit: string }) {
  return (
    <div className="flex min-w-[4.5rem] flex-col items-center rounded-md border border-[rgb(var(--studios-border))]/70 bg-[rgb(var(--studios-surface))]/80 px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-sm md:min-w-[5.5rem]">
      <span className="font-display text-3xl leading-none tracking-wider text-[rgb(var(--studios-text))] md:text-5xl">
        {pad(value)}
      </span>
      <span className="font-display mt-2 text-[10px] uppercase tracking-[0.32em] text-[rgb(var(--studios-text-muted))] md:text-xs">
        {unit}
      </span>
    </div>
  );
}

export function StudiosCountdown({
  targetDate,
  className,
  label = "Next episode arrives in",
}: StudiosCountdownProps) {
  const target = useMemo(() => resolveTarget(targetDate), [targetDate]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { days, hours, minutes, seconds } = useTimer({
    expiryTimestamp: target,
    autoStart: true,
  });

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <span className="font-display text-[10px] uppercase tracking-[0.4em] text-[rgb(var(--studios-accent))] md:text-xs">
        {label}
      </span>
      <div
        className="flex items-center gap-2 md:gap-3"
        suppressHydrationWarning
      >
        {mounted ? (
          <>
            <CountdownCell value={days} unit="Days" />
            <CountdownCell value={hours} unit="Hrs" />
            <CountdownCell value={minutes} unit="Min" />
            <CountdownCell value={seconds} unit="Sec" />
          </>
        ) : (
          <>
            <CountdownCell value={0} unit="Days" />
            <CountdownCell value={0} unit="Hrs" />
            <CountdownCell value={0} unit="Min" />
            <CountdownCell value={0} unit="Sec" />
          </>
        )}
      </div>
    </div>
  );
}
