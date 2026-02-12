"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Music, Search, X } from "lucide-react";

import { cn } from "@galileyo/ui";
import { Button } from "@galileyo/ui/button";
import { Input } from "@galileyo/ui/input";

import { useDebounce } from "~/hooks/use-debounce";
import { useTRPC } from "~/trpc/react";
import { SoundCard } from "./sound-card";

interface SoundSearchProps {
  onSelect?: (soundId: number) => void;
  className?: string;
}

export function SoundSearch({ onSelect, className }: SoundSearchProps) {
  const trpc = useTRPC();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 300);

  const { data, isLoading, error } = useQuery({
    ...trpc.video.searchSounds.queryOptions({
      query: debouncedQuery,
      limit: 20,
    }),
    enabled: debouncedQuery.length > 0,
  });

  const handleClear = () => {
    setSearchQuery("");
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search sounds..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 pr-9"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Search Results */}
      <div className="space-y-1">
        {isLoading && debouncedQuery && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Failed to search sounds
          </div>
        )}

        {!isLoading && debouncedQuery && data?.items.length === 0 && (
          <div className="py-8 text-center text-sm text-muted-foreground">
            <Music className="mx-auto mb-2 h-8 w-8 opacity-50" />
            No sounds found for &quot;{debouncedQuery}&quot;
          </div>
        )}

        {data?.items.map((sound) => (
          <div
            key={sound.id}
            onClick={() => onSelect?.(sound.id)}
            className={cn(onSelect && "cursor-pointer")}
          >
            <SoundCard sound={sound} showFavorite={!onSelect} />
          </div>
        ))}

        {!debouncedQuery && (
          <div className="py-8 text-center text-sm text-muted-foreground">
            <Search className="mx-auto mb-2 h-8 w-8 opacity-50" />
            Search for sounds by name or artist
          </div>
        )}
      </div>
    </div>
  );
}
