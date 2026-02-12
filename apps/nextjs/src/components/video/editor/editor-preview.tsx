"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";

import { cn } from "@galileyo/ui";
import { Button } from "@galileyo/ui/button";
import { Slider } from "@galileyo/ui/slider";

import type { TextOverlay, VideoFilter } from "~/hooks/use-video-processor";

interface EditorPreviewProps {
  src: string;
  startTime: number;
  endTime: number;
  speed: number;
  filter: VideoFilter;
  textOverlays: TextOverlay[];
  currentTime: number;
  onTimeUpdate: (time: number) => void;
  onDurationChange: (duration: number) => void;
  className?: string;
}

// CSS filter mapping for preview
const filterStyles: Record<VideoFilter, string> = {
  none: "",
  grayscale: "grayscale(100%)",
  sepia: "sepia(80%)",
  brightness: "brightness(1.2)",
  contrast: "contrast(1.3)",
  vignette: "", // Handled with overlay
  blur: "blur(2px)",
  sharpen: "contrast(1.1) brightness(1.05)",
};

export function EditorPreview({
  src,
  startTime,
  endTime,
  speed,
  filter,
  textOverlays,
  currentTime,
  onTimeUpdate,
  onDurationChange,
  className,
}: EditorPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [duration, setDuration] = useState(0);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle video metadata loaded
  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      const videoDuration = videoRef.current.duration;
      setDuration(videoDuration);
      onDurationChange(videoDuration);
    }
  }, [onDurationChange]);

  // Handle time update
  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      onTimeUpdate(time);

      // Loop within trim bounds
      if (time >= endTime) {
        videoRef.current.currentTime = startTime;
        if (isPlaying) {
          void videoRef.current.play();
        }
      }
    }
  }, [onTimeUpdate, startTime, endTime, isPlaying]);

  // Update playback rate when speed changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  }, [speed]);

  // Play/pause toggle
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      // Start from startTime if before it
      if (videoRef.current.currentTime < startTime) {
        videoRef.current.currentTime = startTime;
      }
      void videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, startTime]);

  // Handle play/pause events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, []);

  // Seek to specific time
  const _seekTo = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  }, []);

  // Skip forward/backward
  const skip = useCallback(
    (seconds: number) => {
      if (videoRef.current) {
        const newTime = Math.max(
          startTime,
          Math.min(endTime, videoRef.current.currentTime + seconds),
        );
        videoRef.current.currentTime = newTime;
      }
    },
    [startTime, endTime],
  );

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  // Update volume
  const handleVolumeChange = useCallback((value: number[]) => {
    if (videoRef.current && value[0] !== undefined) {
      videoRef.current.volume = value[0];
      setVolume(value[0]);
      setIsMuted(value[0] === 0);
    }
  }, []);

  // Get visible text overlays for current time
  const visibleOverlays = textOverlays.filter(
    (overlay) =>
      currentTime >= overlay.startTime && currentTime <= overlay.endTime,
  );

  return (
    <div className={cn("space-y-2", className)}>
      {/* Video container */}
      <div className="relative aspect-[9/16] max-h-[500px] overflow-hidden rounded-xl bg-black">
        {/* Video element */}
        <video
          ref={videoRef}
          src={src}
          className="h-full w-full object-contain"
          style={{ filter: filterStyles[filter] }}
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          playsInline
          onClick={togglePlay}
        />

        {/* Vignette overlay */}
        {filter === "vignette" && (
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(circle, transparent 50%, rgba(0,0,0,0.7) 100%)",
            }}
          />
        )}

        {/* Text overlays */}
        {visibleOverlays.map((overlay) => (
          <div
            key={overlay.id}
            className="pointer-events-none absolute"
            style={{
              left: `${overlay.x}%`,
              top: `${overlay.y}%`,
              transform: "translate(-50%, -50%)",
              fontSize: overlay.fontSize,
              color: overlay.fontColor,
              fontFamily: overlay.fontFamily,
              fontWeight: overlay.isBold ? "bold" : "normal",
              fontStyle: overlay.isItalic ? "italic" : "normal",
              textShadow: "0 2px 4px rgba(0,0,0,0.5)",
              whiteSpace: "pre-wrap",
              textAlign: "center",
            }}
          >
            {overlay.text}
          </div>
        ))}

        {/* Play button overlay */}
        {!isPlaying && (
          <div
            className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/30"
            onClick={togglePlay}
          >
            <div className="rounded-full bg-white/20 p-4 backdrop-blur-sm">
              <Play className="h-8 w-8 text-white" fill="white" />
            </div>
          </div>
        )}

        {/* Trim indicator */}
        {(currentTime < startTime || currentTime > endTime) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70">
            <span className="text-sm font-medium text-white">
              Outside trim range
            </span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 rounded-lg bg-slate-100 p-2 dark:bg-slate-800">
        {/* Skip back */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => skip(-5)}
        >
          <SkipBack className="h-4 w-4" />
        </Button>

        {/* Play/Pause */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={togglePlay}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>

        {/* Skip forward */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => skip(5)}
        >
          <SkipForward className="h-4 w-4" />
        </Button>

        {/* Time display */}
        <span className="min-w-[80px] text-center text-xs text-slate-500">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Volume */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={toggleMute}
        >
          {isMuted || volume === 0 ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </Button>
        <div className="w-20">
          <Slider
            value={[isMuted ? 0 : volume]}
            min={0}
            max={1}
            step={0.1}
            onValueChange={handleVolumeChange}
          />
        </div>

        {/* Speed indicator */}
        <span className="rounded bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
          {speed}x
        </span>
      </div>
    </div>
  );
}
