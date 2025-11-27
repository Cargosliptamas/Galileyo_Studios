import type { InfiniteData, QueryKey } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Bookmark,
  Globe,
  // Globe,
  // Shield,
  Heart,
  Loader2,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Satellite,
  TrendingDown,
  TrendingUp,
  XIcon,
} from "lucide-react";
import { useInView } from "react-intersection-observer";

import type {
  FeedItem,
  FinancialItem,
  InfluencerItem,
} from "@galileyo/validators/feed";
import { cn, Skeleton } from "@galileyo/ui";
import { Button } from "@galileyo/ui/button";
import { Card, CardContent, CardHeader } from "@galileyo/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@galileyo/ui/dialog";
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
import { detectLinks, detectLinkType } from "~/lib/feed";
import { useTRPC } from "~/trpc/react";
// import { AlertMap } from "../map/alert-map";
import { AlertMap } from "../alert-map/alert-map";
import ImageWithAuth from "../image-with-auth";
import FeedThirdPartyContent from "./feed-third-party-contet";
import { UserAvatar } from "./user-avatar";

import "leaflet/dist/leaflet.css";

import { useRouter } from "next/navigation";

import Interweave from "../ui/interweave";

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

export function getFeedImageUrls(feedImages: FeedItem["images"]) {
  const images: string[] = [];

  for (const image of feedImages) {
    let original: string | null = null;
    let normal: string | null = null;

    for (const size of image.sizes) {
      switch (size.type) {
        case "origin":
          original = size.url;
          break;
        case "normal":
          normal = size.url;
          break;
      }
    }

    const imageUrl = original ?? normal;

    if (imageUrl) {
      images.push(imageUrl);
    }
  }

  return images;
}

