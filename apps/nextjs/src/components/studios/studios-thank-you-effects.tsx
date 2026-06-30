"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface StudiosThankYouEffectsProps {
  sessionId: string;
  paid: boolean;
}

/**
 * Client-side companion to the thank-you page. When the purchase is confirmed
 * paid, it asks the server to set the signed studios_viewer cookie (cookies
 * cannot be set during a server component render). When the webhook has not
 * landed yet, it refreshes the page shortly so the confirmed state can appear
 * without the visitor doing anything.
 */
export function StudiosThankYouEffects({
  sessionId,
  paid,
}: StudiosThankYouEffectsProps) {
  const router = useRouter();

  useEffect(() => {
    if (paid) {
      void fetch("/api/viewer-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      return;
    }

    const timer = setTimeout(() => router.refresh(), 4000);
    return () => clearTimeout(timer);
  }, [paid, sessionId, router]);

  return null;
}
