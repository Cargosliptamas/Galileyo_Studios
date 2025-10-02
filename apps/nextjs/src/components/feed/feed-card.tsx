import type { InfiniteData, QueryKey } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Bookmark,
  // Globe,
  // Shield,
  Heart,
  Loader2,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Satellite,
  Share,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import type {
  FeedItem,
  FinancialItem,
  InfluencerItem,
} from "@galileyo/api/schemas";
import { cn } from "@galileyo/ui";
import { Button } from "@galileyo/ui/button";
import { Card, CardContent, CardHeader } from "@galileyo/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@galileyo/ui/dropdown-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@galileyo/ui/hover-card";
import { Separator } from "@galileyo/ui/separator";
import { toast } from "@galileyo/ui/toast";

import { useCommentsModal } from "~/hooks/use-comments-modal";
import { useFeedSubscription } from "~/hooks/use-feed-subscription";
import { useReportModal } from "~/hooks/use-report-modal";
import { useTRPC } from "~/trpc/react";
import ImageWithAuth from "../image-with-auth";
import { UserAvatar } from "./user-avatar";

function formatPrice(price: string | number | null | undefined) {
  const priceNumber =
    typeof price === "string" ? parseFloat(price) : (price ?? 0);

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(priceNumber);
}

const reactionOptions = [
  { type: "like" as const, emoji: "👍", label: "Like", id: "1" },
  { type: "dislike" as const, emoji: "👎", label: "Dislike", id: "2" },
  { type: "laugh" as const, emoji: "🤣", label: "Laugh", id: "3" },
  { type: "love" as const, emoji: "❤️", label: "Love", id: "4" },
  { type: "fire" as const, emoji: "🔥", label: "Fire", id: "5" },
  { type: "disgust" as const, emoji: "🤢", label: "Disgust", id: "6" },
];

