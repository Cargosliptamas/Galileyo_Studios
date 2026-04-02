"use client";

import { Plus, Users } from "lucide-react";

import { cn } from "@galileyo/ui";
import { Button } from "@galileyo/ui/button";

export type VideoFeedType = "forYou" | "following";

export function VideoFeedControls({
  feedType,
  onFeedTypeChange,
  onUpload,
  compact = false,
  className,
}: {
  feedType: VideoFeedType;
  onFeedTypeChange: (next: VideoFeedType) => void;
  onUpload: () => void;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "pointer-events-auto flex items-center gap-3",
        compact && "flex-col items-stretch",
        className,
      )}
    >
      <div className="flex items-center gap-1 rounded-full border border-border/70 bg-muted/90 p-1 text-sm shadow-sm">
        <button
          type="button"
          onClick={() => onFeedTypeChange("forYou")}
          className={cn(
            "touch-manipulation rounded-full px-4 py-1.5 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            feedType === "forYou"
              ? "bg-primary text-primary-foreground"
              : "text-foreground hover:bg-accent",
          )}
        >
          For You
        </button>
        <button
          type="button"
          onClick={() => onFeedTypeChange("following")}
          className={cn(
            "flex touch-manipulation items-center gap-1.5 rounded-full px-4 py-1.5 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            feedType === "following"
              ? "bg-primary text-primary-foreground"
              : "text-foreground hover:bg-accent",
          )}
        >
          <Users className="h-4 w-4" aria-hidden="true" />
          Following
        </button>
      </div>

      <Button
        variant={compact ? "primary" : "ghost"}
        size={compact ? "md" : "sm"}
        className={cn(
          compact
            ? "justify-center rounded-2xl"
            : "text-foreground hover:bg-accent",
        )}
        aria-label="Upload video"
        onClick={onUpload}
      >
        <Plus
          className={cn("h-4 w-4", !compact && "mr-1")}
          aria-hidden="true"
        />
        <span>Upload</span>
      </Button>
    </div>
  );
}
