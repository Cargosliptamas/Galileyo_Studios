"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import {
  ChevronLeft,
  ChevronRight,
  Gauge,
  GitBranch,
  Layers,
  Loader2,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";

import { cn } from "@galileyo/ui";

const DOUBLE_TAP_DELAY = 240;
const CONTROLS_HIDE_DELAY = 3000;
const SEEK_AMOUNT = 5; // seconds
const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;
type PlaybackRate = (typeof PLAYBACK_RATES)[number];

function isHlsPlaybackSource(src: string): boolean {
  if (src.endsWith(".m3u8")) {
    return true;
  }

  try {
    const url = new URL(
      src,
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost",
    );
    return url.searchParams.get("format") === "hls";
  } catch {
    return false;
  }
}

interface VideoPlayerProps {
  src: string;
  poster?: string;
  isActive: boolean;
  onViewStart?: () => void;
  isMuted?: boolean;
  playbackRate?: number;
  onDoubleTap?: () => void;
  onControlsVisibilityChange?: (visible: boolean) => void;
  onMuteToggle?: () => void;
  onPlaybackRateChange?: (rate: PlaybackRate) => void;
  className?: string;
  /** Original video source for duet/stitch */
  originalSrc?: string;
  /** Original video poster for duet/stitch */
  originalPoster?: string;
  /** Type of duet/stitch relationship */
  duetStitchType?: "duet" | "stitch" | null;
}