export default function FeedCard({
  item,
  isMocked = false,
  getQueryKeys,
  getQueryKeysOnError,
}: {
  item: FeedItem;
  isMocked?: boolean;
  getQueryKeys: () => QueryKey;
  getQueryKeysOnError: () => QueryKey;
}) {
  const trpc = useTRPC();
  const { mutation: setSubscriptionMutation, setSubscription } =
    useFeedSubscription();

  const { openModal } = useCommentsModal();
  const { open: openReportModal } = useReportModal();

  const queryClient = useQueryClient();

  const muteMutation = useMutation(
    trpc.feed.muteSubscription.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.feed.pathFilter());
      },
    }),
  );

  const createBookmark = useMutation(
    trpc.bookmark.create.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.bookmark.list.pathFilter());
        await queryClient.invalidateQueries(trpc.feed.pathFilter());
      },
    }),
  );

  const deleteBookmark = useMutation(
    trpc.bookmark.delete.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.bookmark.list.pathFilter());
        await queryClient.invalidateQueries(trpc.feed.pathFilter());
      },
    }),
  );

  const setReaction = useMutation(
    trpc.feed.setReaction.mutationOptions({
      onMutate: (data) => {
        // const queryKey = trpc.feed.getLatestNews.infiniteQueryKey({
        //   limit,
        //   type: type as "subscriptions" | "discover",
        // });
        const queryKey = getQueryKeys() as ReturnType<
          typeof trpc.feed.getLatestNews.infiniteQueryKey
        >;

        const previousData = queryClient.getQueryData(queryKey);

        queryClient.setQueryData<
          InfiniteData<{
            list: FeedItem[];
          }>
        >(queryKey, (old) => {
          const mapped = {
            ...old,
            pageParams: old?.pageParams ?? [],
            pages:
              old?.pages.map((page) => ({
                ...page,
                list: page.list.map((item) => {
                  if (item.id !== Number(data.id)) {
                    return item;
                  }

                  const hasNewReaction = item.reactions.find(
                    (reaction) => reaction.id === data.reaction,
                  );

                  const mappedReactions = item.reactions.map((reaction) => {
                    if (reaction.id === data.reaction) {
                      return {
                        ...reaction,
                        cnt: reaction.cnt + 1,
                        selected: true,
                      };
                    }

                    if (reaction.selected) {
                      return {
                        ...reaction,
                        cnt: reaction.cnt - 1,
                        selected: false,
                      };
                    }

                    return {
                      ...reaction,
                    };
                  });

                  if (!hasNewReaction) {
                    mappedReactions.push({
                      id: data.reaction,
                      cnt: 1,
                      selected: true,
                    });
                  }

                  return {
                    ...item,
                    reactions: mappedReactions.filter(
                      (reaction) => reaction.cnt > 0,
                    ),
                  };
                }),
              })) ?? [],
          };

          return mapped;
        });

        return { previousData };
      },
      onError: (err, data, context) => {
        console.log("error", err);
        toast.error("Failed to set reaction");

        // const queryKey = trpc.feed.getLatestNews.infiniteQueryKey({
        //   limit: 100,
        //   type: type as "subscriptions" | "discover",
        // });
        const queryKey = getQueryKeysOnError() as ReturnType<
          typeof trpc.feed.getLatestNews.infiniteQueryKey
        >;

        queryClient.setQueryData(queryKey, context?.previousData);
      },
    }),
  );

  const removeReaction = useMutation(
    trpc.feed.removeReaction.mutationOptions({
      // onSuccess: async () => {
      //   await queryClient.invalidateQueries(trpc.feed.pathFilter());
      // },
      onMutate: (data) => {
        // const queryKey = trpc.feed.getLatestNews.infiniteQueryKey({
        //   limit,
        //   type: type as "subscriptions" | "discover",
        // });
        const queryKey = getQueryKeys() as ReturnType<
          typeof trpc.feed.getLatestNews.infiniteQueryKey
        >;

        const previousData = queryClient.getQueryData(queryKey);

        queryClient.setQueryData<
          InfiniteData<{
            list: FeedItem[];
          }>
        >(queryKey, (old) => {
          const mapped = {
            ...old,
            pageParams: old?.pageParams ?? [],
            pages:
              old?.pages.map((page) => ({
                ...page,
                list: page.list.map((item) => {
                  if (item.id !== Number(data.id)) {
                    return item;
                  }

                  const mappedReactions = item.reactions.map((reaction) => {
                    if (reaction.id === data.reaction) {
                      return {
                        ...reaction,
                        cnt: reaction.cnt - 1,
                        selected: false,
                      };
                    }

                    return reaction;
                  });

                  return {
                    ...item,
                    reactions: mappedReactions.filter(
                      (reaction) => reaction.cnt > 0,
                    ),
                  };
                }),
              })) ?? [],
          };

          return mapped;
        });

        return { previousData };
      },
      onError: (err, data, context) => {
        console.log("error", err);
        toast.error("Failed to remove reaction");

        // const queryKey = trpc.feed.getLatestNews.infiniteQueryKey({
        //   limit: 100,
        //   type: type as "subscriptions" | "discover",
        // });
        const queryKey = getQueryKeysOnError() as ReturnType<
          typeof trpc.feed.getLatestNews.infiniteQueryKey
        >;

        queryClient.setQueryData(queryKey, context?.previousData);
      },
    }),
  );

  const userReaction = useMemo(() => {
    return item.reactions.find((reaction) => reaction.selected);
  }, [item.reactions]);

  const pendingReaction = useMemo(() => {
    if (
      setReaction.variables?.id === String(item.id) &&
      setReaction.isPending
    ) {
      return setReaction.variables.reaction;
    }

    if (
      removeReaction.variables?.id === String(item.id) &&
      removeReaction.isPending
    ) {
      return removeReaction.variables.reaction;
    }

    return null;
  }, [
    setReaction.variables,
    removeReaction.variables,
    item.id,
    setReaction.isPending,
    removeReaction.isPending,
  ]);

  const getPostTypeIcon = (type: string, emergencyLevel?: string) => {
    switch (type) {
      case "emergency":
        return (
          <div
            className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
              emergencyLevel === "critical"
                ? "bg-red-500/20 text-red-400"
                : emergencyLevel === "high"
                  ? "bg-orange-500/20 text-orange-400"
                  : emergencyLevel === "medium"
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-blue-500/20 text-blue-400"
            }`}
          >
            <AlertTriangle className="h-3 w-3" />
            Emergency Alert
          </div>
        );
      case "satellite_update":
        return (
          <div className="flex items-center gap-1 rounded-full bg-cyan-500/20 px-2 py-1 text-xs font-medium text-cyan-400">
            <Satellite className="h-3 w-3" />
            Network Update
          </div>
        );
      default:
        return null;
    }
  };

  const getUserAvatarIcon = (item: FeedItem) => {
    switch (item.type) {
      case "influencer":
        return (item as InfluencerItem).image ?? null;
      case "financial":
        // TODO: add financial avatar icon
        return null;
      default:
        return null;
    }
  };

  const handleBookmark = useCallback(() => {
    if (item.id) {
      createBookmark.mutate({
        post_id: item.id,
      });
    }
  }, [item.id, createBookmark]);

  const handleDeleteBookmark = useCallback(() => {
    if (item.id) {
      deleteBookmark.mutate({
        post_id: item.id,
      });
    }
  }, [item.id, deleteBookmark]);

  const handleReactionClick = useCallback(
    (reactionType: string) => {
      const selectedReaction = userReaction?.id
        ? reactionOptions.find((r) => r.id === userReaction.id)
        : null;

      if (selectedReaction?.type === reactionType) {
        // TODO: remove reaction
        removeReaction.mutate({
          id: String(item.id),
          reaction: selectedReaction.id,
        });
      } else {
        setReaction.mutate({
          id: String(item.id),
          reaction:
            reactionOptions.find((r) => r.type === reactionType)?.id ?? "",
        });
      }
    },
    [userReaction?.id, item.id, setReaction, removeReaction],
  );

  const profileLink = useMemo(() => {
    if (isMocked || item.type === "financial") {
      return undefined;
    }

    if ("id_follower_list" in item && item.id_follower_list) {
      return `/profile/by-follower-list/${item.id_follower_list}`;
    }

    if ("id_subscription" in item && item.id_subscription) {
      return `/profile/by-subscription/${item.id_subscription}`;
    }

    // return `/profile/${item.id}`;
    return undefined;
  }, [isMocked, item.id]);

  const hasActions = useMemo(() => {
    return item.type !== "financial" && item.type !== "not_sended_yet";
  }, [item]);

  const isInfluencer = item.type === "influencer";
  // const isVerified = ["influencer", "financial", "not_sended_yet"].includes(
  //   item.type,
  // );

  const getTotalReactions = () => {
    return item.reactions.reduce((acc, reaction) => acc + reaction.cnt, 0);
  };

  const formatNumber = (num: number | null | undefined) => {
    if (num === null || num === undefined) {
      return "0";
    }

    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k";
    }

    return num.toString();
  };

  const handleSubscription = useCallback(() => {
    setSubscription({
      id: Number(item.id),
      subscribed: !item.is_subscribed,
    });
  }, [item.id, item.is_subscribed, setSubscription]);

  const handleMute = useCallback(() => {
    if ("id_subscription" in item && item.id_subscription) {
      muteMutation.mutate({
        subscriptionId: String(item.id_subscription),
      });
    }
  }, [item, muteMutation]);

  const handleReport = useCallback(() => {
    openReportModal(item);
  }, [item, openReportModal]);

  return (
    // <Card className="max-w-3xl mx-auto">
    <Card className="transform border-slate-200 bg-white/50 transition-all duration-300 hover:scale-[1.01] hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-600">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <UserAvatar
              name={item.title}
              image={getUserAvatarIcon(item)}
              // isVerified={isVerified}
              isVerified={false}
              isInfluencer={isInfluencer}
              href={profileLink}
              // href={isMocked ? undefined : `/profile/${item.id}`}
            >
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                {/* <span>{item.title}</span>
                <span>•</span> */}
                <span>{item.created_at}</span>
                {item.location && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{item.location}</span>
                    </div>
                  </>
                )}
              </div>
            </UserAvatar>
          </div>

          {!item.is_owner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={handleSubscription}
                  disabled={isMocked || setSubscriptionMutation.isPending}
                >
                  {item.is_subscribed ? "Unfollow" : "Follow"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleMute}
                  disabled={isMocked || muteMutation.isPending}
                >
                  Mute
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-500 hover:bg-slate-700 dark:text-red-400"
                  onClick={handleReport}
                >
                  Report Post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Post Type Badge */}
        {getPostTypeIcon(item.type, item.emergency_level ?? undefined)}
      </CardHeader>

      <CardContent className="pt-0">
        {/* Post Content */}
        {item.type !== "financial" && (
          <p className="mb-4 leading-relaxed">{item.body}</p>
        )}

        {/* Post Image */}
        {item.images.length > 0 && (
          <div className="mx-auto mb-4 max-w-md overflow-hidden rounded-lg">
            <ImageWithAuth
              url={item.images[0]?.sizes[0]?.url ?? ""}
              alt="Post content"
              className="h-auto w-full object-cover"
            />
          </div>
        )}

        {/* Satellite Info */}
        {/* {1 == 1 && (
          <div className="mb-4 p-3 bg-slate-900/50 border border-slate-600 rounded-lg">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span className="text-slate-300">Coverage: </span>
                <span className="text-cyan-400 font-medium">{100}</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-slate-300">Signal: </span>
                <span className="text-green-400 font-medium">{32}</span>
              </div>
            </div>
          </div>
        )} */}

        {item.type === "financial" && (
          <div className="">
            <div className="mb-1 text-2xl font-bold text-slate-900 dark:text-white">
              {formatPrice((item as unknown as FinancialItem).price)}
            </div>
            <div
              className={`flex items-center gap-1 text-sm font-medium ${
                (item as unknown as FinancialItem).percent >= 0
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {(item as unknown as FinancialItem).percent >= 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span>
                {(item as unknown as FinancialItem).percent >= 0 ? "+" : ""}
                {(item as unknown as FinancialItem).percent.toFixed(2)}
              </span>
              <span>
                ({(item as unknown as FinancialItem).percent >= 0 ? "+" : ""}
                {(item as unknown as FinancialItem).percent.toFixed(2)}%)
              </span>
            </div>
          </div>
        )}

        {hasActions && (
          <>
            <Separator className="my-4 bg-slate-200 dark:bg-slate-700" />

            {/* Post Actions */}
            <div className="grid grid-cols-3 items-baseline justify-between">
              <div className="col-span-3 flex">
                {item.reactions.length > 0 && (
                  <div className="mt-1 flex items-center gap-1">
                    {item.reactions.map((reaction) => (
                      <div
                        key={reaction.id}
                        className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400"
                      >
                        <span>
                          {
                            reactionOptions.find((r) => r.id === reaction.id)
                              ?.emoji
                          }
                        </span>
                        <span>{formatNumber(reaction.cnt)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="col-span-2 flex items-center gap-6">
                <HoverCard openDelay={300}>
                  <HoverCardTrigger asChild>
                    {/* <div className="flex flex-col items-center gap-2"> */}
                    <Button
                      disabled={isMocked}
                      variant="ghost"
                      // size="icon"
                      className={cn(
                        "flex items-center gap-2 text-slate-500 transition-colors dark:text-slate-400",
                        // pendingReaction ? "animate-pulse" : "",
                      )}
                      onClick={() => {
                        if (pendingReaction) {
                          handleReactionClick(pendingReaction);
                          return;
                        }

                        const reaction = reactionOptions.find(
                          (r) => r.id === userReaction?.id,
                        );

                        if (reaction) {
                          handleReactionClick(reaction.type);
                        } else {
                          handleReactionClick("love");
                        }
                      }}
                    >
                      {/* <Heart className="h-5 w-5" /> */}
                      {userReaction || pendingReaction ? (
                        <div className="flex max-h-5 max-w-5 items-center gap-1 text-xl">
                          {
                            reactionOptions.find(
                              (r) =>
                                r.id === (pendingReaction ?? userReaction?.id),
                            )?.emoji
                          }
                        </div>
                      ) : (
                        <Heart className="h-5 w-5" />
                      )}
                      <div className="text-sm font-medium">
                        {formatNumber(getTotalReactions())}
                      </div>
                    </Button>
                    {/* {item.reactions.length > 0 && (
                        <div className="mt-1 flex items-center gap-1">
                          {item.reactions.map((reaction) => (
                            <div
                              key={reaction.id}
                              className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400"
                            >
                              <span>
                                {
                                  reactionOptions.find(
                                    (r) => r.id === reaction.id,
                                  )?.emoji
                                }
                              </span>
                              <span>{formatNumber(reaction.cnt)}</span>
                            </div>
                          ))}
                        </div>
                      )} */}
                    {/* </div> */}
                  </HoverCardTrigger>
                  <HoverCardContent
                    className="w-full bg-white dark:bg-slate-900"
                    side="top"
                    align="start"
                  >
                    <div className="flex items-center gap-2">
                      {reactionOptions.map((reaction) => (
                        <Button
                          disabled={isMocked}
                          variant="ghost"
                          size="icon"
                          key={reaction.type}
                          onClick={() => handleReactionClick(reaction.type)}
                          aria-label={reaction.label}
                        >
                          {reaction.emoji}
                        </Button>
                      ))}
                    </div>
                  </HoverCardContent>
                </HoverCard>

                <Button
                  variant="ghost"
                  className="flex items-center gap-2 text-slate-500 transition-colors dark:text-slate-400"
                  onClick={() => openModal(item)}
                  disabled={isMocked}
                >
                  <MessageCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">
                    {formatNumber(item.comment_quantity)}
                  </span>
                </Button>

                <Button
                  variant="ghost"
                  className="flex items-center gap-2 text-slate-500 transition-colors dark:text-slate-400"
                  disabled={isMocked}
                >
                  <Share className="h-5 w-5" />
                  <span className="text-sm font-medium">{formatNumber(0)}</span>
                </Button>
              </div>

              <div className="flex items-end justify-end gap-2">
                {item.id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      item.is_bookmarked
                        ? handleDeleteBookmark()
                        : handleBookmark()
                    }
                    disabled={
                      isMocked ||
                      createBookmark.isPending ||
                      deleteBookmark.isPending
                    }
                    className={`p-2 transition-colors ${
                      (item.is_bookmarked ?? false)
                        ? "text-yellow-400 hover:text-yellow-300"
                        : "text-slate-500 hover:text-yellow-400 dark:text-slate-400"
                    }`}
                  >
                    {createBookmark.isPending || deleteBookmark.isPending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Bookmark
                        className={`h-5 w-5 ${item.is_bookmarked ? "fill-current" : ""}`}
                      />
                    )}
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
