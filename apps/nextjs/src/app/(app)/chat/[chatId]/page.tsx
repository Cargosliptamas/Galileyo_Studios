import { notFound } from "next/navigation";

import type { PageProps } from "~/lib/types/page";
import { ChatMessagePage } from "~/components/chat/chat-message-page";
import { HydrateClient } from "~/trpc/server";

export default async function ChatPage({
  params,
}: PageProps<{ chatId: string }>) {
  const { chatId } = await params;

  if (Number.isNaN(chatId)) {
    return notFound();
  }

  return (
    <HydrateClient>
      <div className="flex-1 overflow-y-auto">
        <ChatMessagePage chatId={Number(chatId)} />
      </div>
    </HydrateClient>
  );
}
