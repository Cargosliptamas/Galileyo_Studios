"use client";

import type { QueryFunction } from "@tanstack/react-query";
import type { TRPCQueryKey } from "@trpc/tanstack-react-query";
import { Fragment, useEffect } from "react";
import Link from "next/link";
import {
  useMutation,
  useQueryClient,
  useSuspenseInfiniteQuery,
} from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";

import type { FriendListType } from "@galileyo/validators";
import { Button, Skeleton, toast } from "@galileyo/ui";

import { useTRPC } from "~/trpc/react";
import { UserAvatar } from "../feed/user-avatar";

export function FriendsList() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { ref, inView } = useInView();

  const queryOptions = trpc.friends.friendList.infiniteQueryOptions({
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
      FriendListType,
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

  const deleteFriend = useMutation(
    trpc.friends.deleteFriend.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.friends.pathFilter());
        toast.success("Friend removed");
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }),
  );

  useEffect(() => {
    if (inView) {
      void fetchNextPage();
    }
  }, [inView, fetchNextPage]);

  return (
    <div className="space-y-4">
      {status === "error" ? (
        <span>{error?.message ?? "Something went wrong"}</span>
      ) : (
        <>
          {data.pages.map((page) => (
            <Fragment key={page.page}>
              {page.list.map((friend) => (
                <div key={friend.id}>
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      href={`/profile/${friend.id}`}
                      className="flex items-center gap-2"
                    >
                      <UserAvatar
                        name={friend.full_name}
                        image={friend.photo}
                        isVerified={false}
                        isInfluencer={false}
                        onlyAvatar={true}
                      />
                      <div>
                        <h3 className="text-lg font-bold">
                          {friend.full_name}
                        </h3>
                      </div>
                    </Link>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                          deleteFriend.mutate({ userId: friend.id })
                        }
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
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
                <Skeleton className="h-10 w-full" />
              ) : hasNextPage ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                ""
              )}
            </button>
          </div>
          <div>{isFetching && !isFetchingNextPage ? "Loading..." : null}</div>
        </>
      )}
    </div>
  );
}
