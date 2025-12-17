"use client";

import type { QueryFunction } from "@tanstack/react-query";
import type { TRPCQueryKey } from "@trpc/tanstack-react-query";
import { Fragment, useCallback, useEffect, useState } from "react";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";

import type { FeedItem } from "@galileyo/validators";

import type { ProfileInfo } from "~/lib/server/profile";
import { FEED_LIMIT } from "~/constants/feed";
import { CommentsModalContext } from "~/hooks/use-comments-modal";
import { getUniqueId } from "~/lib/feed";
import { useTRPC } from "~/trpc/react";
import CommentsModal from "../feed/comments-modal";
import FeedCard from "../feed/feed-card";
import FeedCardSkeleton from "../feed/feed-card-skeleton";
import ReportModal from "../feed/report-modal";

type Props = Pick<ProfileInfo, "id" | "type">;

export function InfluencerFeedList({ id, type }: Props) {
  const trpc = useTRPC();
  const { ref, inView } = useInView();

  const [isOpen, setIsOpen] = useState(false);
  const [post, setPost] = useState<FeedItem | null>(null);

  const queryOptions =
    trpc.feed.getNewsBySubscriptionOrFollowerList.infiniteQueryOptions({
      id,
      limit: FEED_LIMIT,
      skip_subscription_check: true,
      cursor: 1,
      type,
    });

  const {
    data,
    error,
    status,
    isFetching,
    fetchNextPage,
    // fetchPreviousPage,
    // hasPreviousPage,
    hasNextPage,
    // isFetchingPreviousPage,
    isFetchingNextPage,
  } = useSuspenseInfiniteQuery({
    queryKey: queryOptions.queryKey,
    queryFn: queryOptions.queryFn as QueryFunction<
      {
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

  const handleOpenCommentsModal = (post: FeedItem) => {
    setPost(post);
    setIsOpen(true);
  };

  const getQueryKeys = useCallback(
    () =>
      trpc.feed.getNewsBySubscriptionOrFollowerList.infiniteQueryKey({
        id,
        limit: FEED_LIMIT,
        type,
      }),
    [trpc, type, id],
  );

  const getQueryKeysOnError = useCallback(
    () =>
      trpc.feed.getNewsBySubscriptionOrFollowerList.infiniteQueryKey({
        id,
        limit: 100,
        type,
      }),
    [trpc, type, id],
  );

  useEffect(() => {
    if (inView) {
      void fetchNextPage();
    }
  }, [inView, fetchNextPage]);

  return (
    <CommentsModalContext.Provider value={{ handleOpenCommentsModal }}>
      <div className="space-y-4">
        {status === "error" ? (
          <span>Error: {error?.message}</span>
        ) : (
          <>
            {data.pages.map((page) => (
              <Fragment key={page.page}>
                {page.list.map((item) => (
                  <FeedCard
                    key={getUniqueId(item)}
                    item={item}
                    getQueryKeys={getQueryKeys}
                    getQueryKeysOnError={getQueryKeysOnError}
                  />
                ))}
              </Fragment>
            ))}
            <div className="grid w-full grid-cols-1 gap-4">
              <button
                ref={ref}
                onClick={() => fetchNextPage()}
                disabled={!hasNextPage || isFetchingNextPage}
              >
                {isFetchingNextPage ? (
                  <FeedCardSkeleton />
                ) : hasNextPage ? (
                  <FeedCardSkeleton />
                ) : (
                  ""
                )}
              </button>
            </div>
            <div>{isFetching && !isFetchingNextPage ? "Loading..." : null}</div>
          </>
        )}
      </div>

      {post && (
        <CommentsModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          post={post}
        />
      )}

      <ReportModal />
    </CommentsModalContext.Provider>
  );
}
