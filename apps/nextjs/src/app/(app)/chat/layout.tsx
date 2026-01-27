import { redirect } from "next/navigation";

import { getSession } from "~/auth/server";
import { ChatPageProvider } from "~/components/chat/chat-page-provider";
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
    trpc.friends.friendList.queryOptions({
      limit: 10,
      cursor: 0,
    }),
  );

  return (
    <HydrateClient>
      <ChatPageProvider>
        {/* <div className="flex flex-row p-2 h-[calc(100vh-theme(spacing.20))]">
          <div className="w-full h-full md:w-64 md:border-r px-2">
            <div className="flex flex-row items-center justify-between">
              <span className="text-lg font-semibold">Friends</span>
            </div>
            <div>
              <Suspense fallback={<ChatRecipientsSkeleton />}>
                <ChatRecipients />
              </Suspense>
            </div>
          </div> */}
        {children}
        {/* </div> */}
      </ChatPageProvider>
    </HydrateClient>
  );
}
