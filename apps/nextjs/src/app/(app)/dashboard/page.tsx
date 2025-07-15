import { Suspense } from "react";
import { redirect } from "next/navigation";

import { getSession } from "~/auth/server";
import { Debug } from "~/components/dashboard/debug";
import { HydrateClient, prefetch, trpc } from "~/trpc/server";
import FeedCard from "~/components/feed/feed-card";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  prefetch(trpc.post.all.queryOptions());

  return (
    <HydrateClient>
      <main className="container py-16">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p>
          Welcome, {session.user.firstName} {session.user.lastName}
        </p>

        <FeedCard />

        <Suspense fallback={<div>Loading...</div>}>
          <Debug />
        </Suspense>
      </main>
    </HydrateClient>
  );
}
