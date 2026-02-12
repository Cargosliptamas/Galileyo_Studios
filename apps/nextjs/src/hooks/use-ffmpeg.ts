"use client";

import type { FFmpeg } from "@ffmpeg/ffmpeg";
import { useCallback, useRef, useState } from "react";

export interface UseFFmpegState {
  isLoaded: boolean;
  isLoading: boolean;
  progress: number;
  error: string | null;
}

export interface UseFFmpegReturn extends UseFFmpegState {
  load: () => Promise<void>;
  exec: (args: string[]) => Promise<void>;
  writeFile: (name: string, data: Uint8Array | File) => Promise<void>;
  readFile: (name: string) => Promise<Uint8Array>;
  deleteFile: (name: string) => Promise<void>;
  listFiles: () => Promise<string[]>;
  terminate: () => void;
}

/**
 * Hook for FFmpeg.wasm browser-based video processing
 *
 * Features:
 * - Lazy loads FFmpeg from CDN
 * - Tracks loading and processing progress
 * - Provides file I/O operations
 * - Handles cleanup
 */
export function useFFmpeg(): UseFFmpegReturn {
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const loadedRef = useRef(false);

  const [state, setState] = useState<UseFFmpegState>({
    isLoaded: false,
    isLoading: false,
    progress: 0,
    error: null,
  });

  /**
   * Load FFmpeg.wasm from CDN
   */
  const load = useCallback(async () => {
    if (loadedRef.current) {
      return;
    }

    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
      progress: 0,
    }));

    try {
      // Dynamically import FFmpeg to avoid SSR issues
      const { FFmpeg } = await import("@ffmpeg/ffmpeg");
      const { toBlobURL } = await import("@ffmpeg/util");

      const ffmpeg = new FFmpeg();

      // Set up progress handler
      ffmpeg.on("progress", ({ progress }) => {
        setState((prev) => ({ ...prev, progress: Math.round(progress * 100) }));
      });

      // Set up log handler for debugging
      ffmpeg.on("log", ({ message }) => {
        // eslint-disable-next-line no-restricted-properties
        if (process.env.NODE_ENV === "development") {
          console.log("[FFmpeg]", message);
        }
      });

      // Load FFmpeg core from CDN (uses jsDelivr by default)
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";

      await ffmpeg.load({
        coreURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.js`,
          "text/javascript",
        ),
        wasmURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.wasm`,
          "application/wasm",
        ),
      });

      ffmpegRef.current = ffmpeg;
      loadedRef.current = true;

      setState({
        isLoaded: true,
        isLoading: false,
        progress: 100,
        error: null,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load FFmpeg";

      // Check for SharedArrayBuffer support
      if (errorMessage.includes("SharedArrayBuffer")) {
        setState({
          isLoaded: false,
          isLoading: false,
          progress: 0,
          error:
            "Your browser doesn't support SharedArrayBuffer. Please use a modern browser with HTTPS.",
        });
      } else {
        setState({
          isLoaded: false,
          isLoading: false,
          progress: 0,
          error: errorMessage,
        });
      }
      throw error;
    }
  }, []);

  /**
   * Execute an FFmpeg command
   */
  const exec = useCallback(async (args: string[]) => {
    if (!ffmpegRef.current || !loadedRef.current) {
      throw new Error("FFmpeg not loaded. Call load() first.");
    }

    setState((prev) => ({ ...prev, progress: 0, error: null }));

    try {
      await ffmpegRef.current.exec(args);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "FFmpeg execution failed";
      setState((prev) => ({ ...prev, error: errorMessage }));
      throw error;
    }
  }, []);

  /**
   * Write a file to FFmpeg's virtual filesystem
   */
  const writeFile = useCallback(
    async (name: string, data: Uint8Array | File) => {
      if (!ffmpegRef.current || !loadedRef.current) {
        throw new Error("FFmpeg not loaded. Call load() first.");
      }

      const { fetchFile } = await import("@ffmpeg/util");

      if (data instanceof File) {
        const fileData = await fetchFile(data);
        await ffmpegRef.current.writeFile(name, fileData);
      } else {
        await ffmpegRef.current.writeFile(name, data);
      }
    },
    [],
  );

  /**
   * Read a file from FFmpeg's virtual filesystem
   */
  const readFile = useCallback(async (name: string): Promise<Uint8Array> => {
    if (!ffmpegRef.current || !loadedRef.current) {
      throw new Error("FFmpeg not loaded. Call load() first.");
    }

    const data = await ffmpegRef.current.readFile(name);
    return data as Uint8Array;
  }, []);

  /**
   * Delete a file from FFmpeg's virtual filesystem
   */
  const deleteFile = useCallback(async (name: string) => {
    if (!ffmpegRef.current || !loadedRef.current) {
      throw new Error("FFmpeg not loaded. Call load() first.");
    }

    await ffmpegRef.current.deleteFile(name);
  }, []);

  /**
   * List files in FFmpeg's virtual filesystem
   */
  const listFiles = useCallback(async (): Promise<string[]> => {
    if (!ffmpegRef.current || !loadedRef.current) {
      throw new Error("FFmpeg not loaded. Call load() first.");
    }

    const files = await ffmpegRef.current.listDir("/");
    return files.filter((f) => !f.isDir).map((f) => f.name);
  }, []);

  /**
   * Terminate FFmpeg and cleanup
   */
  const terminate = useCallback(() => {
    if (ffmpegRef.current) {
      ffmpegRef.current.terminate();
      ffmpegRef.current = null;
      loadedRef.current = false;
      setState({
        isLoaded: false,
        isLoading: false,
        progress: 0,
        error: null,
      });
    }
  }, []);

  return {
    ...state,
    load,
    exec,
    writeFile,
    readFile,
    deleteFile,
    listFiles,
    terminate,
  };
}
