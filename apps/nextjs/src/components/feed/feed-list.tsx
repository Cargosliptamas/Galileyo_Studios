"use client";

import { Fragment, useEffect, useState } from "react";
import type { QueryFunction} from "@tanstack/react-query";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";

import type { FeedItem, InfluencerItem } from "@galileyo/api";

import { CommentsModalContext } from "~/hooks/use-comments-modal";
import { useTRPC } from "~/trpc/react";
import CommentsModal from "./comments-modal";
import FeedCard from "./feed-card";
import FeedCardSkeleton from "./feed-card-skeleton";
import type { TRPCQueryKey } from "@trpc/tanstack-react-query";

// import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
// import { useTRPC } from "~/trpc/react";

function getUniqueId(item: FeedItem) {
  const idPart = item.id ?? crypto.randomUUID();
  const createdAtPart = item.created_at ?? "";

  return `${item.type}-${idPart}-${createdAtPart}`;
}

const MockedFeeds: InfluencerItem[] = [
  {
    id: 2,
    title: 'Emergency Alert System',
    image: 'https://images.pexels.com/photos/355952/pexels-photo-355952.jpeg?auto=compress&cs=tinysrgb&w=100',
    subtitle: 'Severe storm system approaching Pacific Northwest. Cellular towers may experience disruptions. Satellite communication remains fully operational. Stay safe and stay connected.',
    url: 'https://www.google.com',
    id_subscription: 1,
    body: 'WEATHER ALERT: Severe storm system approaching Pacific Northwest. Cellular towers may experience disruptions. Satellite communication remains fully operational. Stay safe and stay connected.',
    created_at: '4 hours ago',
    reactions: [],
    images: [
      {
        id: 1,
        sizes: [
          {
            type: 'normal',
            url: 'https://images.pexels.com/photos/1252890/pexels-photo-1252890.jpeg?auto=compress&cs=tinysrgb&w=800',
            width: 800,
            height: 600,
            name: 'normal',
          }
        ],
      },
    ],
    comment_quantity: 0,
    type: 'emergency',
    emergency_level: 'high',
    location: 'Global HQ',
    is_liked: false,
    is_bookmarked: true,
  },
  {
    id: 4,
    title: 'Galileyo Network',
    image: 'https://images.pexels.com/photos/586063/pexels-photo-586063.jpeg?auto=compress&cs=tinysrgb&w=100',
    subtitle: 'Successfully deployed 12 new satellites to improve coverage over South America and Africa. Signal strength increased by 35% in these regions. The future of global connectivity is here! 🛰️',
    url: 'https://www.google.com',
    id_subscription: 1,
    body: 'NETWORK UPDATE: Successfully deployed 12 new satellites to improve coverage over South America and Africa. Signal strength increased by 35% in these regions. The future of global connectivity is here! 🛰️',
    created_at: '8 hours ago',
    reactions: [],
    images: [],
    comment_quantity: 0,
    type: 'satellite_update',
    emergency_level: 'high',
    location: 'Global HQ',
    is_liked: false,
    is_bookmarked: true,
  },
];

export default function FeedList() {
  const trpc = useTRPC();
  const { ref, inView } = useInView();
  const [isOpen, setIsOpen] = useState(false);
  const [post, setPost] = useState<FeedItem | null>(null);

  const queryOptions = trpc.feed.getLatestNews.infiniteQueryOptions({
    limit: 10,
    cursor: 1,
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
    queryFn: queryOptions.queryFn as QueryFunction<{
      list: FeedItem[];
      page: number;
      page_size: number;
    }, TRPCQueryKey, number | null>,
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
    console.log("handleOpenCommentsModal", post);
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
        {MockedFeeds.map((item) => (
          <FeedCard key={getUniqueId(item)} item={item} />
        ))}
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
                  <FeedCard key={getUniqueId(item)} item={item} />
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
            <div>
              {isFetching && !isFetchingNextPage
                ? "Background Updating..."
                : null}
            </div>
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
    </CommentsModalContext.Provider>
  );
}
