"use client";

import { motion } from "motion/react";

import type { FeatureShowcaseBeat } from "./feature-showcase-data";

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function getAccentTokens(beat: FeatureShowcaseBeat) {
  switch (beat.transition.accent) {
    case "alert":
      return {
        glow: "rgba(248, 113, 113, 0.38)",
        line: "rgba(252, 165, 165, 0.62)",
        chip: "rgba(127, 29, 29, 0.45)",
      };
    case "map":
      return {
        glow: "rgba(56, 189, 248, 0.34)",
        line: "rgba(125, 211, 252, 0.64)",
        chip: "rgba(8, 47, 73, 0.45)",
      };
    case "video":
      return {
        glow: "rgba(56, 189, 248, 0.28)",
        line: "rgba(196, 181, 253, 0.62)",
        chip: "rgba(30, 41, 59, 0.52)",
      };
    case "private":
      return {
        glow: "rgba(244, 114, 182, 0.34)",
        line: "rgba(251, 207, 232, 0.68)",
        chip: "rgba(80, 7, 36, 0.44)",
      };
    case "chat":
      return {
        glow: "rgba(56, 189, 248, 0.3)",
        line: "rgba(125, 211, 252, 0.72)",
        chip: "rgba(8, 47, 73, 0.52)",
      };
    case "notification":
      return {
        glow: "rgba(248, 113, 113, 0.34)",
        line: "rgba(252, 165, 165, 0.72)",
        chip: "rgba(91, 33, 33, 0.5)",
      };
    default:
      return {
        glow: "rgba(56, 189, 248, 0.28)",
        line: "rgba(196, 181, 253, 0.62)",
        chip: "rgba(30, 41, 59, 0.52)",
      };
  }
}

