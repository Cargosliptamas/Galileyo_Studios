import type { RefObject } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseVideoScrollOptions {
  itemCount: number;
  initialIndex?: number;
  enableKeyboard?: boolean;
}

// Fallback debounce for browsers without `scrollend` support.
const SCROLL_SETTLE_DELAY_MS = 250;

const getPageHeight = (container: HTMLDivElement): number => {
  // Use the container's own height (stable `h-screen` / `h-full`) rather than
  // the first slide's height which uses `100dvh` and shifts on mobile when the
  // address bar toggles.
  if (container.clientHeight > 0) return container.clientHeight;
  return window.innerHeight || 1;
};

const clampIndex = (index: number, itemCount: number): number => {
  if (itemCount <= 0) return 0;
  return Math.max(0, Math.min(index, itemCount - 1));
};

export function useVideoScroll(
  containerRef: RefObject<HTMLDivElement | null>,
  options: UseVideoScrollOptions,
) {
  const { itemCount, initialIndex = 0, enableKeyboard = true } = options;
  const [activeIndex, setActiveIndexState] = useState(initialIndex);
  const activeIndexRef = useRef(initialIndex);
  const itemCountRef = useRef(itemCount);
  const scrollSettleTimeoutRef = useRef<number | null>(null);
  // When true, the next `syncActiveIndexFromScroll` invocation is suppressed so
  // that programmatic scrolls (keyboard nav, feed-type change, etc.) don't get
  // overridden by the scroll-settle handler.
  const isProgrammaticScrollRef = useRef(false);
  itemCountRef.current = itemCount;

  const setActiveIndex = useCallback(
    (value: number | ((previousIndex: number) => number)) => {
      setActiveIndexState((previousIndex) => {
        const nextIndex =
          typeof value === "function" ? value(previousIndex) : value;
        const clampedIndex = clampIndex(nextIndex, itemCountRef.current);
        activeIndexRef.current = clampedIndex;
        return clampedIndex;
      });
    },
    [],
  );

  useEffect(() => {
    itemCountRef.current = itemCount;
    setActiveIndex((previousIndex) => clampIndex(previousIndex, itemCount));
  }, [itemCount, setActiveIndex]);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  const scrollToIndex = useCallback(
    (index: number, behavior: ScrollBehavior = "smooth") => {
      const container = containerRef.current;
      if (!container) return;
      const pageHeight = getPageHeight(container);
      const targetIndex = clampIndex(index, itemCountRef.current);
      isProgrammaticScrollRef.current = true;
      container.scrollTo({ top: targetIndex * pageHeight, behavior });
    },
    [containerRef],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Only observe where the scroll settled and update activeIndex.
    // CSS `scroll-snap-stop: always` on each slide already prevents skipping
    // snap points, so we never need to call scrollTo here.
    const syncActiveIndexFromScroll = () => {
      // Skip sync when the scroll was triggered programmatically (e.g.
      // scrollToIndex) — the caller already set the correct activeIndex.
      if (isProgrammaticScrollRef.current) {
        isProgrammaticScrollRef.current = false;
        return;
      }

      const pageHeight = getPageHeight(container);
      const scrollTop = container.scrollTop;
      const settledIndex = clampIndex(
        Math.round(scrollTop / pageHeight),
        itemCountRef.current,
      );

      if (settledIndex !== activeIndexRef.current) {
        setActiveIndex(settledIndex);
      }
    };

    // Debounced fallback for browsers that don't support `scrollend`.
    const handleScroll = () => {
      if (scrollSettleTimeoutRef.current !== null) {
        window.clearTimeout(scrollSettleTimeoutRef.current);
      }

      scrollSettleTimeoutRef.current = window.setTimeout(() => {
        scrollSettleTimeoutRef.current = null;
        syncActiveIndexFromScroll();
      }, SCROLL_SETTLE_DELAY_MS);
    };

    // Prefer the native `scrollend` event — it fires only after all scrolling
    // (including CSS scroll-snap animations) has completely settled.
    const supportsScrollEnd = "onscrollend" in window;

    if (supportsScrollEnd) {
      container.addEventListener("scrollend", syncActiveIndexFromScroll);
    } else {
      container.addEventListener("scroll", handleScroll, { passive: true });
    }

    return () => {
      if (scrollSettleTimeoutRef.current !== null) {
        window.clearTimeout(scrollSettleTimeoutRef.current);
      }
      if (supportsScrollEnd) {
        container.removeEventListener("scrollend", syncActiveIndexFromScroll);
      } else {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, [containerRef, setActiveIndex]);

  useEffect(() => {
    if (!enableKeyboard) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const container = containerRef.current;
      if (!container) return;

      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        const nextIndex = clampIndex(
          activeIndexRef.current + 1,
          itemCountRef.current,
        );
        scrollToIndex(nextIndex);
        setActiveIndex(nextIndex);
      } else if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        const prevIndex = clampIndex(
          activeIndexRef.current - 1,
          itemCountRef.current,
        );
        scrollToIndex(prevIndex);
        setActiveIndex(prevIndex);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [containerRef, enableKeyboard, scrollToIndex, setActiveIndex]);

  return { activeIndex, setActiveIndex, scrollToIndex };
}
