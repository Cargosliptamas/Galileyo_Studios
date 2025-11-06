"use client";

import { useParams, useRouter } from "next/navigation";
import { useSuspenseQuery } from "@tanstack/react-query";

import { cn } from "@galileyo/ui";
import { Avatar, AvatarFallback, AvatarImage } from "@galileyo/ui/avatar";
import { Skeleton } from "@galileyo/ui/skeleton";

import { useTRPC } from "~/trpc/react";

export function ChatRecipientsSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 10 }).map((_, index) => (
        <Skeleton key={index} className="h-10 w-full rounded-lg" />
      ))}
    </div>
  );
}

function isActive(chatId: string, friendId: string) {
  return chatId === friendId;
}

export function ChatRecipients() {
  const trpc = useTRPC();
  const router = useRouter();
  const { chatId } = useParams<{ chatId: string }>();

  const { data: friends } = useSuspenseQuery(
    trpc.friends.friendList.queryOptions({
      limit: 10,
      cursor: 0,
    }),
  );

  return (
    <div className="flex flex-col gap-2">
      {friends.list.map((friend) => (
        <div
          key={friend.id}
          onClick={() => {
            if (!isActive(chatId, friend.id.toString())) {
              router.push(`/chat/${friend.id}`);
            }
          }}
          className={cn(
            "flex w-60 cursor-pointer flex-row gap-2 rounded-lg p-2 hover:bg-muted/50",
            isActive(chatId, friend.id.toString()) && "bg-muted/50",
          )}
        >
          <Avatar className="size-10">
            <AvatarImage src={friend.photo} alt={friend.full_name} />
            <AvatarFallback>{friend.full_name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{friend.full_name}</span>
        </div>
      ))}
    </div>
  );
}
