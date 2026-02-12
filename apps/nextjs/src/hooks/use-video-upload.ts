"use client";

import { useCallback, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";

import {
  getVideoThumbnailProxyUrl,
  isVideoProxyEnabled,
} from "~/lib/video-proxy";
import { useTRPC } from "~/trpc/react";

export interface VideoUploadProgress {
  s3: number;
  mux: number;
  overall: number;
}

export type VideoUploadStatus =
  | "idle"
  | "preparing"
  | "uploading"
  | "processing"
  | "ready"
  | "error";

export interface VideoUploadState {
  status: VideoUploadStatus;
  progress: VideoUploadProgress;
  videoId: number | null;
  playbackId: string | null;
  thumbnailUrl: string | null;
  error: string | null;
  muxEnabled: boolean;
}

export interface UseVideoUploadOptions {
  onSuccess?: (videoId: number) => void;
  onError?: (error: string) => void;
  onProgress?: (progress: VideoUploadProgress) => void;
}

interface ProxyUploadResponse {
  videoId: number;
  status: "processing" | "ready";
}

interface UploadProxyInput {
  caption?: string;
  subscriptionId?: number;
}

interface UploadRequestInput {
  fileName: string;
  contentType: string;
  fileSize: number;
  caption?: string;
  subscriptionId?: number;
}

interface UploadUrlsResponse {
  videoId: number;
  muxEnabled: boolean;
  s3: { uploadUrl: string };
  mux?: { uploadId: string; uploadUrl: string } | null;
}

interface ConfirmUploadInput {
  videoId: number;
  s3Completed: boolean;
  muxUploadId?: string;
  bunnyVideoId?: string;
  subscriptionId?: number;
  userFeed?: "friends" | "public";
  caption?: string;
}

interface ThumbnailUploadRequestInput {
  videoId: number;
  fileName: string;
  contentType: string;
}

interface ThumbnailUploadUrlResponse {
  uploadUrl: string;
  publicUrl: string;
  key: string;
}

interface ConfirmThumbnailUploadInput {
  videoId: number;
  thumbnailUrl: string;
}

interface PollStatusResult {
  transcodingStatus?: "pending" | "processing" | "ready" | "errored";
  playbackId?: string | null;
  thumbnailUrl?: string | null;
}

export function useVideoUpload(options?: UseVideoUploadOptions) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const trpc = useTRPC() as unknown as { video: any };
  const uploadRequestsRef = useRef<XMLHttpRequest[]>([]);
  const cancelRef = useRef(false);

  const [state, setState] = useState<VideoUploadState>({
    status: "idle",
    progress: { s3: 0, mux: 0, overall: 0 },
    videoId: null,
    playbackId: null,
    thumbnailUrl: null,
    error: null,
    muxEnabled: false,
  });

  // Get upload URLs mutation (legacy direct-upload path)
  const getUploadUrlsMutation = useMutation<
    UploadUrlsResponse,
    Error,
    UploadRequestInput
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  >(trpc.video.getUploadUrls.mutationOptions() as never);

  // Confirm upload mutation (legacy direct-upload path)
  const confirmUploadMutation = useMutation<void, Error, ConfirmUploadInput>(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    trpc.video.confirmUpload.mutationOptions() as never,
  );

  const getThumbnailUploadUrlMutation = useMutation<
    ThumbnailUploadUrlResponse,
    Error,
    ThumbnailUploadRequestInput
  >(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    trpc.video.getThumbnailUploadUrl.mutationOptions() as never,
  );

  const confirmThumbnailUploadMutation = useMutation<
    { success: boolean; thumbnailUrl: string },
    Error,
    ConfirmThumbnailUploadInput
  >(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    trpc.video.confirmThumbnailUpload.mutationOptions() as never,
  );

  // Get status query (for polling)
  const getStatusMutation = useMutation(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    trpc.video.getStatus.queryOptions({ id: state.videoId ?? 0 }).queryFn
      ? {
          mutationFn: async (videoId: number) => {
            const response = await fetch(
              `/api/trpc/video.getStatus?input=${encodeURIComponent(JSON.stringify({ id: videoId }))}`,
            );
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const json = await response.json();
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
            return json.result?.data;
          },
        }
      : {},
  );

  const uploadWithProgress = useCallback(
    async (
      file: File,
      url: string,
      onProgress: (percent: number) => void,
    ): Promise<void> => {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        uploadRequestsRef.current.push(xhr);

        const cleanup = () => {
          uploadRequestsRef.current = uploadRequestsRef.current.filter(
            (request) => request !== xhr,
          );
        };

        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress(percent);
          }
        });

        xhr.addEventListener("load", () => {
          cleanup();
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener("error", () => {
          cleanup();
          reject(new Error("Upload failed - network error"));
        });

        xhr.addEventListener("abort", () => {
          cleanup();
          reject(new Error("Upload canceled"));
        });

        xhr.open("PUT", url);
        xhr.send(file);
      });
    },
    [],
  );

  const uploadViaProxy = useCallback(
    async (
      file: File,
      input: UploadProxyInput,
      onProgress: (percent: number) => void,
    ): Promise<ProxyUploadResponse> => {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        uploadRequestsRef.current.push(xhr);

        const cleanup = () => {
          uploadRequestsRef.current = uploadRequestsRef.current.filter(
            (request) => request !== xhr,
          );
        };

        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress(percent);
          }
        });

        xhr.addEventListener("load", () => {
          cleanup();

          if (xhr.status < 200 || xhr.status >= 300) {
            reject(new Error(`Upload failed with status ${xhr.status}`));
            return;
          }

          try {
            const response = JSON.parse(
              xhr.responseText,
            ) as Partial<ProxyUploadResponse>;

            if (
              typeof response.videoId !== "number" ||
              (response.status !== "processing" && response.status !== "ready")
            ) {
              reject(new Error("Invalid upload response"));
              return;
            }

            resolve(response as ProxyUploadResponse);
          } catch {
            reject(new Error("Invalid upload response"));
          }
        });

        xhr.addEventListener("error", () => {
          cleanup();
          reject(new Error("Upload failed - network error"));
        });

        xhr.addEventListener("abort", () => {
          cleanup();
          reject(new Error("Upload canceled"));
        });

        xhr.open("POST", "/api/videos/upload");
        xhr.setRequestHeader(
          "x-video-file-name",
          encodeURIComponent(file.name),
        );
        xhr.setRequestHeader("x-video-content-type", file.type || "video/mp4");
        xhr.setRequestHeader("x-video-file-size", String(file.size));

        if (input.caption) {
          xhr.setRequestHeader(
            "x-video-caption",
            encodeURIComponent(input.caption),
          );
        }

        if (input.subscriptionId) {
          xhr.setRequestHeader(
            "x-video-subscription-id",
            String(input.subscriptionId),
          );
        }

        xhr.send(file);
      });
    },
    [],
  );

  const uploadThumbnail = useCallback(
    async (videoId: number, thumbnailFile?: File | null): Promise<void> => {
      if (!thumbnailFile) return;
      if (!thumbnailFile.type.startsWith("image/")) return;

      try {
        const uploadUrlResponse =
          await getThumbnailUploadUrlMutation.mutateAsync({
            videoId,
            fileName: thumbnailFile.name,
            contentType: thumbnailFile.type,
          });

        await uploadWithProgress(
          thumbnailFile,
          uploadUrlResponse.uploadUrl,
          () => undefined,
        );

        await confirmThumbnailUploadMutation.mutateAsync({
          videoId,
          thumbnailUrl: uploadUrlResponse.publicUrl,
        });
      } catch (error) {
        console.error("Custom thumbnail upload failed:", error);
      }
    },
    [
      confirmThumbnailUploadMutation,
      getThumbnailUploadUrlMutation,
      uploadWithProgress,
    ],
  );

  const pollForReady = useCallback(
    async (videoId: number, maxAttempts = 60): Promise<void> => {
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        if (cancelRef.current) {
          return;
        }

        try {
          const status = (await getStatusMutation.mutateAsync(videoId)) as
            | PollStatusResult
            | undefined;

          if (status?.transcodingStatus === "ready") {
            setState((prev) => ({
              ...prev,
              status: "ready",
              playbackId: status.playbackId ?? null,
              thumbnailUrl: getVideoThumbnailProxyUrl(
                videoId,
                status.thumbnailUrl,
              ),
            }));
            return;
          }

          if (status?.transcodingStatus === "errored") {
            setState((prev) => ({
              ...prev,
              status: "error",
              error: "Video processing failed",
            }));
            options?.onError?.("Video processing failed");
            return;
          }

          await new Promise((resolve) => setTimeout(resolve, 3000));
        } catch (error) {
          console.error("Error polling status:", error);
        }
      }

      setState((prev) => ({
        ...prev,
        status: "error",
        error: "Video processing timed out",
      }));
      options?.onError?.("Video processing timed out");
    },
    [getStatusMutation, options],
  );

  const upload = useCallback(
    async (
      file: File,
      opts?: {
        caption?: string;
        subscriptionId?: number;
        thumbnailFile?: File | null;
      },
    ): Promise<number | null> => {
      cancelRef.current = false;
      setState({
        status: "preparing",
        progress: { s3: 0, mux: 0, overall: 0 },
        videoId: null,
        playbackId: null,
        thumbnailUrl: null,
        error: null,
        muxEnabled: false,
      });

      try {
        if (isVideoProxyEnabled()) {
          setState((prev) => ({ ...prev, status: "uploading" }));

          const uploadResponse = await uploadViaProxy(
            file,
            {
              caption: opts?.caption,
              subscriptionId: opts?.subscriptionId,
            },
            (percent) => {
              const progress = { s3: percent, mux: percent, overall: percent };
              setState((prev) => ({ ...prev, progress }));
              options?.onProgress?.(progress);
            },
          );

          const isProcessing = uploadResponse.status === "processing";

          setState((prev) => ({
            ...prev,
            videoId: uploadResponse.videoId,
            muxEnabled: isProcessing,
            status: isProcessing ? "processing" : "ready",
            thumbnailUrl: isProcessing
              ? null
              : getVideoThumbnailProxyUrl(uploadResponse.videoId, null),
          }));

          const thumbnailUploadPromise = uploadThumbnail(
            uploadResponse.videoId,
            opts?.thumbnailFile,
          );

          if (isProcessing) {
            await pollForReady(uploadResponse.videoId);
          }

          await thumbnailUploadPromise;

          options?.onSuccess?.(uploadResponse.videoId);
          return uploadResponse.videoId;
        }

        // Legacy direct upload path (kept for env-flag rollback and RN parity)
        const uploadUrls = await getUploadUrlsMutation.mutateAsync({
          fileName: file.name,
          contentType: file.type,
          fileSize: file.size,
          caption: opts?.caption,
          subscriptionId: opts?.subscriptionId,
        });

        const muxEnabled = uploadUrls.muxEnabled;

        setState((prev) => ({
          ...prev,
          status: "uploading",
          videoId: uploadUrls.videoId,
          muxEnabled,
        }));

        let s3Progress = 0;
        let muxProgress = muxEnabled ? 0 : 100;

        const updateOverallProgress = () => {
          const overall = muxEnabled
            ? Math.round((s3Progress + muxProgress) / 2)
            : s3Progress;
          const progress = { s3: s3Progress, mux: muxProgress, overall };
          setState((prev) => ({ ...prev, progress }));
          options?.onProgress?.(progress);
        };

        const uploadPromises: Promise<void>[] = [
          uploadWithProgress(file, uploadUrls.s3.uploadUrl, (percent) => {
            s3Progress = percent;
            updateOverallProgress();
          }),
        ];

        if (muxEnabled && uploadUrls.mux) {
          uploadPromises.push(
            uploadWithProgress(file, uploadUrls.mux.uploadUrl, (percent) => {
              muxProgress = percent;
              updateOverallProgress();
            }),
          );
        }

        await Promise.all(uploadPromises);

        await confirmUploadMutation.mutateAsync({
          videoId: uploadUrls.videoId,
          s3Completed: true,
          muxUploadId: uploadUrls.mux?.uploadId,
          subscriptionId: opts?.subscriptionId,
          caption: opts?.caption,
        });

        if (muxEnabled) {
          setState((prev) => ({ ...prev, status: "processing" }));
          await pollForReady(uploadUrls.videoId);
        } else {
          setState((prev) => ({ ...prev, status: "ready" }));
        }

        await uploadThumbnail(uploadUrls.videoId, opts?.thumbnailFile);

        options?.onSuccess?.(uploadUrls.videoId);
        return uploadUrls.videoId;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Upload failed";

        if (errorMessage === "Upload canceled") {
          setState((prev) => ({
            ...prev,
            status: "idle",
            error: null,
            progress: { s3: 0, mux: 0, overall: 0 },
          }));
          return null;
        }

        setState((prev) => ({
          ...prev,
          status: "error",
          error: errorMessage,
        }));
        options?.onError?.(errorMessage);
        return null;
      }
    },
    [
      options,
      uploadViaProxy,
      uploadThumbnail,
      pollForReady,
      getUploadUrlsMutation,
      uploadWithProgress,
      confirmUploadMutation,
    ],
  );

  const cancel = useCallback(() => {
    cancelRef.current = true;
    uploadRequestsRef.current.forEach((xhr) => xhr.abort());
    uploadRequestsRef.current = [];
    setState((prev) => ({
      ...prev,
      status: "idle",
      error: null,
      progress: { s3: 0, mux: 0, overall: 0 },
    }));
  }, []);

  const reset = useCallback(() => {
    cancelRef.current = false;
    setState({
      status: "idle",
      progress: { s3: 0, mux: 0, overall: 0 },
      videoId: null,
      playbackId: null,
      thumbnailUrl: null,
      error: null,
      muxEnabled: false,
    });
  }, []);

  return {
    ...state,
    upload,
    reset,
    cancel,
    isUploading: state.status === "uploading" || state.status === "preparing",
    isProcessing: state.status === "processing",
    isReady: state.status === "ready",
    isError: state.status === "error",
  };
}
