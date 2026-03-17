"use client";

import type { CSSProperties, ReactNode } from "react";
import { Oswald } from "next/font/google";
import { motion } from "motion/react";

import { cn } from "@galileyo/ui";

import type { FeatureShowcaseBeat } from "./feature-showcase-data";

const showcaseDisplayFont = Oswald({
  subsets: ["latin"],
  variable: "--font-feature-showcase-display",
  weight: ["400", "500", "600", "700"],
});

export function FeatureShowcaseStage({
  variant = "standalone",
  activeBeat,
  totalProgress,
  children,
  captionOverlay,
  transitionOverlay,
}: {
  variant?: "standalone" | "hero";
  activeBeat: FeatureShowcaseBeat;
  totalProgress: number;
  children: ReactNode;
  captionOverlay: ReactNode;
  transitionOverlay: ReactNode;
}) {
  const isHero = variant === "hero";
  const themeStyle = {
    "--showcase-grid": "rgba(148, 163, 184, 0.08)",
    "--showcase-frame": "rgba(255, 255, 255, 0.10)",
    "--showcase-frame-soft": "rgba(148, 163, 184, 0.08)",
  } as CSSProperties;

  return (
    <div
      className={cn(
        showcaseDisplayFont.variable,
        "relative overflow-hidden bg-[#050a11] text-white",
        isHero
          ? "mx-auto h-[520px] w-full max-w-[720px] rounded-[30px] border border-white/10 shadow-[0_28px_120px_rgba(2,6,23,0.3)] md:h-[600px]"
          : "min-h-screen",
      )}
      style={themeStyle}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(248,113,113,0.12),transparent_30%),linear-gradient(180deg,#03060c_0%,#07111d_55%,#04070c_100%)]" />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(var(--showcase-grid) 1px, transparent 1px), linear-gradient(90deg, var(--showcase-grid) 1px, transparent 1px)",
          backgroundSize: "52px 52px",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.25)_60%,rgba(2,6,23,0.65)_100%)]" />

      <div
        className={cn(
          "relative z-10 flex flex-col",
          isHero ? "h-full" : "min-h-screen",
        )}
      >
        {!isHero ? (
          <header className="hidden border-b border-white/10 bg-slate-950/55 backdrop-blur-xl md:block">
            <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="mb-1 text-[11px] uppercase tracking-[0.34em] text-slate-400">
                    Feature Showcase
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <h1
                      className="truncate text-2xl uppercase tracking-[0.08em] text-white sm:text-3xl"
                      style={{
                        fontFamily:
                          "var(--font-feature-showcase-display), var(--font-sans)",
                      }}
                    >
                      {activeBeat.label}
                    </h1>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.22em] text-slate-300">
                      {activeBeat.feature}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white/8 h-px w-full" />
            </div>
          </header>
        ) : null}

        <main
          className={cn(
            "relative flex-1",
            isHero ? "px-0 py-0" : "px-0 py-0 md:px-4 md:py-4 lg:px-8",
          )}
        >
          <div
            className={cn(
              "mx-auto",
              isHero
                ? "h-full w-full"
                : "h-[100svh] max-w-[1600px] md:h-[calc(100svh-8.5rem)]",
            )}
          >
            <div className="relative flex h-full items-center justify-center">
              <motion.div
                className={cn(
                  "relative h-full w-full overflow-hidden bg-slate-950/70 backdrop-blur-md",
                  isHero
                    ? "rounded-[30px]"
                    : "rounded-none border-0 md:rounded-[34px] md:border md:border-[var(--showcase-frame)] md:shadow-[0_40px_160px_rgba(2,6,23,0.7)]",
                )}
                style={{
                  boxShadow: isHero
                    ? "inset 0 1px 0 rgba(255,255,255,0.08), 0 24px 120px rgba(2, 6, 23, 0.45)"
                    : "inset 0 1px 0 rgba(255,255,255,0.08), 0 40px 160px rgba(2, 6, 23, 0.7)",
                }}
              >
                <div
                  className={cn(
                    "pointer-events-none absolute inset-0 border border-[var(--showcase-frame-soft)]",
                    isHero
                      ? "rounded-[30px]"
                      : "hidden rounded-[34px] md:block",
                  )}
                />
                <div className="absolute inset-x-0 top-0 z-10 h-16 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent)]" />
                {isHero ? (
                  <div className="pointer-events-none absolute inset-x-0 top-0 z-20 p-4 sm:p-5">
                    <div className="border-white/12 bg-slate-950/72 rounded-[22px] border px-4 py-3 shadow-[0_16px_56px_rgba(2,6,23,0.42)] backdrop-blur-xl">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="mb-1 text-[10px] uppercase tracking-[0.34em] text-slate-400">
                            Feature Showcase
                          </p>
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className="truncate text-lg uppercase tracking-[0.08em] text-white sm:text-xl"
                              style={{
                                fontFamily:
                                  "var(--font-feature-showcase-display), var(--font-sans)",
                              }}
                            >
                              {activeBeat.label}
                            </span>
                            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.22em] text-slate-300">
                              {activeBeat.feature}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white/8 mt-3 h-1.5 overflow-hidden rounded-full">
                        <motion.div
                          className="h-full rounded-full bg-[linear-gradient(90deg,#38bdf8_0%,#f97316_55%,#f43f5e_100%)]"
                          style={{
                            width: `${Math.max(totalProgress, 0.02) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ) : null}
                <div className="relative h-full overflow-hidden">
                  {children}
                </div>
                <div className="absolute inset-0 z-20">{transitionOverlay}</div>
                <div
                  className={cn(
                    "pointer-events-none absolute inset-x-0 bottom-0 z-30",
                    isHero ? "p-4 sm:p-5" : "p-4 sm:p-6 lg:p-8",
                  )}
                >
                  {captionOverlay}
                </div>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
