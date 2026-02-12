"use client";

import type { TRPCClientErrorLike } from "@trpc/client";
import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";

import { toast } from "@galileyo/ui";

import { useTRPC } from "~/trpc/react";

interface HookParams {
  id: number;
  subscribed: boolean;
}

export function useFeedSubscription(props?: {
  onSuccess?: (isSubscribing: boolean) => void | Promise<void>;

  onError?: (
    isSubscribing: boolean,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    err: Error | TRPCClientErrorLike<any>,
  ) => void | Promise<void>;
}) {
  const trpc = useTRPC();
  const { onSuccess, onError } = props ?? {};

  const handleSubscrition = useMutation(
    trpc.feed.setSubscription.mutationOptions({
      onSuccess: async () => {
        // await queryClient.invalidateQueries(trpc.feed.pathFilter());
      },
      onError: () => {
        toast.error("Something went wrong. Please try again later.");
      },
    }),
  );

  const setSubscription = useCallback(
    ({ id, subscribed }: HookParams) => {
      handleSubscrition.mutate(
        {
          id,
          subscribed,
        },
        {
          onSuccess: () => void onSuccess?.(subscribed),
          onError: (err) => void onError?.(subscribed, err),
        },
      );
    },
    [handleSubscrition, onSuccess, onError],
  );

  return {
    mutation: handleSubscrition,
    setSubscription,
  };
}
