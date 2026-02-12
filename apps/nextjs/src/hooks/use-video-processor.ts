"use client";

import { useCallback, useState } from "react";

import { useFFmpeg } from "./use-ffmpeg";

export interface TextOverlay {
  id: string;
  text: string;
  x: number; // percentage position 0-100
  y: number; // percentage position 0-100
  startTime: number; // seconds
  endTime: number; // seconds
  fontSize: number;
  fontColor: string;
  fontFamily: string;
  isBold?: boolean;
  isItalic?: boolean;
}

export interface VideoEditOptions {
  trim?: {
    startTime: number;
    endTime: number;
  };
  speed?: number; // 0.25 - 3
  filter?: VideoFilter;
  textOverlays?: TextOverlay[];
}

export type VideoFilter =
  | "none"
  | "grayscale"
  | "sepia"
  | "brightness"
  | "contrast"
  | "vignette"
  | "blur"
  | "sharpen";

export interface VideoProcessorState {
  isProcessing: boolean;
  progress: number;
  currentStep: string;
  error: string | null;
}

export interface UseVideoProcessorReturn extends VideoProcessorState {
  processVideo: (file: File, options: VideoEditOptions) => Promise<Blob | null>;
  reset: () => void;
}

/**
 * Build FFmpeg filter complex string from edit options
 */
function buildFilterComplex(options: VideoEditOptions): string {
  const filters: string[] = [];

  // Speed adjustment
  if (options.speed && options.speed !== 1) {
    const pts = 1 / options.speed;
    filters.push(`setpts=${pts.toFixed(4)}*PTS`);
  }

  // Visual filters
  if (options.filter && options.filter !== "none") {
    switch (options.filter) {
      case "grayscale":
        filters.push("colorchannelmixer=.3:.4:.3:0:.3:.4:.3:0:.3:.4:.3");
        break;
      case "sepia":
        filters.push(
          "colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131",
        );
        break;
      case "brightness":
        filters.push("eq=brightness=0.1");
        break;
      case "contrast":
        filters.push("eq=contrast=1.3");
        break;
      case "vignette":
        filters.push("vignette=PI/4");
        break;
      case "blur":
        filters.push("boxblur=2:1");
        break;
      case "sharpen":
        filters.push("unsharp=5:5:1.0:5:5:0.0");
        break;
    }
  }

  // Text overlays
  if (options.textOverlays && options.textOverlays.length > 0) {
    for (const overlay of options.textOverlays) {
      // Escape special characters in text
      const escapedText = overlay.text
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/:/g, "\\:");

      // Convert percentage to expression
      const xExpr = `(w*${overlay.x / 100})`;
      const yExpr = `(h*${overlay.y / 100})`;

      // Build drawtext filter
      let drawtext = `drawtext=text='${escapedText}'`;
      drawtext += `:x=${xExpr}:y=${yExpr}`;
      drawtext += `:fontsize=${overlay.fontSize}`;
      drawtext += `:fontcolor=${overlay.fontColor}`;

      // Enable timing
      drawtext += `:enable='between(t,${overlay.startTime},${overlay.endTime})'`;

      filters.push(drawtext);
    }
  }

  return filters.join(",");
}

/**
 * Build audio filter string for speed changes
 */
function buildAudioFilter(speed: number): string {
  // atempo only accepts 0.5-2.0, so we chain multiple for extreme speeds
  if (speed === 1) return "";

  const filters: string[] = [];

  if (speed < 0.5) {
    // For very slow speeds, chain atempo filters
    let remaining = speed;
    while (remaining < 0.5) {
      filters.push("atempo=0.5");
      remaining *= 2;
    }
    if (remaining !== 1) {
      filters.push(`atempo=${remaining.toFixed(4)}`);
    }
  } else if (speed > 2) {
    // For very fast speeds, chain atempo filters
    let remaining = speed;
    while (remaining > 2) {
      filters.push("atempo=2.0");
      remaining /= 2;
    }
    if (remaining !== 1) {
      filters.push(`atempo=${remaining.toFixed(4)}`);
    }
  } else {
    filters.push(`atempo=${speed.toFixed(4)}`);
  }

  return filters.join(",");
}

/**
 * Hook for processing videos with FFmpeg.wasm
 */
export function useVideoProcessor(): UseVideoProcessorReturn {
  const ffmpeg = useFFmpeg();

  const [state, setState] = useState<VideoProcessorState>({
    isProcessing: false,
    progress: 0,
    currentStep: "",
    error: null,
  });

  const processVideo = useCallback(
    async (file: File, options: VideoEditOptions): Promise<Blob | null> => {
      setState({
        isProcessing: true,
        progress: 0,
        currentStep: "Loading FFmpeg...",
        error: null,
      });

      try {
        // Load FFmpeg if not already loaded
        if (!ffmpeg.isLoaded) {
          await ffmpeg.load();
        }

        setState((prev) => ({
          ...prev,
          progress: 10,
          currentStep: "Writing input file...",
        }));

        // Write input file
        const inputName = "input.mp4";
        const outputName = "output.mp4";

        await ffmpeg.writeFile(inputName, file);

        setState((prev) => ({
          ...prev,
          progress: 20,
          currentStep: "Processing video...",
        }));

        // Build FFmpeg command
        const args: string[] = ["-i", inputName];

        // Trim parameters
        if (options.trim) {
          args.push("-ss", options.trim.startTime.toString());
          const duration = options.trim.endTime - options.trim.startTime;
          args.push("-t", duration.toString());
        }

        // Video filters
        const videoFilter = buildFilterComplex(options);
        if (videoFilter) {
          args.push("-vf", videoFilter);
        }

        // Audio filters (for speed adjustment)
        if (options.speed && options.speed !== 1) {
          const audioFilter = buildAudioFilter(options.speed);
          if (audioFilter) {
            args.push("-af", audioFilter);
          }
        }

        // Output settings
        args.push(
          "-c:v",
          "libx264",
          "-preset",
          "fast",
          "-crf",
          "23",
          "-c:a",
          "aac",
          "-b:a",
          "128k",
          "-movflags",
          "+faststart",
          "-y",
          outputName,
        );

        // Execute FFmpeg
        await ffmpeg.exec(args);

        setState((prev) => ({
          ...prev,
          progress: 90,
          currentStep: "Reading output file...",
        }));

        // Read output file
        const outputData = await ffmpeg.readFile(outputName);
        const outputBytes =
          typeof outputData === "string"
            ? new TextEncoder().encode(outputData)
            : new Uint8Array(outputData);

        // Cleanup
        await ffmpeg.deleteFile(inputName);
        await ffmpeg.deleteFile(outputName);

        setState({
          isProcessing: false,
          progress: 100,
          currentStep: "Complete",
          error: null,
        });

        // Create blob
        return new Blob([outputBytes], { type: "video/mp4" });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Video processing failed";

        setState({
          isProcessing: false,
          progress: 0,
          currentStep: "",
          error: errorMessage,
        });

        return null;
      }
    },
    [ffmpeg],
  );

  const reset = useCallback(() => {
    setState({
      isProcessing: false,
      progress: 0,
      currentStep: "",
      error: null,
    });
  }, []);

  return {
    ...state,
    processVideo,
    reset,
  };
}
