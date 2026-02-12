"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2, Music, TrendingUp } from "lucide-react";

import { cn } from "@galileyo/ui";
import { ScrollArea, ScrollBar } from "@galileyo/ui/scroll-area";

import { useTRPC } from "~/trpc/react";
import { SoundCard } from "./sound-card";

interface TrendingSoundsProps {
  limit?: number;
  className?: string;
  orientation?: "horizontal" | "vertical";
}

export function TrendingSounds({
  limit = 10,
  className,
  orientation = "horizontal",
}: TrendingSoundsProps) {
  const trpc = useTRPC();

  const { data, isLoading, error } = useQuery(
    trpc.video.getTrendingSounds.queryOptions({ limit }),
  );

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center py-8", className)}>
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cn(
          "py-8 text-center text-sm text-muted-foreground",
          className,
        )}
      >
        Failed to load trending sounds
      </div>
    );
  }

  if (!data?.items || data.items.length === 0) {
    return (
      <div
        className={cn(
          "py-8 text-center text-sm text-muted-foreground",
          className,
        )}
      >
        <Music className="mx-auto mb-2 h-8 w-8 opacity-50" />
        No trending sounds yet
      </div>
    );
  }

  if (orientation === "vertical") {
    return (
      <div className={cn("space-y-1", className)}>
        <div className="mb-4 flex items-center gap-2 px-3">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Trending Sounds</h3>
        </div>
        {data.items.map((sound) => (
          <SoundCard key={sound.id} sound={sound} showFavorite={true} />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2 px-4">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Trending Sounds</h3>
      </div>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-3 px-4 pb-4">
          {data.items.map((sound) => (
            <div key={sound.id} className="w-[200px] flex-shrink-0">
              <SoundCard sound={sound} showFavorite={false} />
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
