"use client";

import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { CommentsModalContext } from "~/hooks/use-comments-modal";
import {
  FEATURE_SHOWCASE_TOTAL_DURATION_MS,
  getFeatureShowcaseBeatState,
} from "./feature-showcase-data";
import { FeatureShowcaseStage } from "./feature-showcase-stage";
import { FeatureShowcaseSurface } from "./feature-showcase-surfaces";
import { FeatureShowcaseTransition } from "./feature-showcase-transition";

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  return prefersReducedMotion;
}

export function FeatureShowcaseExperience({
  variant = "standalone",
}: {
  variant?: "standalone" | "hero";
}) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const cycleStartRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const pausedAtRef = useRef(0);
  const elapsedRef = useRef(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    elapsedRef.current = elapsedMs;
  }, [elapsedMs]);

  useEffect(() => {
    setIsPlaying(!prefersReducedMotion);
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      pausedAtRef.current = elapsedRef.current;
      return;
    }

    const initialStart =
      typeof performance !== "undefined"
        ? performance.now() - pausedAtRef.current
        : 0;
    cycleStartRef.current = initialStart;

    const tick = (now: number) => {
      const start = cycleStartRef.current ?? now;
      const nextElapsed = (now - start) % FEATURE_SHOWCASE_TOTAL_DURATION_MS;
      startTransition(() => {
        setElapsedMs(nextElapsed);
      });
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isPlaying]);

  const beatState = useMemo(
    () => getFeatureShowcaseBeatState(elapsedMs),
    [elapsedMs],
  );
  const activeBeat = beatState.beat;

  const totalProgress = elapsedMs / FEATURE_SHOWCASE_TOTAL_DURATION_MS;

  return (
    <CommentsModalContext.Provider
      value={{
        handleOpenCommentsModal: () => {
          // Showcase mode keeps production feed visuals inert.
        },
      }}
    >
      <FeatureShowcaseStage
        variant={variant}
        activeBeat={activeBeat}
        totalProgress={totalProgress}
        captionOverlay={
          <AnimatePresence mode="wait">
            <motion.div
              key={activeBeat.id}
              initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 18 }}
              transition={{
                opacity: { duration: 0.28, ease: "easeOut" },
                y: { duration: 0.28, ease: "easeOut" },
              }}
              className={
                variant === "hero"
                  ? "mx-auto w-full max-w-[560px]"
                  : "mx-auto w-full max-w-[560px] md:mx-0"
              }
            >
              <div className="bg-slate-950/96 relative overflow-hidden rounded-[28px] border border-white/15 p-4 text-center shadow-[0_24px_80px_rgba(2,6,23,0.78)] ring-1 ring-black/35 backdrop-blur-xl sm:p-5 md:text-left">
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(15,23,42,0.98)_0%,rgba(2,6,23,0.96)_58%,rgba(8,47,73,0.88)_100%)]" />
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/20" />
                <div className="bg-cyan-400/8 pointer-events-none absolute inset-y-0 right-0 w-24 blur-2xl" />
                <div className="relative">
                  <div className="mb-3 flex items-center justify-between gap-4 md:justify-between">
                    <p className="text-[11px] uppercase tracking-[0.34em] text-slate-400">
                      {activeBeat.feature}
                    </p>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                      {Math.round(Math.max(beatState.beatProgress, 0) * 100)}%
                    </p>
                  </div>
                  <p className="text-2xl font-semibold text-white sm:text-3xl">
                    {activeBeat.caption}
                  </p>
                  <div className="bg-white/8 mt-4 h-px overflow-hidden rounded-full">
                    <motion.div
                      className="h-full bg-[linear-gradient(90deg,#38bdf8_0%,#f97316_55%,#f43f5e_100%)]"
                      style={{
                        width: `${Math.max(beatState.beatProgress, 0.04) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        }
        transitionOverlay={
          <AnimatePresence mode="wait">
            {beatState.isTransitioning ? (
              <motion.div
                key={activeBeat.id}
                className="h-full w-full"
                initial={{ opacity: prefersReducedMotion ? 0 : 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: prefersReducedMotion ? 0.18 : 0.24 }}
              >
                <FeatureShowcaseTransition
                  beat={activeBeat}
                  phaseProgress={beatState.phaseProgress}
                  reducedMotion={prefersReducedMotion}
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
        }
      >
        <FeatureShowcaseSurface
          beat={activeBeat}
          phase={beatState.phase}
          beatProgress={beatState.beatProgress}
          phaseProgress={beatState.phaseProgress}
          isTransitioning={beatState.isTransitioning}
        />
      </FeatureShowcaseStage>
    </CommentsModalContext.Provider>
  );
}
