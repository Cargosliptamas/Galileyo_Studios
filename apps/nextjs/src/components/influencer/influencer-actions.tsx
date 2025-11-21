"use client";

import type { QueryFunction } from "@tanstack/react-query";
import type { TRPCQueryKey } from "@trpc/tanstack-react-query";
import { useCallback } from "react";
import {
  useQueryClient,
  useSuspenseInfiniteQuery,
} from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import type { FeedItem } from "@galileyo/validators";
import { Button } from "@galileyo/ui";

import type { ProfileInfo } from "~/lib/server/profile";
import { FEED_LIMIT } from "~/constants/feed";
import { useFeedSubscription } from "~/hooks/use-feed-subscription";
import { useTRPC } from "~/trpc/react";

type Props = Pick<ProfileInfo, "id" | "type"> & {
  isLoggedIn: boolean;
};

export function InfluencerActions({ id, isLoggedIn, type }: Props) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutation, setSubscription } = useFeedSubscription({
    onSuccess: async () => {
      await queryClient.invalidateQueries(trpc.feed.pathFilter());
    },
  });

  const queryOptions =
    trpc.feed.getNewsBySubscriptionOrFollowerList.infiniteQueryOptions({
      id,
      limit: FEED_LIMIT,
      cursor: 1,
      type,
    });

  const { data, isFetching } = useSuspenseInfiniteQuery({
    queryKey: queryOptions.queryKey,
    queryFn: queryOptions.queryFn as QueryFunction<
      {
        is_subscribe: boolean;
        list: FeedItem[];
        page: number;
        page_size: number;
      },
      TRPCQueryKey,
      number | null
    >,
    getPreviousPageParam: (firstPage, allPages, firstPageParam) => {
      if (firstPage.list.length === 0) {
        return null;
      }

      return firstPageParam - 1;
    },
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      if (lastPage.list.length === 0) {
        return null;
      }

      return lastPageParam + 1;
    },
    initialPageParam: 1,
  });

  const isSubscribed = data.pages[0]?.is_subscribe ?? false;

  const handleSubscription = useCallback(() => {
    setSubscription({
      id,
      subscribed: true,
    });
  }, [id, setSubscription]);

  const handleUnSubscribe = useCallback(() => {
    setSubscription({
      id,
      subscribed: false,
    });
  }, [id, setSubscription]);

  if (!isLoggedIn) {
    return null;
  }

  if (isFetching || mutation.isPending) {
    return (
      <Button disabled>
        <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
        ...
      </Button>
    );
  }

  return !isSubscribed ? (
    <Button onClick={handleSubscription}>Subscribe</Button>
  ) : (
    <Button variant="outline" onClick={handleUnSubscribe}>
      Unsubscribe
    </Button>
  );
}
