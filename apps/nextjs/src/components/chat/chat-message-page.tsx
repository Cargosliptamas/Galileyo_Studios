"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@galileyo/ui/button";
import { useIsMobile } from "@galileyo/ui/hooks";
import { Skeleton } from "@galileyo/ui/skeleton";

import { env } from "~/env/client";
import { useTRPC } from "~/trpc/react";
import { useChatPage } from "./chat-page-provider";
import { ChatInput, ChatMessages } from "./chat-provider";

export function ChatPageHeader() {
  const { show, setShow } = useChatPage();
  const isMobile = useIsMobile();

  if (!isMobile) {
    return null;
  }

  return (
    <div className="absolute left-0 top-0 z-10 flex flex-row items-center justify-between">
      <Button variant="outline" size="icon" onClick={() => setShow(!show)}>
        {show ? (
          <ChevronLeft className="size-4" />
        ) : (
          <ChevronRight className="size-4" />
        )}
      </Button>
    </div>
  );
}

export function ChatMessagePage({ chatId }: { chatId: number }) {
  const trpc = useTRPC();

  const { data, isLoading, isFetching } = useQuery(
    trpc.chat.getFriendChat.queryOptions({
      userId: chatId,
      limit: 100,
    }),
  );

  const messages =
    data?.list.sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    ) ?? [];
  const otherUser = messages.find((message) => message.is_my === false)?.user;

  return (
    <div className="relative flex h-[calc(100vh-theme(spacing.24))] flex-col">
      <ChatPageHeader />
      <div className="flex-1 overflow-y-auto">
        <ChatMessages
          conversationId={data?.id ?? 0}
          messages={messages}
          isLoading={isLoading}
          userName={otherUser?.full_name ?? ""}
          userPhoto={
            otherUser?.photo
              ? `${env.NEXT_PUBLIC_API_URL.replace("/v1", "")}${otherUser.photo}`
              : ""
          }
        />
      </div>
      {isFetching ? (
        <Skeleton className="h-10 w-full" />
      ) : (
        <ChatInput
          conversationId={data?.id ?? 0}
          userId={chatId}
          isFriendChat={true}
        />
      )}
    </div>
  );
}