export function VideoPlayer({
  src,
  poster,
  isActive,
  onViewStart,
  isMuted = true,
  playbackRate = 1,
  onDoubleTap,
  onControlsVisibilityChange,
  onMuteToggle,
  onPlaybackRateChange,
  className,
  originalSrc,
  originalPoster,
  duetStitchType,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const originalVideoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [seekIndicator, setSeekIndicator] = useState<"left" | "right" | null>(
    null,
  );
  const [showPlayPause, setShowPlayPause] = useState(false);
  const lastTapRef = useRef<number>(0);
  const lastTapXRef = useRef<number>(0);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const seekIndicatorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const playPauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const originalHlsRef = useRef<Hls | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const onViewStartRef = useRef<(() => void) | undefined>(onViewStart);

  // Stitch phase: "original" plays the original video first, "response" plays the user's response
  const [stitchPhase, setStitchPhase] = useState<"original" | "response">(
    "original",
  );

  const isDuet = duetStitchType === "duet" && !!originalSrc;
  const isStitch = duetStitchType === "stitch" && !!originalSrc;

  const isHlsSource = isHlsPlaybackSource(src);
  const shouldUseHlsJs = isHlsSource && Hls.isSupported();
  const isOriginalHls = originalSrc ? isHlsPlaybackSource(originalSrc) : false;
  const shouldUseOriginalHlsJs = isOriginalHls && Hls.isSupported();

  useEffect(() => {
    onViewStartRef.current = onViewStart;
  }, [onViewStart]);

  // ── Autoplay when video becomes active ──────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    const originalVideo = originalVideoRef.current;
    if (!video) return;

    if (isActive) {
      onViewStartRef.current?.();

      // Reset stitch phase
      if (isStitch) {
        setStitchPhase("original");
      }

      video.currentTime = 0;
      if (originalVideo) {
        originalVideo.currentTime = 0;
      }

      if (isDuet) {
        // Duet: play both simultaneously
        void video
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
        if (originalVideo) {
          void originalVideo
            .play() // eslint-disable-next-line @typescript-eslint/no-empty-function
            .catch(() => {});
        }
      } else if (isStitch) {
        // Stitch: play original first
        if (originalVideo) {
          void originalVideo
            .play()
            .then(() => setIsPlaying(true))
            .catch(() => setIsPlaying(false));
        }
        // Don't play response video yet
      } else {
        // Normal: single video
        void video
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      }
    } else {
      video.pause();
      if (originalVideo) {
        originalVideo.pause();
      }
      setIsPlaying(false);
    }
  }, [isActive, isDuet, isStitch]);

  // ── HLS for main (response) video ──────────────────────────────────────
  // Dependencies include isDuet & isStitch so HLS re-attaches to the new
  // <video> element when the layout mode changes (React swaps DOM nodes).
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (!src) return;

    if (shouldUseHlsJs) {
      const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);
      return () => {
        hls.destroy();
        hlsRef.current = null;
      };
    }

    // Native HLS support (Safari)
    if (isHlsSource && video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    }
  }, [isHlsSource, shouldUseHlsJs, src, isDuet, isStitch]);

  // ── HLS for original video ─────────────────────────────────────────────
  useEffect(() => {
    const video = originalVideoRef.current;
    if (!video || !originalSrc) return;

    if (originalHlsRef.current) {
      originalHlsRef.current.destroy();
      originalHlsRef.current = null;
    }

    if (shouldUseOriginalHlsJs) {
      const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      originalHlsRef.current = hls;
      hls.loadSource(originalSrc);
      hls.attachMedia(video);
      return () => {
        hls.destroy();
        originalHlsRef.current = null;
      };
    }

    // Native HLS support (Safari)
    if (isOriginalHls && video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = originalSrc;
    }
  }, [isOriginalHls, shouldUseOriginalHlsJs, originalSrc, isDuet, isStitch]);

  // ── Stitch: transition from original to response video ─────────────────
  useEffect(() => {
    if (!isStitch) return;
    const originalVideo = originalVideoRef.current;
    const responseVideo = videoRef.current;
    if (!originalVideo || !responseVideo) return;

    const handleOriginalEnded = () => {
      setStitchPhase("response");
      responseVideo.currentTime = 0;
      void responseVideo
        .play() // eslint-disable-next-line @typescript-eslint/no-empty-function
        .catch(() => {});
    };

    const handleResponseEnded = () => {
      // Loop: go back to original
      setStitchPhase("original");
      originalVideo.currentTime = 0;
      void originalVideo
        .play() // eslint-disable-next-line @typescript-eslint/no-empty-function
        .catch(() => {});
    };

    originalVideo.addEventListener("ended", handleOriginalEnded);
    responseVideo.addEventListener("ended", handleResponseEnded);

    return () => {
      originalVideo.removeEventListener("ended", handleOriginalEnded);
      responseVideo.removeEventListener("ended", handleResponseEnded);
    };
  }, [isStitch]);

  // ── Duet: keep both videos in sync ─────────────────────────────────────
  useEffect(() => {
    if (!isDuet) return;
    const originalVideo = originalVideoRef.current;
    const responseVideo = videoRef.current;
    if (!originalVideo || !responseVideo) return;

    // When main video loops, reset original too
    const handleResponseLoop = () => {
      if (responseVideo.currentTime < 0.5) {
        originalVideo.currentTime = 0;
        if (!originalVideo.paused) return;
        void originalVideo
          .play() // eslint-disable-next-line @typescript-eslint/no-empty-function
          .catch(() => {});
      }
    };

    responseVideo.addEventListener("seeked", handleResponseLoop);
    return () => {
      responseVideo.removeEventListener("seeked", handleResponseLoop);
    };
  }, [isDuet]);

  // ── Progress tracking ──────────────────────────────────────────────────
  // Dependencies include isDuet & isStitch so listeners re-attach when
  // the layout mode changes (React creates new <video> DOM elements).
  useEffect(() => {
    const video = videoRef.current;
    const originalVideo = originalVideoRef.current;

    const handleTimeUpdate = () => {
      if (isStitch) {
        // Stitch: combined progress across both videos
        const origDuration = originalVideo?.duration ?? 0;
        const respDuration = video?.duration ?? 0;
        const totalDuration = origDuration + respDuration;

        if (totalDuration === 0 || isNaN(totalDuration)) {
          setProgress(0);
          return;
        }

        if (stitchPhase === "original" && originalVideo) {
          const p = (originalVideo.currentTime / totalDuration) * 100;
          setProgress(isNaN(p) ? 0 : p);
        } else if (video) {
          const p = ((origDuration + video.currentTime) / totalDuration) * 100;
          setProgress(isNaN(p) ? 0 : p);
        }
      } else if (video) {
        const p = (video.currentTime / video.duration) * 100;
        setProgress(isNaN(p) ? 0 : p);
      }
    };

    video?.addEventListener("timeupdate", handleTimeUpdate);
    originalVideo?.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      video?.removeEventListener("timeupdate", handleTimeUpdate);
      originalVideo?.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [isDuet, isStitch, stitchPhase]);

  // Notify parent when controls visibility changes
  useEffect(() => {
    onControlsVisibilityChange?.(showControls);
  }, [showControls, onControlsVisibilityChange]);

  // Always show controls when paused
  useEffect(() => {
    if (!isPlaying) {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    }
  }, [isPlaying]);

  // Show controls temporarily, then auto-hide after delay
  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, CONTROLS_HIDE_DELAY);
  }, [isPlaying]);

  // Show play/pause indicator
  const showPlayPauseIndicator = useCallback(() => {
    setShowPlayPause(true);
    if (playPauseTimeoutRef.current) {
      clearTimeout(playPauseTimeoutRef.current);
    }
    playPauseTimeoutRef.current = setTimeout(() => {
      setShowPlayPause(false);
    }, 600);
  }, []);

  // Show seek indicator
  const showSeekIndicator = useCallback((direction: "left" | "right") => {
    setSeekIndicator(direction);
    if (seekIndicatorTimeoutRef.current) {
      clearTimeout(seekIndicatorTimeoutRef.current);
    }
    seekIndicatorTimeoutRef.current = setTimeout(() => {
      setSeekIndicator(null);
    }, 500);
  }, []);

  // ── Play/pause helper that controls both videos ────────────────────────
  const playAll = useCallback(() => {
    const video = videoRef.current;
    const originalVideo = originalVideoRef.current;
    if (!video) return;

    if (isDuet) {
      void video
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
      if (originalVideo)
        void originalVideo
          .play() // eslint-disable-next-line @typescript-eslint/no-empty-function
          .catch(() => {});
    } else if (isStitch) {
      if (stitchPhase === "original" && originalVideo) {
        void originalVideo
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      } else {
        void video
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      }
    } else {
      void video
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  }, [isDuet, isStitch, stitchPhase]);

  const pauseAll = useCallback(() => {
    const video = videoRef.current;
    const originalVideo = originalVideoRef.current;
    video?.pause();
    originalVideo?.pause();
    setIsPlaying(false);
  }, []);

  // Handle tap/click with double-tap for seek or like
  const handleTap = useCallback(
    (e: React.MouseEvent) => {
      const now = Date.now();
      const timeSinceLastTap = now - lastTapRef.current;
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const tapX = e.clientX - rect.left;
      const containerWidth = rect.width;

      if (timeSinceLastTap < DOUBLE_TAP_DELAY) {
        // Double tap
        lastTapRef.current = 0;
        const video = videoRef.current;

        if (tapX < containerWidth * 0.35 && video) {
          // Double tap left side: seek -5s
          if (isStitch && stitchPhase === "original") {
            const orig = originalVideoRef.current;
            if (orig)
              orig.currentTime = Math.max(orig.currentTime - SEEK_AMOUNT, 0);
          } else {
            video.currentTime = Math.max(video.currentTime - SEEK_AMOUNT, 0);
          }
          showSeekIndicator("left");
        } else if (tapX > containerWidth * 0.65 && video) {
          // Double tap right side: seek +5s
          if (isStitch && stitchPhase === "original") {
            const orig = originalVideoRef.current;
            if (orig)
              orig.currentTime = Math.min(
                orig.currentTime + SEEK_AMOUNT,
                orig.duration,
              );
          } else {
            video.currentTime = Math.min(
              video.currentTime + SEEK_AMOUNT,
              video.duration,
            );
          }
          showSeekIndicator("right");
        } else {
          // Double tap center: like
          onDoubleTap?.();
        }
      } else {
        // Single tap - toggle play/pause
        lastTapRef.current = now;
        lastTapXRef.current = tapX;
        showControlsTemporarily();

        setTimeout(() => {
          if (
            Date.now() - lastTapRef.current >= DOUBLE_TAP_DELAY &&
            lastTapRef.current !== 0
          ) {
            if (isPlaying) {
              pauseAll();
              setShowControls(true);
            } else {
              playAll();
              showControlsTemporarily();
            }
            showPlayPauseIndicator();
          }
        }, DOUBLE_TAP_DELAY);
      }
    },
    [
      isPlaying,
      isStitch,
      stitchPhase,
      onDoubleTap,
      showControlsTemporarily,
      showPlayPauseIndicator,
      showSeekIndicator,
      playAll,
      pauseAll,
    ],
  );

  // Sync video muted state with prop
  useEffect(() => {
    const video = videoRef.current;
    const originalVideo = originalVideoRef.current;
    if (video) video.muted = isMuted;
    if (originalVideo) originalVideo.muted = isMuted;
  }, [isMuted, isDuet, isStitch]);

  // Sync playback rate with state
  useEffect(() => {
    const video = videoRef.current;
    const originalVideo = originalVideoRef.current;
    if (video) video.playbackRate = playbackRate;
    if (originalVideo) originalVideo.playbackRate = playbackRate;
  }, [playbackRate, isDuet, isStitch]);

  // Handle progress bar interaction
  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      const video = videoRef.current;
      const originalVideo = originalVideoRef.current;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = x / rect.width;

      if (isStitch && originalVideo && video) {
        const origDuration = originalVideo.duration || 0;
        const respDuration = video.duration || 0;
        const totalDuration = origDuration + respDuration;
        const seekTime = percentage * totalDuration;

        if (seekTime <= origDuration) {
          // Seek within original video
          setStitchPhase("original");
          originalVideo.currentTime = seekTime;
          video.pause();
          void originalVideo
            .play() // eslint-disable-next-line @typescript-eslint/no-empty-function
            .catch(() => {});
        } else {
          // Seek within response video
          setStitchPhase("response");
          video.currentTime = seekTime - origDuration;
          originalVideo.pause();
          void video
            .play() // eslint-disable-next-line @typescript-eslint/no-empty-function
            .catch(() => {});
        }
      } else if (video) {
        video.currentTime = percentage * video.duration;
      }
    },
    [isStitch],
  );

  // ── Render ─────────────────────────────────────────────────────────────

  // Build the video area based on mode
  const renderVideos = () => {
    if (isDuet) {
      // Side-by-side layout
      return (
        <div className="flex h-full w-full gap-1 overflow-hidden rounded-lg">
          {/* Original video (left) */}
          <div className="relative h-full w-1/2">
            <video
              ref={originalVideoRef}
              src={shouldUseOriginalHlsJs ? undefined : originalSrc}
              poster={originalPoster}
              className="h-full w-full object-cover"
              loop
              muted={isMuted}
              playsInline
              preload="metadata"
              crossOrigin="anonymous"
            />
            <div className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
              Original
            </div>
          </div>
          {/* Response video (right) */}
          <div className="relative h-full w-1/2">
            <video
              ref={videoRef}
              src={shouldUseHlsJs ? undefined : src}
              poster={poster}
              className="h-full w-full object-cover"
              loop
              muted={isMuted}
              playsInline
              preload="metadata"
              onLoadStart={() => setIsBuffering(true)}
              onWaiting={() => setIsBuffering(true)}
              onCanPlay={() => setIsBuffering(false)}
              onPlaying={() => setIsBuffering(false)}
              crossOrigin="anonymous"
            />
            <div className="absolute bottom-1 right-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
              Duet
            </div>
          </div>
        </div>
      );
    }

    if (isStitch) {
      // Stitch: CSS grid to stack both videos in the same cell (avoids absolute positioning layout collapse)
      return (
        <div
          className="relative grid h-full w-full overflow-hidden rounded-lg"
          style={{ gridTemplate: "1fr / 1fr" }}
        >
          {/* Original video */}
          <video
            ref={originalVideoRef}
            src={shouldUseOriginalHlsJs ? undefined : originalSrc}
            poster={originalPoster}
            className={cn(
              "h-full w-full object-contain transition-opacity duration-300",
              stitchPhase === "original"
                ? "opacity-100"
                : "pointer-events-none opacity-0",
            )}
            style={{ gridArea: "1 / 1" }}
            muted={isMuted}
            playsInline
            preload="metadata"
            onLoadStart={() => {
              if (stitchPhase === "original") setIsBuffering(true);
            }}
            onWaiting={() => {
              if (stitchPhase === "original") setIsBuffering(true);
            }}
            onCanPlay={() => {
              if (stitchPhase === "original") setIsBuffering(false);
            }}
            onPlaying={() => {
              if (stitchPhase === "original") setIsBuffering(false);
            }}
            crossOrigin="anonymous"
          />
          {/* Response video */}
          <video
            ref={videoRef}
            src={shouldUseHlsJs ? undefined : src}
            poster={poster}
            className={cn(
              "h-full w-full object-contain transition-opacity duration-300",
              stitchPhase === "response"
                ? "opacity-100"
                : "pointer-events-none opacity-0",
            )}
            style={{ gridArea: "1 / 1" }}
            muted={isMuted}
            playsInline
            preload="metadata"
            onLoadStart={() => {
              if (stitchPhase === "response") setIsBuffering(true);
            }}
            onWaiting={() => {
              if (stitchPhase === "response") setIsBuffering(true);
            }}
            onCanPlay={() => {
              if (stitchPhase === "response") setIsBuffering(false);
            }}
            onPlaying={() => {
              if (stitchPhase === "response") setIsBuffering(false);
            }}
            crossOrigin="anonymous"
          />
          {/* Phase indicator */}
          <div className="absolute bottom-8 left-2 z-10 rounded bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white">
            {stitchPhase === "original" ? "Original" : "Stitch"}
          </div>
        </div>
      );
    }

    // Normal single video
    return (
      <video
        ref={videoRef}
        src={shouldUseHlsJs ? undefined : src}
        poster={poster}
        className="h-full w-full rounded-lg object-contain"
        loop
        muted={isMuted}
        playsInline
        preload="metadata"
        onLoadStart={() => setIsBuffering(true)}
        onWaiting={() => setIsBuffering(true)}
        onCanPlay={() => setIsBuffering(false)}
        onPlaying={() => setIsBuffering(false)}
        crossOrigin="anonymous"
      />
    );
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative h-full w-full bg-black p-2 sm:p-4", className)}
      onClick={handleTap}
      onMouseMove={showControlsTemporarily}
    >
      {renderVideos()}

      {/* Duet/Stitch type badge */}
      {(isDuet || isStitch) && (
        <div className="absolute left-2 top-12 z-10 flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 backdrop-blur-sm sm:left-4 sm:top-14">
          {isDuet ? (
            <Layers className="h-3 w-3 text-white" />
          ) : (
            <GitBranch className="h-3 w-3 text-white" />
          )}
          <span className="text-[10px] font-medium text-white">
            {isDuet ? "Duet" : "Stitch"}
          </span>
        </div>
      )}

      {/* Top controls bar - mute & speed */}
      <div
        className={cn(
          "pointer-events-none absolute left-2 right-2 top-14 z-10 flex items-center justify-between transition-opacity duration-200 sm:left-4 sm:right-4 sm:top-4",
          showControls ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onMuteToggle}
          className="pointer-events-auto flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 backdrop-blur-sm transition-colors hover:bg-black/60"
          aria-label={isMuted ? "Unmute video" : "Mute video"}
        >
          {isMuted ? (
            <VolumeX className="h-4 w-4 text-white" />
          ) : (
            <Volume2 className="h-4 w-4 text-white" />
          )}
        </button>
        <button
          onClick={() => {
            const currentIndex = PLAYBACK_RATES.indexOf(
              playbackRate as PlaybackRate,
            );
            const nextIndex = (currentIndex + 1) % PLAYBACK_RATES.length;
            const nextRate = PLAYBACK_RATES[nextIndex];
            if (nextRate !== undefined) onPlaybackRateChange?.(nextRate);
          }}
          className={cn(
            "pointer-events-auto flex items-center gap-1.5 rounded-full px-3 py-1.5 backdrop-blur-sm transition-colors",
            playbackRate !== 1
              ? "bg-cyan-500/30 hover:bg-cyan-500/50"
              : "bg-black/40 hover:bg-black/60",
          )}
          aria-label={`Playback speed: ${playbackRate}x`}
        >
          <Gauge className="h-4 w-4 text-white" />
          <span className="text-xs font-medium text-white">
            {playbackRate}x
          </span>
        </button>
      </div>

      {/* Buffering spinner */}
      {isBuffering && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="rounded-full bg-black/40 p-3">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        </div>
      )}

      {/* Animated play/pause indicator (center) */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-200",
          showPlayPause ? "opacity-100" : "opacity-0",
        )}
      >
        <div className="rounded-full bg-black/50 p-4 duration-200 animate-in fade-in zoom-in-50">
          {isPlaying ? (
            <Play className="h-10 w-10 text-white" />
          ) : (
            <Pause className="h-10 w-10 text-white" />
          )}
        </div>
      </div>

      {/* Seek indicator - left */}
      <div
        className={cn(
          "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 transition-opacity duration-200",
          seekIndicator === "left" ? "opacity-100" : "opacity-0",
        )}
      >
        <div className="flex items-center gap-1 rounded-full bg-black/50 px-3 py-2 duration-200 animate-in slide-in-from-right-2">
          <ChevronLeft className="h-5 w-5 text-white" />
          <span className="text-sm font-medium text-white">{SEEK_AMOUNT}s</span>
        </div>
      </div>

      {/* Seek indicator - right */}
      <div
        className={cn(
          "pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 transition-opacity duration-200",
          seekIndicator === "right" ? "opacity-100" : "opacity-0",
        )}
      >
        <div className="flex items-center gap-1 rounded-full bg-black/50 px-3 py-2 duration-200 animate-in slide-in-from-left-2">
          <span className="text-sm font-medium text-white">{SEEK_AMOUNT}s</span>
          <ChevronRight className="h-5 w-5 text-white" />
        </div>
      </div>

      {/* Progress bar - thin line at bottom, always visible, expands on hover */}
      <div
        className="group absolute bottom-0 left-0 right-0 z-20 cursor-pointer pb-0 pt-4"
        onClick={handleProgressClick}
        onPointerDown={(e) => e.stopPropagation()}
        role="progressbar"
        aria-label="Video progress"
        aria-valuenow={progress}
      >
        <div className="h-1 bg-white/20 transition-all duration-200 group-hover:h-2.5">
          <div
            className="h-full rounded-r-full bg-white transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
