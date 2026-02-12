"use client";

import { useMemo } from "react";
import {
  Circle,
  Contrast,
  Droplet,
  Eye,
  Sparkles,
  Sun,
  Wand2,
} from "lucide-react";

import { cn } from "@galileyo/ui";

import type { VideoFilter } from "~/hooks/use-video-processor";

interface VideoFiltersProps {
  selectedFilter: VideoFilter;
  onFilterChange: (filter: VideoFilter) => void;
  thumbnailSrc?: string;
  className?: string;
}

interface FilterOption {
  id: VideoFilter;
  name: string;
  icon: React.ReactNode;
  cssFilter: string;
}

const filters: FilterOption[] = [
  {
    id: "none",
    name: "None",
    icon: <Circle className="h-4 w-4" />,
    cssFilter: "",
  },
  {
    id: "grayscale",
    name: "Grayscale",
    icon: <Circle className="h-4 w-4" />,
    cssFilter: "grayscale(100%)",
  },
  {
    id: "sepia",
    name: "Sepia",
    icon: <Droplet className="h-4 w-4" />,
    cssFilter: "sepia(80%)",
  },
  {
    id: "brightness",
    name: "Bright",
    icon: <Sun className="h-4 w-4" />,
    cssFilter: "brightness(1.2)",
  },
  {
    id: "contrast",
    name: "Contrast",
    icon: <Contrast className="h-4 w-4" />,
    cssFilter: "contrast(1.3)",
  },
  {
    id: "vignette",
    name: "Vignette",
    icon: <Eye className="h-4 w-4" />,
    cssFilter: "",
  },
  {
    id: "blur",
    name: "Blur",
    icon: <Sparkles className="h-4 w-4" />,
    cssFilter: "blur(2px)",
  },
  {
    id: "sharpen",
    name: "Sharpen",
    icon: <Wand2 className="h-4 w-4" />,
    cssFilter: "contrast(1.1) brightness(1.05)",
  },
];

export function VideoFilters({
  selectedFilter,
  onFilterChange,
  thumbnailSrc,
  className,
}: VideoFiltersProps) {
  // Generate a placeholder gradient if no thumbnail
  const placeholderGradient = useMemo(
    () => "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    [],
  );

  return (
    <div className={cn("space-y-3", className)}>
      <h3 className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
        <Wand2 className="h-4 w-4" />
        Filters
      </h3>

      <div className="grid grid-cols-4 gap-2">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={cn(
              "group relative flex flex-col items-center gap-1 rounded-lg p-2 transition-all",
              selectedFilter === filter.id
                ? "bg-cyan-500/10 ring-2 ring-cyan-500"
                : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700",
            )}
          >
            {/* Filter preview */}
            <div
              className="relative h-12 w-12 overflow-hidden rounded-lg"
              style={{
                background: thumbnailSrc
                  ? `url(${thumbnailSrc}) center/cover`
                  : placeholderGradient,
                filter: filter.cssFilter,
              }}
            >
              {/* Vignette overlay */}
              {filter.id === "vignette" && (
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(circle, transparent 30%, rgba(0,0,0,0.7) 100%)",
                  }}
                />
              )}

              {/* Selected checkmark */}
              {selectedFilter === filter.id && (
                <div className="absolute inset-0 flex items-center justify-center bg-cyan-500/30">
                  <div className="rounded-full bg-cyan-500 p-1">
                    <svg
                      className="h-3 w-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </div>

            {/* Filter name */}
            <span
              className={cn(
                "text-[10px] font-medium",
                selectedFilter === filter.id
                  ? "text-cyan-600 dark:text-cyan-400"
                  : "text-slate-500 dark:text-slate-400",
              )}
            >
              {filter.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
