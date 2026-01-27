import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Handshake } from "lucide-react";

import { Skeleton } from "@galileyo/ui";

import { getSession } from "~/auth/server";
import { FriendsList } from "~/components/friend/friends-list";
import { HydrateClient, prefetch, trpc } from "~/trpc/server";

export default async function FriendsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  prefetch(
    trpc.friends.friendList.infiniteQueryOptions({
      limit: 100,
      cursor: 1,
    }),
  );

  return (
    <HydrateClient>
      <div className="">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="mb-6 flex items-center gap-4">
              <div className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 p-3">
                <Handshake className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  Friends
                </h1>
                {/* <p className="text-slate-600 dark:text-slate-400">
                  You can view and manage your friends here.
                </p> */}
              </div>
            </div>
          </div>

          <Suspense fallback={<Skeleton className="h-10 w-full" />}>
            <FriendsList />
          </Suspense>
        </div>
      </div>
    </HydrateClient>
  );
}