export default function FeedCard({
  item,
  getQueryKeys,
  getQueryKeysOnError,
  isMocked = false,
  isOnAlertMap = false,
  className,
}: {
  item: FeedItem;
  isMocked?: boolean;
  getQueryKeys: () => QueryKey;
  getQueryKeysOnError: () => QueryKey;
  isOnAlertMap?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const { ref, inView } = useInView();
  const [wasInView, setWasInView] = useState(false);

  const trpc = useTRPC();
  const { mutation: setSubscriptionMutation, setSubscription } =
    useFeedSubscription({
      onSuccess: (isSubscribing) => {
        if (isSubscribing) {
          toast.success("Subscription updated");
        } else {
          toast.success("Subscription removed");
        }
        void queryClient.invalidateQueries(trpc.feed.pathFilter());
      },
    });

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
          if (isOnAlertMap) {
            return old;
          }

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
      onSuccess: () => {
        if (isOnAlertMap) {
          void queryClient.invalidateQueries(
            trpc.feed.getNewsById.pathFilter(),
          );
        }
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
          if (isOnAlertMap) {
            return old;
          }

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
      onSuccess: () => {
        if (isOnAlertMap) {
          void queryClient.invalidateQueries(
            trpc.feed.getNewsById.pathFilter(),
          );
        }
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
      case "user":
        return (item as InfluencerItem).image ?? null;
      case "emergency":
        return "/galileyo_new_logo_square.png";
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
    if (isMocked || item.type === "financial" || item.type === "emergency") {
      return undefined;
    }

    if ("id_follower_list" in item && item.id_follower_list) {
      return `/profile/by-follower-list/${item.id_follower_list}`;
    }

    if (
      "id_subscription" in item &&
      item.id_subscription &&
      item.type === "influencer"
    ) {
      return `/profile/by-subscription/${item.id_subscription}`;
    }

    if (item.id_user) {
      return `/profile/${item.id_user}`;
    }

    return undefined;
  }, [isMocked, item.id, item.id_user]);

  const hasActions = useMemo(() => {
    return (
      item.type !== "financial" &&
      item.type !== "not_sended_yet" &&
      item.type !== "emergency"
    );
  }, [item]);

  const isInfluencer = item.type === "influencer";
  // const isVerified = ["influencer", "financial", "not_sended_yet"].includes(
  //   item.type,
  // );

  const feedImageUrls = useMemo(() => {
    return getFeedImageUrls(item.images);
  }, [item.images]);

  const [zoomedImageIndex, setZoomedImageIndex] = useState<number | null>(null);

  // Keyboard navigation for image zoom
  useEffect(() => {
    if (zoomedImageIndex === null) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setZoomedImageIndex(null);
      } else if (event.key === "ArrowLeft" && feedImageUrls.length > 1) {
        event.preventDefault();
        setZoomedImageIndex(
          zoomedImageIndex > 0
            ? zoomedImageIndex - 1
            : feedImageUrls.length - 1,
        );
      } else if (event.key === "ArrowRight" && feedImageUrls.length > 1) {
        event.preventDefault();
        setZoomedImageIndex(
          zoomedImageIndex < feedImageUrls.length - 1
            ? zoomedImageIndex + 1
            : 0,
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [zoomedImageIndex, feedImageUrls.length]);

  useEffect(() => {
    if (inView) {
      setWasInView(true);
    }
  }, [inView]);

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
      id: Number(item.id_subscription ?? item.id),
      subscribed: !item.is_subscribed,
    });
  }, [item.id, item.id_subscription, item.is_subscribed, setSubscription]);

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

  const handleOpenEmergencyMap = useCallback(
    ({ latitude, longitude }: { latitude: number; longitude: number }) => {
      router.push(
        `/alerts-map?latitude=${latitude}&longitude=${longitude}&showInfluencers=true`,
      );
    },
    [router],
  );

  const { links } = useMemo(() => {
    const result = detectLinks(item.body, true);
    return {
      text: result.text,
      links: [
        ...result.links.filter((link) => link.link !== item.url),
        { link: item.url ?? "", type: detectLinkType(item.url, "direct-url") },
      ].filter((link) => link.link !== ""),
    };
  }, [item.body, item.url]);

  return (
    // <Card className="max-w-3xl mx-auto">
    <Card
      ref={ref}
      className={cn(
        "transform border-slate-200 bg-white/50 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-600",
        className,
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <UserAvatar
              name={item.title}
              image={getUserAvatarIcon(item)}
              // isVerified={isVerified}
              isVerified={isInfluencer}
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

          {!item.is_owner && item.type !== "emergency" && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {item.type !== "aa" && (
                  <DropdownMenuItem
                    onClick={handleSubscription}
                    disabled={isMocked || setSubscriptionMutation.isPending}
                  >
                    {item.is_subscribed ? "Unfollow" : "Follow"}
                  </DropdownMenuItem>
                )}
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

      {inView || wasInView ? (
        <CardContent className="pt-0">
          {/* Post Content */}
          {item.type !== "financial" && (
            // <p className="mb-4 break-words leading-relaxed">{text}</p>
            <div className="mb-4 break-words leading-relaxed">
              <Interweave content={item.body} />
            </div>
          )}

          {/* Post Image */}
          {feedImageUrls.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {feedImageUrls.map((url, index) => (
                <button
                  key={`feed-image-${item.id}-${index}`}
                  onClick={() => setZoomedImageIndex(index)}
                  className="cursor-pointer overflow-hidden rounded-lg transition-transform hover:scale-105"
                  type="button"
                >
                  <ImageWithAuth
                    url={url}
                    alt="Post content"
                    className="h-auto w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          <FeedThirdPartyContent links={links} />

          {item.meta_data?.location && (
            <div className="my-4 rounded-lg border border-slate-600 bg-slate-900/50 p-3">
              <div className="flex flex-col items-center justify-between gap-4 text-sm md:flex-row">
                <div className="flex flex-row items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-cyan-400" />
                    <span className="text-slate-300">Location </span>
                  </div>
                  <span className="font-medium text-cyan-400">
                    {item.meta_data.location.latitude},{" "}
                    {item.meta_data.location.longitude}
                  </span>
                </div>
                <div className="relative flex w-full items-center gap-2 md:w-auto">
                  {isOnAlertMap ? (
                    // <Button
                    //   variant="secondary"
                    //   className="flex w-full items-center gap-2 md:w-auto"
                    // >
                    //   <MapPin className="h-4 w-4 text-cyan-400" />
                    //   <span>Show on map</span>
                    // </Button>
                    <></>
                  ) : (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="secondary"
                          className="flex w-full items-center gap-2 md:w-auto"
                        >
                          <MapPin className="h-4 w-4 text-cyan-400" />
                          <span>Show on map</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-7xl">
                        <DialogHeader>
                          <DialogTitle>Location</DialogTitle>
                          <DialogDescription>
                            {item.meta_data.location.latitude},{" "}
                            {item.meta_data.location.longitude}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col gap-4">
                          <Button
                            className="flex w-full gap-2"
                            onClick={() =>
                              handleOpenEmergencyMap({
                                latitude:
                                  item.meta_data?.location.latitude ?? 0,
                                longitude:
                                  item.meta_data?.location.longitude ?? 0,
                              })
                            }
                          >
                            <MapPin className="h-4 w-4" />
                            <span>Open in emergency map</span>
                          </Button>
                          <div className="h-[400px] w-full">
                            <AlertMap
                              alerts={[
                                {
                                  id: item.id?.toString() ?? "",
                                  title: item.title,
                                  description: item.body,
                                  location: item.meta_data.location,
                                  severity: "information",
                                  type: "UNKNOWN",
                                  timestamp: new Date().toISOString(),
                                  source: item.title,
                                  isActive: true,
                                  is_influencer: true,
                                  influencer_page: {
                                    id: item.id_subscription ?? 0,
                                    title: item.title,
                                    alias: undefined,
                                    description: item.title,
                                    image:
                                      (item as InfluencerItem).image ??
                                      undefined,
                                  },
                                },
                              ]}
                              zoom={15}
                              center={{
                                latitude: item.meta_data.location.latitude,
                                longitude: item.meta_data.location.longitude,
                              }}
                              // onAlertClick={() => {}}
                              showAffectedAreas={false}
                              selectedLocation={null}
                              canClickAlerts={false}
                            />
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
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
              {(item as unknown as FinancialItem).ticker && (
                <div className="mb-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                  {(item as unknown as FinancialItem).ticker}
                </div>
              )}
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
                        disabled={isMocked || !item.show_reactions}
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
                                  r.id ===
                                  (pendingReaction ?? userReaction?.id),
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
                    disabled={isMocked || !item.show_comments}
                    data-phid="show-comments"
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">
                      {formatNumber(item.comment_quantity)}
                    </span>
                  </Button>

                  {/* <Button
                      variant="ghost"
                      className="flex items-center gap-2 text-slate-500 transition-colors dark:text-slate-400"
                      disabled={isMocked}
                    >
                      <Share className="h-5 w-5" />
                      <span className="text-sm font-medium">{formatNumber(0)}</span>
                    </Button> */}
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
                      data-phid="bookmark-post"
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
      ) : (
        <CardContent className="pt-0">
          <Skeleton className="h-64 w-64" />
        </CardContent>
      )}

      {/* Image Zoom Dialog */}
      <Dialog
        open={zoomedImageIndex !== null}
        onOpenChange={(open) => {
          if (!open) {
            setZoomedImageIndex(null);
          }
        }}
      >
        <DialogContent className="h-auto max-h-[95vh] w-auto max-w-[95vw] border-none bg-transparent p-0 [&>button]:hidden">
          <DialogHeader>
            <DialogTitle></DialogTitle>
          </DialogHeader>
          {zoomedImageIndex !== null && (
            <div className="relative flex h-full w-full items-center justify-center">
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-4"
                onClick={() => setZoomedImageIndex(null)}
              >
                <XIcon className="h-5 w-5" />
              </Button>

              <ImageWithAuth
                url={feedImageUrls[zoomedImageIndex] ?? ""}
                alt="Post image"
                className="object-fit max-h-full w-full"
                skeletonClassName="w-96 h-96"
              />

              {feedImageUrls.length > 1 && (
                <>
                  <button
                    onClick={() => {
                      setZoomedImageIndex(
                        zoomedImageIndex > 0
                          ? zoomedImageIndex - 1
                          : feedImageUrls.length - 1,
                      );
                    }}
                    className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
                    type="button"
                    aria-label="Previous image"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="h-6 w-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 19.5L8.25 12l7.5-7.5"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      setZoomedImageIndex(
                        zoomedImageIndex < feedImageUrls.length - 1
                          ? zoomedImageIndex + 1
                          : 0,
                      );
                    }}
                    className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
                    type="button"
                    aria-label="Next image"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="h-6 w-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.25 4.5l7.5 7.5-7.5 7.5"
                      />
                    </svg>
                  </button>
                  <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-sm text-white">
                    {zoomedImageIndex + 1} / {feedImageUrls.length}
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
