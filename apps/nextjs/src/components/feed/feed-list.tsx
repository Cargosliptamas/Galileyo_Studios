'use client'

import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useTRPC } from "~/trpc/react";
import FeedCard from "./feed-card";
import { useInView } from "react-intersection-observer";
import { Fragment, useEffect, useState } from "react";
import type { FeedItem } from "@galileyo/api";
import { CommentsModalContext } from "~/hooks/use-comments-modal";
import CommentsModal from "./comments-modal";
import { Loader2 } from "lucide-react";

// import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
// import { useTRPC } from "~/trpc/react";

function getUniqueId(item: FeedItem) {
  const idPart = item.id ?? crypto.randomUUID();
  const createdAtPart = item.created_at ?? '';

  return `${item.type}-${idPart}-${createdAtPart}`;
}

export default function FeedList() {
  const trpc = useTRPC();
  const { ref, inView } = useInView();
  const [isOpen, setIsOpen] = useState(false);
  const [post, setPost] = useState<FeedItem | null>(null);

  const queryOptions = trpc.feed.getLatestNews.infiniteQueryOptions(
    { limit: 10, cursor: 1 }
  );

  const {
    data,
    error,
    status,
    isFetching,
    fetchNextPage,
    fetchPreviousPage,
    hasPreviousPage,
    hasNextPage,
    isFetchingPreviousPage,
    isFetchingNextPage,
  } = useSuspenseInfiniteQuery({
    ...queryOptions,
    getPreviousPageParam: (firstPage) => {
      // console.log('previousPage', firstPage);
      return firstPage.page - 1;
    },
    getNextPageParam: (lastPage) => {
      // console.log('nextPage', lastPage);
      return lastPage.page + 1;
    },
    initialPageParam: 1,
  });

  const handleOpenCommentsModal = (post: FeedItem) => {
    console.log('handleOpenCommentsModal', post);
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
        {/* <h1>Infinite Loading</h1> */}
        {status === 'pending' ? (
          <p>Loading...</p>
        ) : status === 'error' ? (
          <span>Error: {error?.message}</span>
        ) : (
          <>
            {/* <div>
              <button
                onClick={() => fetchPreviousPage()}
                disabled={!hasPreviousPage || isFetchingPreviousPage}
              >
                {isFetchingPreviousPage
                  ? 'Loading more...'
                  : hasPreviousPage
                    ? 'Load Older'
                    : 'Nothing more to load'}
              </button>
            </div> */}
            {data.pages.map((page) => (
              <Fragment key={page.page}>
                {page.list.map((item) => (
                  <FeedCard key={getUniqueId(item)} item={item} />
                ))}
              </Fragment>
            ))}
            <div>
              <button
                ref={ref}
                onClick={() => fetchNextPage()}
                disabled={!hasNextPage || isFetchingNextPage}
              >
                {isFetchingNextPage
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : hasNextPage
                    ? 'Load Newer'
                    : 'Nothing more to load'}
              </button>
            </div>
            <div>
              {isFetching && !isFetchingNextPage
                ? 'Background Updating...'
                : null}
            </div>
          </>
        )}
      </div>

      {
        post && (
          <CommentsModal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            post={post}
          />
        )
      }
    </CommentsModalContext.Provider>
  );
}