export function FeatureShowcaseTransition({
  beat,
  phaseProgress,
  reducedMotion,
}: {
  beat: FeatureShowcaseBeat;
  phaseProgress: number;
  reducedMotion: boolean;
}) {
  const progress = clamp01(phaseProgress);
  const opacity = clamp01(1 - progress * 0.92);
  const scale = 0.94 + progress * 0.08;
  const verticalSweep = 100 - progress * 200;
  const horizontalSweep = -12 + progress * 24;
  const radarScale = 0.2 + progress * 1.15;
  const tokens = getAccentTokens(beat);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute inset-0"
        style={{
          opacity,
          background:
            "linear-gradient(180deg, rgba(2, 6, 23, 0.92) 0%, rgba(2, 6, 23, 0.44) 40%, rgba(2, 6, 23, 0.12) 100%)",
        }}
      />

      {beat.transition.style === "signal-reveal" && (
        <>
          <motion.div
            className="absolute inset-0"
            style={{
              opacity: opacity * 0.8,
              backgroundImage:
                "repeating-linear-gradient(180deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 2px, transparent 2px, transparent 12px)",
              transform: `translateY(${verticalSweep}%) scale(${scale})`,
            }}
          />
          <motion.div
            className="absolute left-0 right-0 h-px"
            style={{
              top: `${50 + horizontalSweep}%`,
              background: tokens.line,
              boxShadow: `0 0 24px ${tokens.glow}`,
              opacity,
            }}
          />
        </>
      )}

      {beat.transition.style === "radar-wipe" && (
        <>
          <motion.div
            className="absolute left-1/2 top-1/2 h-[44vw] max-h-[680px] w-[44vw] max-w-[680px] -translate-x-1/2 -translate-y-1/2 rounded-full border"
            style={{
              borderColor: tokens.line,
              boxShadow: `0 0 40px ${tokens.glow}`,
              opacity,
              transform: `translate(-50%, -50%) scale(${radarScale})`,
            }}
          />
          <motion.div
            className="absolute left-1/2 top-1/2 h-[60vw] max-h-[840px] w-[60vw] max-w-[840px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed"
            style={{
              borderColor: tokens.line,
              opacity: opacity * 0.45,
              transform: `translate(-50%, -50%) scale(${0.35 + progress})`,
            }}
          />
          <motion.div
            className="absolute left-1/2 top-1/2 h-px w-[45vw] max-w-[520px] origin-left"
            style={{
              background: tokens.line,
              boxShadow: `0 0 30px ${tokens.glow}`,
              opacity,
              transform: `translateY(-50%) rotate(${progress * 110}deg)`,
            }}
          />
        </>
      )}

      {beat.transition.style === "field-cut" && (
        <>
          <motion.div
            className="absolute inset-0"
            style={{
              opacity: clamp01(0.55 - progress),
              background:
                "radial-gradient(circle at center, rgba(255,255,255,0.55), rgba(255,255,255,0.12) 24%, transparent 42%)",
            }}
          />
          <motion.div
            className="absolute inset-0"
            style={{
              opacity,
              background:
                "linear-gradient(90deg, rgba(2,6,23,0.95) 0%, rgba(2,6,23,0.32) 38%, transparent 100%)",
              transform: `translateX(${(1 - progress) * -5}%)`,
            }}
          />
        </>
      )}

      {beat.transition.style === "gesture-carry" && (
        <>
          <motion.div
            className="absolute inset-x-[18%] top-0 h-[42%] rounded-b-[48px]"
            style={{
              opacity,
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.22), rgba(255,255,255,0.02))",
              transform: `translateY(${verticalSweep * -0.6}%)`,
              filter: "blur(2px)",
            }}
          />
          <motion.div
            className="absolute inset-x-0 h-[26%]"
            style={{
              top: `${progress * 74}%`,
              opacity: opacity * 0.8,
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.14), transparent)",
            }}
          />
        </>
      )}

      {beat.transition.style === "message-link" && (
        <>
          <motion.div
            className="absolute inset-y-0 right-0 w-[56%]"
            style={{
              opacity,
              background:
                "linear-gradient(270deg, rgba(2,6,23,0.9), rgba(2,6,23,0.22) 74%, transparent)",
              transform: `translateX(${(1 - progress) * 18}%)`,
            }}
          />
          <motion.div
            className="absolute left-[16%] top-[42%] h-px w-[40%] max-w-[420px]"
            style={{
              opacity,
              background: tokens.line,
              boxShadow: `0 0 28px ${tokens.glow}`,
              transform: `translateX(${(1 - progress) * -10}%)`,
            }}
          />
          <motion.div
            className="absolute left-[52%] top-[34%] h-12 w-28 rounded-[24px]"
            style={{
              opacity: opacity * 0.72,
              border: `1px solid ${tokens.line}`,
              background: "rgba(255,255,255,0.04)",
              transform: `translateX(${(1 - progress) * 12}%)`,
            }}
          />
          <motion.div
            className="absolute left-[60%] top-[49%] h-10 w-24 rounded-[22px]"
            style={{
              opacity: opacity * 0.82,
              background: tokens.line,
              transform: `translateX(${(1 - progress) * 16}%)`,
            }}
          />
        </>
      )}

      {beat.transition.style === "dossier-slide" && (
        <>
          <motion.div
            className="absolute inset-y-0 right-0 w-[58%]"
            style={{
              opacity,
              background:
                "linear-gradient(270deg, rgba(2,6,23,0.88), rgba(2,6,23,0.24) 70%, transparent)",
              transform: `translateX(${(1 - progress) * 22}%)`,
            }}
          />
          <motion.div
            className="absolute inset-y-[14%] right-[10%] w-px"
            style={{
              background: tokens.line,
              opacity,
              boxShadow: `0 0 24px ${tokens.glow}`,
            }}
          />
        </>
      )}

      {beat.transition.style === "alert-stack" && (
        <>
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="absolute right-[8%] h-24 w-[34%] max-w-[320px] rounded-[28px] border"
              style={{
                top: `${22 + index * 13}%`,
                opacity: opacity * (0.7 - index * 0.12),
                borderColor: tokens.line,
                background: "rgba(15, 23, 42, 0.45)",
                boxShadow: `0 0 28px ${tokens.glow}`,
                transform: `translateY(${(1 - progress) * (24 + index * 8)}px)`,
              }}
            />
          ))}
          <motion.div
            className="absolute right-[12%] top-[20%] h-3 w-3 rounded-full"
            style={{
              background: tokens.line,
              opacity,
              boxShadow: `0 0 16px ${tokens.glow}`,
              transform: `scale(${0.75 + progress * 0.5})`,
            }}
          />
          <motion.div
            className="absolute inset-x-0 top-0 h-[32%]"
            style={{
              opacity: opacity * 0.6,
              background:
                "linear-gradient(180deg, rgba(248,113,113,0.14), transparent)",
            }}
          />
        </>
      )}

      <motion.div
        className="absolute left-1/2 top-10 w-[min(92%,760px)] -translate-x-1/2 rounded-full border px-5 py-3 text-center text-[11px] uppercase tracking-[0.34em] text-white shadow-[0_20px_80px_rgba(3,7,18,0.55)] backdrop-blur-md sm:text-xs"
        style={{
          opacity,
          borderColor: tokens.line,
          background: tokens.chip,
          boxShadow: `0 18px 60px rgba(3,7,18,0.5), 0 0 30px ${tokens.glow}`,
        }}
      >
        {reducedMotion ? beat.label : beat.transition.label}
      </motion.div>
    </div>
  );
}
