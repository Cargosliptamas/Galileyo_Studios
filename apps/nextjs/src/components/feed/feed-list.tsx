"use client";

import type { QueryFunction } from "@tanstack/react-query";
import type { TRPCQueryKey } from "@trpc/tanstack-react-query";
import { Fragment, useCallback, useEffect, useState } from "react";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";

import type { FeedItem } from "@galileyo/api/schemas";

// import { Button } from "@galileyo/ui/button";

import { FEED_LIMIT } from "~/constants/feed";
import { CommentsModalContext } from "~/hooks/use-comments-modal";
import { getUniqueId } from "~/lib/feed";
import { useTRPC } from "~/trpc/react";
import CommentsModal from "./comments-modal";
import FeedCard from "./feed-card";
import FeedCardSkeleton from "./feed-card-skeleton";
import ReportModal from "./report-modal";

// import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
// import { useTRPC } from "~/trpc/react";

// const MockedFeeds: InfluencerItem[] = [
//   {
//     id: 2,
//     title: "Emergency Alert System",
//     image:
//       "https://images.pexels.com/photos/355952/pexels-photo-355952.jpeg?auto=compress&cs=tinysrgb&w=100",
//     subtitle:
//       "Severe storm system approaching Pacific Northwest. Cellular towers may experience disruptions. Satellite communication remains fully operational. Stay safe and stay connected.",
//     url: "https://www.google.com",
//     id_subscription: 1,
//     body: "WEATHER ALERT: Severe storm system approaching Pacific Northwest. Cellular towers may experience disruptions. Satellite communication remains fully operational. Stay safe and stay connected.",
//     created_at: "4 hours ago",
//     reactions: [
//       {
//         id: "1",
//         cnt: 1200,
//         selected: true,
//       },
//       {
//         id: "2",
//         cnt: 100,
//         selected: false,
//       },
//     ],
//     images: [
//       {
//         id: 1,
//         sizes: [
//           {
//             type: "normal",
//             url: "https://images.pexels.com/photos/1252890/pexels-photo-1252890.jpeg?auto=compress&cs=tinysrgb&w=800",
//             width: 800,
//             height: 600,
//             name: "normal",
//           },
//         ],
//       },
//     ],
//     comment_quantity: 0,
//     type: "emergency",
//     emergency_level: "high",
//     location: "Global HQ",
//     is_liked: false,
//     is_bookmarked: true,
//   },
//   {
//     id: 4,
//     title: "Galileyo Network",
//     image:
//       "https://images.pexels.com/photos/586063/pexels-photo-586063.jpeg?auto=compress&cs=tinysrgb&w=100",
//     subtitle:
//       "Successfully deployed 12 new satellites to improve coverage over South America and Africa. Signal strength increased by 35% in these regions. The future of global connectivity is here! 🛰️",
//     url: "https://www.google.com",
//     id_subscription: 1,
//     body: "NETWORK UPDATE: Successfully deployed 12 new satellites to improve coverage over South America and Africa. Signal strength increased by 35% in these regions. The future of global connectivity is here! 🛰️",
//     created_at: "8 hours ago",
//     reactions: [
//       {
//         id: "1",
//         cnt: 425,
//         selected: false,
//       },
//       {
//         id: "2",
//         cnt: 132,
//         selected: false,
//       },
//       {
//         id: "5",
//         cnt: 3240,
//         selected: true,
//       },
//     ],
//     images: [],
//     comment_quantity: 0,
//     type: "satellite_update",
//     emergency_level: "high",
//     location: "Global HQ",
//     is_liked: false,
//     is_bookmarked: true,
//   },
// ];

export default function FeedList({ activeTab }: { activeTab: string }) {
  const trpc = useTRPC();

  const { ref, inView } = useInView();
  // const [showMockedFeeds, setShowMockedFeeds] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [post, setPost] = useState<FeedItem | null>(null);

  const queryOptions = trpc.feed.getLatestNews.infiniteQueryOptions({
    limit: FEED_LIMIT,
    cursor: 1,
    type: activeTab === "subscriptions" ? "subscriptions" : "discover",
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
      trpc.feed.getLatestNews.infiniteQueryKey({
        limit: FEED_LIMIT,
        type: activeTab as "subscriptions" | "discover",
      }),
    [trpc, activeTab],
  );

  const getQueryKeysOnError = useCallback(
    () =>
      trpc.feed.getLatestNews.infiniteQueryKey({
        limit: 100,
        type: activeTab as "subscriptions" | "discover",
      }),
    [trpc, activeTab],
  );

  useEffect(() => {
    if (inView) {
      void fetchNextPage();
    }
  }, [inView, fetchNextPage]);

  return (
    <CommentsModalContext.Provider value={{ handleOpenCommentsModal }}>
      <div className="space-y-4">
        {/* <Button
          onClick={() => setShowMockedFeeds(!showMockedFeeds)}
          variant="outline"
          className="w-full bg-white dark:bg-slate-900"
        >
          {showMockedFeeds ? "Hide Mocked Feeds" : "Show Mocked Feeds"}
        </Button>
        {activeTab === "discover" &&
          showMockedFeeds &&
          MockedFeeds.map((item) => (
            <FeedCard
              key={getUniqueId(item)}
              item={item}
              isMocked={true}
              limit={FEED_LIMIT}
              type="discover"
            />
          ))}*/}
        {status === "error" ? (
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
