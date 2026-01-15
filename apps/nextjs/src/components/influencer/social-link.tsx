"use client";

import { useCallback } from "react";
import { Globe } from "lucide-react";

import { toast } from "@galileyo/ui/toast";

export function SocialLink({ link }: { link: string }) {
  const copyToClipboard = useCallback(() => {
    void navigator.clipboard.writeText(link);
    toast.success("Link copied to clipboard");
  }, [link]);

  return (
    <div
      className="flex cursor-pointer items-center gap-1.5 text-sm hover:underline"
      onClick={copyToClipboard}
    >
      <Globe className="h-3.5 w-3.5 flex-shrink-0" />
      <span className="truncate">{link}</span>
    </div>
  );
}
