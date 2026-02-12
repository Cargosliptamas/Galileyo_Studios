"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { GitBranch, Layers } from "lucide-react";

import { cn } from "@galileyo/ui";
import { Avatar, AvatarFallback, AvatarImage } from "@galileyo/ui/avatar";

import { useTRPC } from "~/trpc/react";

interface DuetStitchBadgeProps {
  videoId: number;
  className?: string;
}

export function DuetStitchBadge({ videoId, className }: DuetStitchBadgeProps) {
  const trpc = useTRPC();

  const { data } = useQuery(
    trpc.video.getOriginalVideo.queryOptions({ videoId }),
  );

  if (!data?.isReaction || !data.original) {
    return null;
  }

  const isDuet = data.type === "duet";
  const Icon = isDuet ? Layers : GitBranch;
  const label = isDuet ? "Duet" : "Stitch";

  return (
    <Link
      href={`/videos?v=${data.original.id}`}
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "group flex items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 backdrop-blur-sm transition-colors hover:bg-black/60",
        className,
      )}
    >
      <Icon className="h-4 w-4 text-white" />
      <span className="text-xs text-white">{label} with</span>
      <Avatar className="h-5 w-5">
        {data.original.creator.image ? (
          <AvatarImage
            src={data.original.creator.image}
            alt={data.original.creator.name}
          />
        ) : null}
        <AvatarFallback className="text-[10px]">
          {data.original.creator.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <span className="text-xs font-medium text-white">
        @{data.original.creator.name.split(" ")[0]?.toLowerCase() ?? "user"}
      </span>
    </Link>
  );
}
