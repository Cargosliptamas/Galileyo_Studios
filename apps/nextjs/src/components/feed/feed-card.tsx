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
  Repeat2,
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
import { PostShareModal } from "./post-share-modal";
import { UserAvatar } from "./user-avatar";

import "leaflet/dist/leaflet.css";

import { useRouter } from "next/navigation";

import type { FeedItemVideoType } from "@galileyo/validators/feed";

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

function isInfiniteFeedListQueryData(
  value: unknown,
): value is InfiniteData<{ list: FeedItem[] }> {
  return Boolean(
    value &&
      typeof value === "object" &&
      "pages" in value &&
      Array.isArray((value as { pages?: unknown }).pages),
  );
}

function isFeedItemQueryData(value: unknown): value is FeedItem {
  return Boolean(
    value &&
      typeof value === "object" &&
      "id" in value &&
      "reactions" in value &&
      Array.isArray((value as { reactions?: unknown }).reactions),
  );
}

function applySetReactionToItem(
  item: FeedItem,
  data: { id: string; reaction: string },
): FeedItem {
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
    reactions: mappedReactions.filter((reaction) => reaction.cnt > 0),
  };
}

function applyRemoveReactionFromItem(
  item: FeedItem,
  data: { id: string; reaction: string },
): FeedItem {
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
    reactions: mappedReactions.filter((reaction) => reaction.cnt > 0),
  };
}

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
  actionsDisabled = false,
  showOriginalPost = true,
}: {
  item: FeedItem;
  isMocked?: boolean;
  getQueryKeys: () => QueryKey;
  getQueryKeysOnError: () => QueryKey;
  isOnAlertMap?: boolean;
  className?: string;
  actionsDisabled?: boolean;
  showOriginalPost?: boolean;
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
        const queryKey = getQueryKeys();

        const previousData = queryClient.getQueryData(queryKey);

        queryClient.setQueryData(queryKey, (old) => {
          if (isOnAlertMap || !old) {
            return old;
          }

          if (isInfiniteFeedListQueryData(old)) {
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                list: page.list.map((feedItem) =>
                  applySetReactionToItem(feedItem, data),
                ),
              })),
            };
          }

          if (isFeedItemQueryData(old)) {
            return applySetReactionToItem(old, data);
          }

          return old;
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
        const queryKey = getQueryKeysOnError();

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
        const queryKey = getQueryKeys();

        const previousData = queryClient.getQueryData(queryKey);

        queryClient.setQueryData(queryKey, (old) => {
          if (isOnAlertMap || !old) {
            return old;
          }

          if (isInfiniteFeedListQueryData(old)) {
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                list: page.list.map((feedItem) =>
                  applyRemoveReactionFromItem(feedItem, data),
                ),
              })),
            };
          }

          if (isFeedItemQueryData(old)) {
            return applyRemoveReactionFromItem(old, data);
          }

          return old;
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
        const queryKey = getQueryKeysOnError();

        queryClient.setQueryData(queryKey, context?.previousData);
      },
    }),
  );

  const userReaction = useMemo(() => {
    return item.reactions.find((reaction) => reaction.selected);
  }, [item.reactions]);

  const pendingReactionId = useMemo(() => {
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

  const activeReactionId = pendingReactionId ?? userReaction?.id ?? null;

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

  const handlePrimaryReaction = useCallback(() => {
    const activeReaction = reactionOptions.find(
      (reaction) => reaction.id === activeReactionId,
    );

    handleReactionClick(activeReaction?.type ?? "love");
  }, [activeReactionId, handleReactionClick]);

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
    if (actionsDisabled) {
      return false;
    }

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
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

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

  const postBody = useMemo(() => {
    if (item.is_repost) {
      return item.repost_caption ?? "";
    }

    return item.body;
  }, [item.body, item.is_repost, item.repost_caption]);

  const { links } = useMemo(() => {
    const result = detectLinks(postBody, true);
    return {
      text: result.text,
      links: [
        ...result.links.filter((link) => link.link !== item.url),
        { link: item.url ?? "", type: detectLinkType(item.url, "direct-url") },
      ].filter((link) => link.link !== ""),
    };
  }, [item.url, postBody]);

  return (
    // <Card className="max-w-3xl mx-auto">
    <Card
      ref={ref}
      className={cn(
        "border-slate-200 bg-white/50 transition-colors hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-600",
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

          {!actionsDisabled && !item.is_owner && item.type !== "emergency" && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Open post actions"
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
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
          {item.type !== "financial" && postBody.trim().length > 0 && (
            // <p className="mb-4 break-words leading-relaxed">{text}</p>
            <div className="mb-4 break-words leading-relaxed">
              <Interweave content={postBody} />
            </div>
          )}

          {/* Video Preview */}
          {"video" in item &&
            (item as { video: FeedItemVideoType | null }).video && (
              <FeedVideoPreview
                video={(item as { video: FeedItemVideoType }).video}
              />
            )}

          {/* Post Image */}
          {feedImageUrls.length > 0 && (
            <div
              className={cn(
                "grid gap-3",
                feedImageUrls.length === 1 ? "grid-cols-1" : "grid-cols-2",
              )}
            >
              {feedImageUrls.map((url, index) => (
                <button
                  key={`feed-image-${item.id}-${index}`}
                  onClick={() => setZoomedImageIndex(index)}
                  className={cn(
                    "group relative overflow-hidden rounded-xl border border-transparent bg-slate-100/40 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/60 dark:bg-slate-800/40",
                    feedImageUrls.length === 1
                      ? "max-h-[30rem]"
                      : "aspect-square",
                  )}
                  type="button"
                  aria-label={`Open image ${index + 1} of ${feedImageUrls.length}`}
                >
                  <ImageWithAuth
                    url={url}
                    alt="Post content"
                    className={cn(
                      "w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]",
                      feedImageUrls.length === 1
                        ? "h-auto max-h-[30rem]"
                        : "h-full",
                    )}
                  />
                </button>
              ))}
            </div>
          )}

          <FeedThirdPartyContent links={links} />

          {showOriginalPost && item.original_post && (
            <div className="mb-4 rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 dark:border-slate-700/80 dark:bg-slate-900/40">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Original Post
              </p>
              <FeedCard
                item={item.original_post}
                getQueryKeys={getQueryKeys}
                getQueryKeysOnError={getQueryKeysOnError}
                actionsDisabled={true}
                showOriginalPost={false}
                className="border-slate-200 bg-white/80 shadow-none dark:border-slate-700 dark:bg-slate-900/70"
              />
            </div>
          )}

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
              <div className="space-y-2">
                {item.reactions.length > 0 && (
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                    {item.reactions.map((reaction) => (
                      <div
                        key={reaction.id}
                        className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                      >
                        <span>
                          {reactionOptions.find((r) => r.id === reaction.id)
                            ?.emoji ?? ""}
                        </span>
                        <span>{formatNumber(reaction.cnt)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex min-w-0 flex-wrap items-center gap-1 sm:gap-2">
                    <HoverCard openDelay={300}>
                      <HoverCardTrigger asChild>
                        {/* <div className="flex flex-col items-center gap-2"> */}
                        <Button
                          disabled={isMocked || !item.show_reactions}
                          variant="ghost"
                          className={cn(
                            "h-9 rounded-full px-3 text-slate-500 transition-colors hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-cyan-500/60 dark:text-slate-400 dark:hover:text-slate-200",
                            (setReaction.isPending ||
                              removeReaction.isPending) &&
                              "opacity-80",
                          )}
                          onClick={handlePrimaryReaction}
                          aria-label={
                            activeReactionId
                              ? "Change reaction"
                              : "Add reaction"
                          }
                        >
                          {/* <Heart className="h-5 w-5" /> */}
                          {activeReactionId ? (
                            <div className="flex max-h-5 max-w-5 items-center gap-1 text-xl">
                              {
                                reactionOptions.find(
                                  (r) => r.id === activeReactionId,
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
                        className="w-auto rounded-full border border-slate-200 bg-white p-1 shadow-xl dark:border-slate-700 dark:bg-slate-900"
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
                              className={cn(
                                "h-9 w-9 rounded-full text-lg transition-transform hover:scale-110",
                                activeReactionId === reaction.id &&
                                  "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white",
                              )}
                            >
                              {reaction.emoji}
                            </Button>
                          ))}
                        </div>
                      </HoverCardContent>
                    </HoverCard>

                    <Button
                      variant="ghost"
                      className="h-9 rounded-full px-3 text-slate-500 transition-colors hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-cyan-500/60 dark:text-slate-400 dark:hover:text-slate-200"
                      onClick={() => openModal(item)}
                      disabled={isMocked || !item.show_comments}
                      data-phid="show-comments"
                      aria-label="Open comments"
                    >
                      <MessageCircle className="h-5 w-5" />
                      <span className="text-sm font-medium">
                        {formatNumber(item.comment_quantity)}
                      </span>
                    </Button>

                    <Button
                      variant="ghost"
                      className="h-9 rounded-full px-3 text-slate-500 transition-colors hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-cyan-500/60 dark:text-slate-400 dark:hover:text-slate-200"
                      disabled={isMocked}
                      onClick={() => setIsShareModalOpen(true)}
                      data-phid="share-post"
                      aria-label="Repost"
                    >
                      <Repeat2 className="h-5 w-5" />
                      <span className="text-sm font-medium">Repost</span>
                    </Button>
                  </div>

                  <div className="ml-auto flex items-center justify-end gap-2">
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
                        aria-label={
                          item.is_bookmarked
                            ? "Remove bookmark"
                            : "Bookmark post"
                        }
                        className={`p-2 transition-colors ${
                          (item.is_bookmarked ?? false)
                            ? "h-9 w-9 rounded-full text-yellow-400 hover:text-yellow-300"
                            : "h-9 w-9 rounded-full text-slate-500 hover:text-yellow-400 dark:text-slate-400"
                        }`}
                      >
                        {createBookmark.isPending ||
                        deleteBookmark.isPending ? (
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
              </div>
            </>
          )}
        </CardContent>
      ) : (
        <CardContent className="pt-0">
          <div className="space-y-3 pb-1">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-52 w-full rounded-xl" />
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-20 rounded-full" />
                <Skeleton className="h-9 w-20 rounded-full" />
                <Skeleton className="h-9 w-24 rounded-full" />
              </div>
              <Skeleton className="h-9 w-9 rounded-full" />
            </div>
          </div>
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
        <DialogContent className="h-auto max-h-[95vh] w-auto max-w-[95vw] border-none bg-transparent p-0 shadow-none [&>button]:hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>Image preview</DialogTitle>
            <DialogDescription>
              Expanded image preview. Use left and right arrow keys to navigate.
            </DialogDescription>
          </DialogHeader>
          {zoomedImageIndex !== null && (
            <div className="relative flex h-full w-full items-center justify-center">
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-4 z-20 h-10 w-10 rounded-full bg-black/60 text-white backdrop-blur transition-colors hover:bg-black/80"
                onClick={() => setZoomedImageIndex(null)}
                aria-label="Close image preview"
              >
                <XIcon className="h-5 w-5" />
              </Button>

              <ImageWithAuth
                url={feedImageUrls[zoomedImageIndex] ?? ""}
                alt="Post image"
                className="max-h-[88vh] w-auto max-w-[95vw] object-contain"
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
                    className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white backdrop-blur transition-colors hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
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
                    className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white backdrop-blur transition-colors hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
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

      {item.id !== null && !actionsDisabled && (
        <PostShareModal
          postId={item.id}
          postTitle={item.title}
          postBody={item.body}
          open={isShareModalOpen}
          onOpenChange={setIsShareModalOpen}
        />
      )}
    </Card>
  );
}

/**
 * Video preview card for feed items that have a linked video.
 * Shows thumbnail with play button overlay and duration badge.
 * Clicking navigates to the video page.
 */
function FeedVideoPreview({ video }: { video: FeedItemVideoType }) {
  const router = useRouter();

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return null;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <button
      type="button"
      className="group relative mb-4 w-full cursor-pointer overflow-hidden rounded-xl bg-slate-900 transition-all hover:shadow-lg hover:ring-2 hover:ring-cyan-500/30"
      onClick={() => router.push(`/videos/${video.id}`)}
      style={{
        aspectRatio: video.aspectRatio ?? "16/9",
        maxHeight: "400px",
      }}
    >
      {/* Thumbnail */}
      {video.thumbnailUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={video.thumbnailUrl}
          alt="Video thumbnail"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-slate-800">
          <svg
            className="h-12 w-12 text-slate-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
            />
          </svg>
        </div>
      )}

      {/* Play button overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/30">
        <div className="rounded-full bg-black/60 p-4 transition-transform group-hover:scale-110">
          <svg
            className="h-8 w-8 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>

      {/* Duration badge */}
      {video.duration && (
        <div className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-xs font-medium text-white">
          {formatDuration(video.duration)}
        </div>
      )}

      {/* Video indicator icon */}
      <div className="absolute left-2 top-2 flex items-center gap-1 rounded bg-black/50 px-1.5 py-0.5 text-[10px] text-white/80">
        <svg
          className="h-3 w-3"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
          />
        </svg>
        Video
      </div>
    </button>
  );
}
