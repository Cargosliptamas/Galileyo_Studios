"use client";

import type { QueryFunction } from "@tanstack/react-query";
import type { TRPCQueryKey } from "@trpc/tanstack-react-query";
import { Fragment, useCallback, useEffect, useState } from "react";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";

import type { BookmarkListType, FeedItem } from "@galileyo/validators";

import { CommentsModalContext } from "~/hooks/use-comments-modal";
import { getUniqueId } from "~/lib/feed";
import { useTRPC } from "~/trpc/react";
import CommentsModal from "./comments-modal";
import FeedCard from "./feed-card";
import FeedCardSkeleton from "./feed-card-skeleton";
import ReportModal from "./report-modal";

export function BookmarksList() {
  const trpc = useTRPC();
  const [isOpen, setIsOpen] = useState(false);
  const [post, setPost] = useState<FeedItem | null>(null);

  const { ref, inView } = useInView();

  const queryOptions = trpc.bookmark.list.infiniteQueryOptions({
    limit: 100,
    cursor: 1,
  });

  const {
    data,
    error,
    status,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useSuspenseInfiniteQuery({
    queryKey: queryOptions.queryKey,
    queryFn: queryOptions.queryFn as QueryFunction<
      BookmarkListType,
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

  const getQueryKeys = useCallback(
    () =>
      trpc.bookmark.list.infiniteQueryKey({
        limit: 100,
        cursor: 1,
      }),
    [trpc],
  );

  const getQueryKeysOnError = useCallback(
    () =>
      trpc.bookmark.list.infiniteQueryKey({
        limit: 100,
        cursor: 1,
      }),
    [trpc],
  );

  const handleOpenCommentsModal = (post: FeedItem) => {
    setPost(post);
    setIsOpen(true);
  };

  useEffect(() => {
    if (inView) {
      void fetchNextPage();
    }
  }, [inView, fetchNextPage]);

  return (
    <CommentsModalContext.Provider value={{ handleOpenCommentsModal }}>
      <div className="space-y-4">
        {status === "error" ? (
          <span>{error?.message ?? "Something went wrong"}</span>
        ) : (
          <>
            {data.pages.map((page) => (
              <Fragment key={page.page}>
                {page.list.map((bookmark) => (
                  <FeedCard
                    key={getUniqueId(bookmark.post)}
                    item={bookmark.post}
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
