import { useCallback, useEffect, useState } from "react";

interface UseVideoMuteOptions {
  storageKey?: string;
  defaultMuted?: boolean;
}

export function useVideoMute(options?: UseVideoMuteOptions) {
  const storageKey = options?.storageKey ?? "galileyo-video-muted";
  const defaultMuted = options?.defaultMuted ?? true;

  const [isMuted, setIsMuted] = useState(() => {
    if (typeof window === "undefined") {
      return defaultMuted;
    }
    const saved = localStorage.getItem(storageKey);
    if (saved === null) {
      return defaultMuted;
    }
    return saved !== "false";
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(storageKey);
    if (saved === null) {
      return;
    }
    setIsMuted(saved !== "false");
  }, [storageKey]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      localStorage.setItem(storageKey, String(next));
      return next;
    });
  }, [storageKey]);

  const setMuted = useCallback(
    (next: boolean) => {
      setIsMuted(next);
      localStorage.setItem(storageKey, String(next));
    },
    [storageKey],
  );

  return { isMuted, toggleMute, setMuted };
}
