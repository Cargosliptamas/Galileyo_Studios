import { Suspense } from "react";
import { redirect } from "next/navigation";

import { getSession } from "~/auth/server";
import {
  ChatRecipients,
  ChatRecipientsSkeleton,
} from "~/components/chat/chat-recipients";
import { HydrateClient, prefetch, trpc } from "~/trpc/server";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    return redirect("/login");
  }

  prefetch(
    trpc.profile.getTestFriends.queryOptions({
      limit: 10,
      cursor: 0,
    }),
  );

  return (
    <HydrateClient>
      <div className="flex flex-row">
        <div className="h-[calc(100vh-theme(spacing.16))] w-64 border-r border-red-500 px-2">
          <div className="flex flex-row items-center justify-between">
            <span className="text-lg font-semibold">Friends</span>
          </div>
          <div>
            <Suspense fallback={<ChatRecipientsSkeleton />}>
              <ChatRecipients />
            </Suspense>
          </div>
        </div>
        {children}
      </div>
    </HydrateClient>
  );
}
