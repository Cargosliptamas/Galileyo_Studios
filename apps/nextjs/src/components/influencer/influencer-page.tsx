import { cache, Suspense } from "react";

import { Skeleton } from "@galileyo/ui";
import { Avatar, AvatarFallback, AvatarImage } from "@galileyo/ui/avatar";

import type { ProfileInfo } from "~/lib/server/profile";
import { FEED_LIMIT } from "~/constants/feed";
import { getInfluencerImageUrl } from "~/lib/image";
import {
  getProfileInfoByAlias,
  getProfileInfoByFollowerList,
  getProfileInfoBySubscription,
} from "~/lib/server/profile";
import { HydrateClient, prefetch, trpc } from "~/trpc/server";
import FeedCardSkeleton from "../feed/feed-card-skeleton";
import { ImageWithFallback } from "../image-with-fallback";
import { ExpandableDescription } from "./expandable-description";
import { InfluencerActions } from "./influencer-actions";
import { InfluencerFeedList } from "./influencer-feed-list";
import { SocialLink } from "./social-link";

export const getProfileInfo = cache(
  async (
    id: string,
    type: "alias" | "followerList" | "subscription" = "subscription",
    userId?: string,
  ) => {
    let info: ProfileInfo | null = null;

    switch (type) {
      case "alias":
        info = await getProfileInfoByAlias(id, userId);
        break;
      case "followerList":
        info = await getProfileInfoByFollowerList(id, userId);
        break;
      case "subscription":
        info = await getProfileInfoBySubscription(id, userId);
        break;
    }

    return info;
  },
);

export default function InfluencerPage({
  info,
  isFollowerList,
  isLoggedIn,
}: {
  id: string;
  info: ProfileInfo;
  isFollowerList: boolean;
  isLoggedIn?: boolean;
}) {
  prefetch(
    trpc.feed.getNewsBySubscriptionOrFollowerList.infiniteQueryOptions({
      id: info.id,
      type: info.type,
      skip_subscription_check: true,
      limit: FEED_LIMIT,
      cursor: 1,
    }),
  );

  const displayName = isFollowerList ? (info.name ?? "") : (info.title ?? "");
  const profileImage = getInfluencerImageUrl(info.image);
  const headerImage = getInfluencerImageUrl(info.headerImage);

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <HydrateClient>
      <div className="mx-auto max-w-2xl">
        {/* Banner */}
        <div className="relative h-[200px] bg-slate-200 dark:bg-slate-800">
          <ImageWithFallback
            src={headerImage}
            fallback={
              <div className="h-full w-full bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 dark:from-slate-700 dark:via-slate-800 dark:to-slate-900" />
            }
            className="h-full w-full object-cover"
          />
        </div>

        {/* Profile info section */}
        <div className="px-4">
          {/* Avatar row + Actions */}
          <div className="flex items-start justify-between">
            <div className="-mt-16 rounded-full ring-4 ring-white dark:ring-slate-900">
              <Avatar className="h-[134px] w-[134px]">
                <AvatarImage
                  src={profileImage ?? ""}
                  alt={displayName}
                  className="bg-slate-700"
                />
                <AvatarFallback className="select-none bg-slate-200 text-4xl text-slate-900 dark:bg-slate-700 dark:text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <Suspense
                fallback={
                  <Skeleton className="h-9 w-24 rounded-full bg-slate-200 dark:bg-slate-700" />
                }
              >
                <InfluencerActions
                  id={info.id}
                  isLoggedIn={isLoggedIn ?? false}
                  type={info.type}
                />
              </Suspense>
            </div>
          </div>

          {/* Name + handle */}
          <div className="mt-3">
            <h1
              className="text-xl font-bold text-foreground"
              style={{ textWrap: "balance" }}
            >
              {displayName}
            </h1>
            {info.alias && (
              <p className="text-sm text-muted-foreground">@{info.alias}</p>
            )}
          </div>

          {/* Bio */}
          {info.pageDescription && (
            <div className="mt-3">
              <ExpandableDescription description={info.pageDescription} />
            </div>
          )}

          {/* Social links - inline row */}
          {info.socialLinks && info.socialLinks.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
              {info.socialLinks.map((link, index) => {
                if (!link || link.trim() === "") {
                  return null;
                }

                return <SocialLink key={index} link={link} />;
              })}
            </div>
          )}
        </div>

        {/* Separator + Feed */}
        <div className="mt-4 border-t border-border px-4 pt-4">
          <Suspense fallback={<FeedCardSkeleton />}>
            <InfluencerFeedList
              id={info.id}
              type={info.type}
              isLoggedIn={isLoggedIn}
            />
          </Suspense>
        </div>
      </div>
    </HydrateClient>
  );
}
