import { redirect } from "next/navigation";

import type { GetLatestNewsParamTypes } from "@galileyo/api/schemas";

import { getSession } from "~/auth/server";
import { FeedTypeSwitcher } from "~/components/feed/feed-type-switcher";
import { FEED_LIMIT } from "~/constants/feed";
import { HydrateClient, prefetch, trpc } from "~/trpc/server";

type FeedTypes = GetLatestNewsParamTypes["type"];

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const activeTab = (tab ?? "subscriptions") as FeedTypes;

  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  prefetch(
    trpc.feed.getLatestNews.infiniteQueryOptions({
      limit: FEED_LIMIT,
      cursor: 1,
      type: activeTab,
    }),
  );

  return (
    <HydrateClient>
      <main className="container mx-auto max-w-3xl px-2 py-4">
        <h1 className="mb-4 text-2xl font-bold">Feed</h1>

        <FeedTypeSwitcher user={session.user} />
      </main>
    </HydrateClient>
  );
}
