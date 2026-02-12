"use client";

import { useCallback, useRef } from "react";
import { useMutation } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/react";

export function useRecordVideoView() {
  const trpc = useTRPC();
  const recordedVideoIdsRef = useRef<Set<number>>(new Set());
  const inFlightVideoIdsRef = useRef<Set<number>>(new Set());

  const recordViewMutation = useMutation(
    trpc.video.recordView.mutationOptions(),
  );

  const recordVideoView = useCallback(
    (videoId: number) => {
      if (!Number.isFinite(videoId) || videoId <= 0) {
        return;
      }

      if (
        recordedVideoIdsRef.current.has(videoId) ||
        inFlightVideoIdsRef.current.has(videoId)
      ) {
        return;
      }

      inFlightVideoIdsRef.current.add(videoId);

      recordViewMutation.mutate(
        { videoId },
        {
          onSuccess: () => {
            recordedVideoIdsRef.current.add(videoId);
            inFlightVideoIdsRef.current.delete(videoId);
          },
          onError: () => {
            inFlightVideoIdsRef.current.delete(videoId);
          },
        },
      );
    },
    [recordViewMutation],
  );

  return {
    recordVideoView,
  };
}
