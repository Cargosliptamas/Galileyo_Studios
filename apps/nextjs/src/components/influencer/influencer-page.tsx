import { cache, Suspense } from "react";

import { Card, CardContent, Skeleton } from "@galileyo/ui";
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
      <div className="mx-auto max-w-2xl px-4 py-4">
        <Card className="transform border-slate-200 bg-white/50 dark:border-slate-700 dark:bg-slate-800/50">
          <div className="relative min-h-24">
            <ImageWithFallback
              src={headerImage}
              fallback={
                <div className="h-full w-full bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 dark:from-slate-700 dark:via-slate-800 dark:to-slate-900" />
              }
              className="h-full w-full rounded-t-xl object-cover"
            />
          </div>

          <CardContent className="relative">
            <div className="relative -mt-20 mb-3 flex items-center justify-between">
              <div className="inline-block rounded-full border-4 border-white bg-white dark:border-slate-800 dark:bg-slate-800">
                <Avatar className="h-32 w-32">
                  <AvatarImage
                    src={profileImage ?? ""}
                    alt={displayName}
                    className="bg-slate-700"
                  />
                  <AvatarFallback className="select-none bg-slate-200 text-3xl text-slate-900 dark:bg-slate-700 dark:text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="mt-20 flex items-center justify-end gap-2">
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

            <div className="mt-2 space-y-3">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {displayName}
                </h1>
              </div>

              {info.pageDescription && (
                <ExpandableDescription description={info.pageDescription} />
              )}

              {info.socialLinks && info.socialLinks.length > 0 && (
                <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                  {info.socialLinks.map((link, index) => {
                    if (!link || link.trim() === "") {
                      return null;
                    }

                    return <SocialLink key={index} link={link} />;
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="mt-4">
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
