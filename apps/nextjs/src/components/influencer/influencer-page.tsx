import { cache, Suspense } from "react";

import { Card, CardContent, CardHeader, Skeleton } from "@galileyo/ui";

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
import { UserAvatar } from "../feed/user-avatar";
import { InfluencerActions } from "./influencer-actions";
import { InfluencerFeedList } from "./influencer-feed-list";

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

  return (
    <HydrateClient>
      <div className="space-y-4 p-4">
        <div className="mx-auto flex max-w-2xl flex-col gap-4">
          <Card className="w-full transform border-slate-200 bg-white/50 transition-all duration-300 hover:scale-[1.01] hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-600">
            <CardHeader className="grid grid-cols-6 justify-between">
              <div className="col-span-6 md:col-span-4">
                <UserAvatar
                  name={isFollowerList ? (info.name ?? "") : (info.title ?? "")}
                  image={getInfluencerImageUrl(info.image)}
                  isVerified={false}
                  isInfluencer={false}
                />
              </div>
              <div className="col-span-6 md:col-span-2 md:flex md:justify-end">
                <Suspense
                  fallback={
                    <Skeleton className="h-8 w-full rounded-md bg-slate-200 dark:bg-slate-700" />
                  }
                >
                  <InfluencerActions
                    id={info.id}
                    isLoggedIn={isLoggedIn ?? false}
                    type={info.type}
                  />
                </Suspense>
              </div>
            </CardHeader>
            <CardContent>
              <p
                dangerouslySetInnerHTML={{
                  __html: info.pageDescription?.replace(/\n/g, "<br />") ?? "",
                }}
              />
            </CardContent>
          </Card>

          <Suspense fallback={<FeedCardSkeleton />}>
            <InfluencerFeedList id={info.id} type={info.type} />
          </Suspense>
        </div>
      </div>
    </HydrateClient>
  );
}
