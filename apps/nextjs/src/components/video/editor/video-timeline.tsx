"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GripVertical, ZoomIn, ZoomOut } from "lucide-react";

import { cn } from "@galileyo/ui";
import { Button } from "@galileyo/ui/button";

interface VideoTimelineProps {
  duration: number;
  currentTime: number;
  startTime: number;
  endTime: number;
  onStartTimeChange: (time: number) => void;
  onEndTimeChange: (time: number) => void;
  onSeek: (time: number) => void;
  thumbnails?: string[];
  className?: string;
}

export function VideoTimeline({
  duration,
  currentTime,
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
  onSeek,
  thumbnails = [],
  className,
}: VideoTimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<
    "start" | "end" | "playhead" | null
  >(null);
  const [zoom, setZoom] = useState(1);

  // Format time as MM:SS.ms
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
  }, []);

  // Convert position to time
  const positionToTime = useCallback(
    (clientX: number): number => {
      if (!timelineRef.current) return 0;
      const rect = timelineRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      return (x / rect.width) * duration;
    },
    [duration],
  );

  // Handle mouse/touch events
  const handleMouseDown = useCallback(
    (type: "start" | "end" | "playhead") =>
      (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        setIsDragging(type);
      },
    [],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const clientX = "touches" in e ? e.touches[0]!.clientX : e.clientX;
      const time = positionToTime(clientX);

      if (isDragging === "start") {
        const newStart = Math.min(time, endTime - 0.1);
        onStartTimeChange(Math.max(0, newStart));
      } else if (isDragging === "end") {
        const newEnd = Math.max(time, startTime + 0.1);
        onEndTimeChange(Math.min(duration, newEnd));
      } else {
        onSeek(Math.max(startTime, Math.min(endTime, time)));
      }
    },
    [
      isDragging,
      positionToTime,
      startTime,
      endTime,
      duration,
      onStartTimeChange,
      onEndTimeChange,
      onSeek,
    ],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(null);
  }, []);

  // Add/remove event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleMouseMove);
      document.addEventListener("touchend", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleMouseMove);
      document.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Click on timeline to seek
  const handleTimelineClick = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) return;
      const time = positionToTime(e.clientX);
      if (time >= startTime && time <= endTime) {
        onSeek(time);
      }
    },
    [isDragging, positionToTime, startTime, endTime, onSeek],
  );

  // Calculate positions as percentages
  const startPercent = (startTime / duration) * 100;
  const endPercent = (endTime / duration) * 100;
  const playheadPercent = (currentTime / duration) * 100;

  // Generate time markers
  const timeMarkers = [];
  const markerInterval = duration > 60 ? 10 : duration > 30 ? 5 : 1;
  for (let i = 0; i <= duration; i += markerInterval) {
    timeMarkers.push(i);
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Zoom controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">
            Selection: {formatTime(startTime)} - {formatTime(endTime)}
          </span>
          <span className="text-xs text-slate-400">
            ({formatTime(endTime - startTime)})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setZoom(Math.max(1, zoom - 0.5))}
            disabled={zoom <= 1}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="w-12 text-center text-xs text-slate-500">
            {zoom}x
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setZoom(Math.min(4, zoom + 0.5))}
            disabled={zoom >= 4}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Time markers */}
      <div className="relative h-4" style={{ width: `${100 * zoom}%` }}>
        {timeMarkers.map((time) => (
          <div
            key={time}
            className="absolute top-0 flex flex-col items-center"
            style={{ left: `${(time / duration) * 100}%` }}
          >
            <div className="h-2 w-px bg-slate-300 dark:bg-slate-600" />
            <span className="text-[10px] text-slate-400">
              {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, "0")}
            </span>
          </div>
        ))}
      </div>

      {/* Timeline container */}
      <div
        ref={timelineRef}
        className="relative h-16 cursor-pointer overflow-hidden rounded-lg bg-slate-200 dark:bg-slate-700"
        style={{ width: `${100 * zoom}%` }}
        onClick={handleTimelineClick}
      >
        {/* Thumbnail strip */}
        {thumbnails.length > 0 && (
          <div className="absolute inset-0 flex">
            {thumbnails.map((thumb, i) => (
              <div
                key={i}
                className="h-full flex-1 bg-cover bg-center"
                style={{ backgroundImage: `url(${thumb})` }}
              />
            ))}
          </div>
        )}

        {/* Non-selected regions (darker) */}
        <div
          className="absolute inset-y-0 left-0 bg-black/50"
          style={{ width: `${startPercent}%` }}
        />
        <div
          className="absolute inset-y-0 right-0 bg-black/50"
          style={{ width: `${100 - endPercent}%` }}
        />

        {/* Selected region border */}
        <div
          className="absolute inset-y-0 border-y-2 border-cyan-500"
          style={{
            left: `${startPercent}%`,
            width: `${endPercent - startPercent}%`,
          }}
        />

        {/* Start handle */}
        <div
          className={cn(
            "absolute inset-y-0 z-10 flex w-4 cursor-ew-resize items-center justify-center bg-cyan-500",
            isDragging === "start" && "bg-cyan-600",
          )}
          style={{ left: `calc(${startPercent}% - 8px)` }}
          onMouseDown={handleMouseDown("start")}
          onTouchStart={handleMouseDown("start")}
        >
          <GripVertical className="h-4 w-4 text-white" />
        </div>

        {/* End handle */}
        <div
          className={cn(
            "absolute inset-y-0 z-10 flex w-4 cursor-ew-resize items-center justify-center bg-cyan-500",
            isDragging === "end" && "bg-cyan-600",
          )}
          style={{ left: `calc(${endPercent}% - 8px)` }}
          onMouseDown={handleMouseDown("end")}
          onTouchStart={handleMouseDown("end")}
        >
          <GripVertical className="h-4 w-4 text-white" />
        </div>

        {/* Playhead */}
        <div
          className={cn(
            "absolute inset-y-0 z-20 w-0.5 cursor-ew-resize bg-red-500",
            isDragging === "playhead" && "w-1 bg-red-600",
          )}
          style={{ left: `${playheadPercent}%` }}
          onMouseDown={handleMouseDown("playhead")}
          onTouchStart={handleMouseDown("playhead")}
        >
          {/* Playhead handle */}
          <div className="absolute -top-1 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-red-500" />
        </div>
      </div>

      {/* Time inputs for precise control */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-500">Start:</label>
          <input
            type="number"
            step="0.1"
            min="0"
            max={endTime - 0.1}
            value={startTime.toFixed(1)}
            onChange={(e) =>
              onStartTimeChange(Math.max(0, parseFloat(e.target.value) || 0))
            }
            className="w-20 rounded border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-500">End:</label>
          <input
            type="number"
            step="0.1"
            min={startTime + 0.1}
            max={duration}
            value={endTime.toFixed(1)}
            onChange={(e) =>
              onEndTimeChange(
                Math.min(duration, parseFloat(e.target.value) || duration),
              )
            }
            className="w-20 rounded border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800"
          />
        </div>
      </div>
    </div>
  );
}
