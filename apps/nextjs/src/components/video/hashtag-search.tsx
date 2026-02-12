"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Hash, Loader2, Search, X } from "lucide-react";

import { cn } from "@galileyo/ui";
import { Button } from "@galileyo/ui/button";
import { Input } from "@galileyo/ui/input";

import { useDebounce } from "~/hooks/use-debounce";
import { formatCount } from "~/lib/format";
import { useTRPC } from "~/trpc/react";

interface HashtagSearchProps {
  onSelect?: (hashtag: string) => void;
  className?: string;
}

export function HashtagSearch({ onSelect, className }: HashtagSearchProps) {
  const trpc = useTRPC();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 300);

  // Clean the query (remove # if present)
  const cleanQuery = debouncedQuery.startsWith("#")
    ? debouncedQuery.slice(1)
    : debouncedQuery;

  const { data, isLoading, error } = useQuery({
    ...trpc.video.searchHashtags.queryOptions({
      query: cleanQuery,
      limit: 20,
    }),
    enabled: cleanQuery.length > 0,
  });

  const handleClear = () => {
    setSearchQuery("");
  };

  const handleHashtagClick = (hashtag: string) => {
    if (onSelect) {
      onSelect(hashtag);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search Input */}
      <div className="relative">
        <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search hashtags..."
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
        {isLoading && cleanQuery && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Failed to search hashtags
          </div>
        )}

        {!isLoading && cleanQuery && data?.items.length === 0 && (
          <div className="py-8 text-center text-sm text-muted-foreground">
            <Hash className="mx-auto mb-2 h-8 w-8 opacity-50" />
            No hashtags found for &quot;{cleanQuery}&quot;
          </div>
        )}

        {data?.items.map((tag) => (
          <HashtagItem
            key={tag.id}
            tag={tag}
            onClick={onSelect ? () => handleHashtagClick(tag.name) : undefined}
          />
        ))}

        {!cleanQuery && (
          <div className="py-8 text-center text-sm text-muted-foreground">
            <Search className="mx-auto mb-2 h-8 w-8 opacity-50" />
            Search for hashtags
          </div>
        )}
      </div>
    </div>
  );
}

interface HashtagItemProps {
  tag: {
    id: number;
    name: string;
    videoCount: number;
    viewCount: number;
  };
  onClick?: () => void;
}

function HashtagItem({ tag, onClick }: HashtagItemProps) {
  const content = (
    <div className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
        <Hash className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1">
        <p className="font-medium">#{tag.name}</p>
        <p className="text-sm text-muted-foreground">
          {formatCount(tag.videoCount)} videos
          {tag.viewCount > 0 && (
            <span className="ml-2">{formatCount(tag.viewCount)} views</span>
          )}
        </p>
      </div>
    </div>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className="w-full text-left">
        {content}
      </button>
    );
  }

  return <Link href={`/videos/tag/${tag.name}`}>{content}</Link>;
}
