import { redirect } from "next/navigation";

import { getSession } from "~/auth/server";
import { FeedTypeSwitcher } from "~/components/feed/feed-type-switcher";
import { FEED_LIMIT } from "~/constants/feed";
import { prefetch, trpc } from "~/trpc/server";
import { getDashboardActiveTab } from "./_lib/dashboard-route";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const activeTab = getDashboardActiveTab(tab);

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

  return <FeedTypeSwitcher user={session.user} />;
}
