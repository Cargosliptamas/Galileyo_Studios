"use client";

import { useCallback } from "react";
import { Globe } from "lucide-react";

import { toast } from "@galileyo/ui/toast";

export function SocialLink({ link }: { link: string }) {
  const copyToClipboard = useCallback(() => {
    void navigator.clipboard.writeText(link);
    toast.success("Link copied to clipboard");
  }, [link]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        copyToClipboard();
      }
    },
    [copyToClipboard],
  );

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Copy link: ${link}`}
      className="flex cursor-pointer items-center gap-1.5 rounded-sm text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
      onClick={copyToClipboard}
      onKeyDown={handleKeyDown}
    >
      <Globe className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
      <span className="truncate">{link}</span>
    </div>
  );
}
