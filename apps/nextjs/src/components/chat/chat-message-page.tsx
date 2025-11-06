"use client";

import { useSuspenseQuery } from "@tanstack/react-query";

import { Skeleton } from "@galileyo/ui/skeleton";

import { useTRPC } from "~/trpc/react";
import { ChatInput, ChatMessages } from "./chat-provider";

export function ChatMessagePage({ chatId }: { chatId: number }) {
  const trpc = useTRPC();

  const { data, isLoading, isFetching } = useSuspenseQuery(
    trpc.chat.getFriendChat.queryOptions({
      userId: chatId,
      limit: 100,
    }),
  );

  const messages = data.list;

  return (
    <div className="flex h-[calc(100vh-theme(spacing.24))] flex-col">
      <div className="flex-1 overflow-y-auto">
        <ChatMessages
          conversationId={data.id}
          messages={messages}
          isLoading={isLoading}
          userName={"aaa"}
          userPhoto={
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100&h=100"
          }
        />
      </div>
      {isFetching ? (
        <Skeleton className="h-10 w-full" />
      ) : (
        <ChatInput conversationId={data.id} userId={chatId} />
      )}
    </div>
  );
}
