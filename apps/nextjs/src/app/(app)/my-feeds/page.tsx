import { redirect } from "next/navigation";
import { Newspaper } from "lucide-react";

import { getSession } from "~/auth/server";
import { MyFeedSwitcher } from "~/components/my-feed/my-feed-switcher";
import { HydrateClient } from "~/trpc/server";

export default async function MyFeedsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return (
    <HydrateClient>
      <div className="">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="mb-6 flex items-center gap-4">
              <div className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 p-3">
                <Newspaper className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  My Feeds
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  You can view and manage your feeds here.
                </p>
              </div>
            </div>
          </div>

          <MyFeedSwitcher isInfluencer={session.user.isInfluencer ?? false} />
        </div>
      </div>
    </HydrateClient>
  );
}
