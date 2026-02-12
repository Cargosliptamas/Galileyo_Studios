import { redirect } from "next/navigation";

import { getSession } from "~/auth/server";
import { FeedTypeSwitcher } from "~/components/feed/feed-type-switcher";
import { FEED_LIMIT } from "~/constants/feed";
import { prefetch, trpc } from "~/trpc/server";
import {
  getDashboardActiveTab,
  getDashboardDeepLinkCallbackUrl,
  getDashboardUrl,
} from "../_lib/dashboard-route";

export default async function DashboardPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ postId: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const [{ postId }, { tab }] = await Promise.all([params, searchParams]);
  const parsedPostId = Number(postId);
  const activeTab = getDashboardActiveTab(tab);

  if (!Number.isInteger(parsedPostId) || parsedPostId <= 0) {
    redirect(getDashboardUrl(tab));
  }

  const session = await getSession();
  if (!session) {
    const callbackURL = getDashboardDeepLinkCallbackUrl(parsedPostId, tab);

    redirect(`/login?callbackURL=${encodeURIComponent(callbackURL)}`);
  }

  prefetch(
    trpc.feed.getLatestNews.infiniteQueryOptions({
      limit: FEED_LIMIT,
      cursor: 1,
      type: activeTab,
    }),
  );
  prefetch(trpc.feed.getNewsById.queryOptions({ id: parsedPostId }));

  return <FeedTypeSwitcher user={session.user} initialPostId={parsedPostId} />;
}
