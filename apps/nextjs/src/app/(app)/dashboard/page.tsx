import { Suspense } from "react";
import { redirect } from "next/navigation";

import { getSession } from "~/auth/server";
import FeedCardSkeleton from "~/components/feed/feed-card-skeleton";
import FeedList from "~/components/feed/feed-list";
// import { Debug } from "~/components/dashboard/debug";
import { HydrateClient, prefetch, trpc } from "~/trpc/server";
import { FEED_LIMIT } from "~/constants/feed";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;

  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  prefetch(
    trpc.feed.getLatestNews.infiniteQueryOptions({
      limit: FEED_LIMIT,
      cursor: 1,
      type:
        (tab as "subscriptions" | "discover" | undefined) ?? "subscriptions",
    }),
  );

  return (
    <HydrateClient>
      <main className="container py-4">
        <h1 className="mb-4 text-2xl font-bold">Feed</h1>

        <Suspense
          fallback={
            <div className="space-y-4">
              <FeedCardSkeleton />
              <FeedCardSkeleton />
              <FeedCardSkeleton />
              <FeedCardSkeleton />
              <FeedCardSkeleton />
            </div>
          }
        >
          <FeedList />
        </Suspense>
      </main>
    </HydrateClient>
  );
}
