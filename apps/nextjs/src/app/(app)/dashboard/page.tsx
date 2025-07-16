import { Suspense } from "react";
import { redirect } from "next/navigation";

import { getSession } from "~/auth/server";
// import { Debug } from "~/components/dashboard/debug";
import { HydrateClient, prefetch, trpc } from "~/trpc/server";
import FeedList from "~/components/feed/feed-list";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  prefetch(trpc.feed.getLatestNews.infiniteQueryOptions({ limit: 10, cursor: 1 }));

  return (
    <HydrateClient>
      <main className="container py-16">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p>
          Welcome, {session.user.firstName} {session.user.lastName}
        </p>

        <Suspense fallback={<div>Loading...</div>}>
          <FeedList />
        </Suspense>
      </main>
    </HydrateClient>
  );
}
