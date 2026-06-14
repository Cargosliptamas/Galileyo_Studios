"use client";

import type { Transition, Variants } from "motion/react";
import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

/**
 * Shared motion primitives for the Studios surface.
 *
 * Restraint first: every animation runs on transform and opacity only, and
 * everything degrades to opacity-only (no transform) under
 * prefers-reduced-motion. One source of truth for the spring and ease so the
 * whole label moves with a single voice.
 */

// cubic-bezier(0.16, 1, 0.3, 1)
export const STUDIOS_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const STUDIOS_SPRING: Transition = {
  type: "spring",
  stiffness: 360,
  damping: 30,
  mass: 1,
};

const STAGGER_STEP = 0.04;
const STAGGER_CAP = 8;

interface FadeUpProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Animate on mount (above the fold) instead of on scroll into view. */
  onMount?: boolean;
}

export function FadeUp({
  children,
  className,
  delay = 0,
  onMount = false,
}: FadeUpProps) {
  const reduce = useReducedMotion();
  const hidden = reduce ? { opacity: 0 } : { opacity: 0, y: 16 };
  const shown = reduce ? { opacity: 1 } : { opacity: 1, y: 0 };
  const transition: Transition = { duration: 0.2, ease: STUDIOS_EASE, delay };

  if (onMount) {
    return (
      <motion.div
        className={className}
        initial={hidden}
        animate={shown}
        transition={transition}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={className}
      initial={hidden}
      whileInView={shown}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}

interface StaggerProps {
  children: ReactNode;
  className?: string;
}

/**
 * Parent for a staggered list or grid. Propagates the "visible" label to its
 * StaggerItem children when it scrolls into view, once.
 */
export function Stagger({ children, className }: StaggerProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10% 0px" }}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
  index?: number;
}

/**
 * Item inside a Stagger. Entrances cascade at 40ms per item, capped at 8: items
 * past the cap enter together with the eighth.
 */
export function StaggerItem({
  children,
  className,
  index = 0,
}: StaggerItemProps) {
  const reduce = useReducedMotion();
  const delay = reduce ? 0 : Math.min(index, STAGGER_CAP - 1) * STAGGER_STEP;

  const variants: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      ...(reduce ? {} : { y: 0 }),
      transition: { duration: 0.2, ease: STUDIOS_EASE, delay },
    },
  };

  return (
    <motion.div className={className} variants={variants}>
      {children}
    </motion.div>
  );
}
