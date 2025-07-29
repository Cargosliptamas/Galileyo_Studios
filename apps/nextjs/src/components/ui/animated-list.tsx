"use client";

import type { Transition } from "motion/react";
import type { ComponentPropsWithoutRef } from "react";
import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "@galileyo/ui";

export function AnimatedListItem({ children }: { children: React.ReactNode }) {
  const animations = {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1, originY: 0 },
    exit: { scale: 0, opacity: 0 },
    transition: { type: "spring", stiffness: 350, damping: 40 } as Transition,
  };

  return (
    <motion.div {...animations} layout className="mx-auto w-full">
      {children}
    </motion.div>
  );
}

export function CyclingAnimatedListItem({
  children,
}: {
  children: React.ReactNode;
}) {
  const animations = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.8, opacity: 0 },
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 30,
      duration: 0.8,
    } as Transition,
  };

  return (
    <motion.div {...animations} className="mx-auto w-full">
      {children}
    </motion.div>
  );
}

export interface AnimatedListProps extends ComponentPropsWithoutRef<"div"> {
  children: React.ReactNode;
  delay?: number;
}

export interface CyclingAnimatedListProps
  extends ComponentPropsWithoutRef<"div"> {
  children: React.ReactNode;
  delay?: number;
  autoPlay?: boolean;
}

export const CyclingAnimatedList = React.memo(
  ({
    children,
    className,
    delay = 4000,
    autoPlay = true,
    ...props
  }: CyclingAnimatedListProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const childrenArray = useMemo(
      () => React.Children.toArray(children),
      [children],
    );

    useEffect(() => {
      if (!autoPlay || childrenArray.length <= 1) return;

      const timeout = setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % childrenArray.length);
      }, delay);

      return () => clearTimeout(timeout);
    }, [currentIndex, delay, childrenArray.length, autoPlay]);

    const currentItem = useMemo(() => {
      return childrenArray[currentIndex];
    }, [currentIndex, childrenArray]);

    return (
      <div className={cn(`flex flex-col items-center`, className)} {...props}>
        <AnimatePresence mode="wait">
          <CyclingAnimatedListItem key={currentIndex}>
            {currentItem}
          </CyclingAnimatedListItem>
        </AnimatePresence>
      </div>
    );
  },
);

CyclingAnimatedList.displayName = "CyclingAnimatedList";

export const AnimatedList = React.memo(
  ({ children, className, delay = 1000, ...props }: AnimatedListProps) => {
    const [index, setIndex] = useState(0);
    const childrenArray = useMemo(
      () => React.Children.toArray(children),
      [children],
    );

    useEffect(() => {
      if (index < childrenArray.length - 1) {
        const timeout = setTimeout(() => {
          setIndex((prevIndex) => (prevIndex + 1) % childrenArray.length);
        }, delay);

        return () => clearTimeout(timeout);
      }
    }, [index, delay, childrenArray.length]);

    const itemsToShow = useMemo(() => {
      const result = childrenArray.slice(0, index + 1).reverse();
      return result;
    }, [index, childrenArray]);

    return (
      <div
        className={cn(`flex flex-col items-center gap-4`, className)}
        {...props}
      >
        <AnimatePresence>
          {itemsToShow.map((item) => (
            <AnimatedListItem key={(item as React.ReactElement).key}>
              {item}
            </AnimatedListItem>
          ))}
        </AnimatePresence>
      </div>
    );
  },
);

AnimatedList.displayName = "AnimatedList";
