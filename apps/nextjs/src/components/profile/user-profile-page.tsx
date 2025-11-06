"use client";

import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageCircle, UserMinus, UserPlus } from "lucide-react";

import { Card, CardContent, CardFooter, CardHeader, toast } from "@galileyo/ui";
import { Button } from "@galileyo/ui/button";

import { useChat } from "~/components/chat/chat-provider";
import { UserAvatar } from "~/components/feed/user-avatar";
import { ImageWithFallback } from "~/components/image-with-fallback";
import { Readacted } from "~/components/readacted";
import { getUserImageUrl } from "~/lib/image";
import { useTRPC } from "~/trpc/react";

interface UserProfilePageProps {
  profileInfo: {
    id: number;
    name: string;
    image: string | null;
    headerImage: string | null;
    phone: string | null;
    phoneVisible: boolean;
    address: string | null;
    addressVisible: boolean;
    about: string | null;
    isFriend: boolean;
    isFriendRequested: boolean;
    isFriendRequestAcceptable: boolean;
  };
}

export function UserProfilePage({ profileInfo }: UserProfilePageProps) {
  const { openChat } = useChat();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [friendState, setFriendState] = useState<
    "friend" | "friend-requested" | "friend-request-acceptable" | "none"
  >(() => {
    if (profileInfo.isFriend) {
      return "friend";
    } else if (profileInfo.isFriendRequested) {
      return "friend-requested";
    } else if (profileInfo.isFriendRequestAcceptable) {
      return "friend-request-acceptable";
    } else {
      return "none";
    }
  });

  const friendButtonText = useMemo(() => {
    if (friendState === "friend") {
      return "Defriend";
    } else if (friendState === "friend-requested") {
      return "Cancel Request";
    } else if (friendState === "friend-request-acceptable") {
      return "Accept";
    } else {
      return "Add Friend";
    }
  }, [friendState]);

  const addFriend = useMutation(
    trpc.friends.addFriend.mutationOptions({
      onSuccess: () => {
        setFriendState("friend-requested");
        toast.success("Friend request sent");
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }),
  );

  const agreeFriendRequest = useMutation(
    trpc.friends.agreeFriendRequest.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.friends.pathFilter());
        setFriendState("friend");
        toast.success("Friend request accepted");
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }),
  );

  const cancelFriendRequest = useMutation(
    trpc.friends.cancelFriendRequest.mutationOptions({
      onSuccess: () => {
        setFriendState("none");
        toast.success("Friend request cancelled");
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }),
  );

  const deleteFriend = useMutation(
    trpc.friends.deleteFriend.mutationOptions({
      onSuccess: async () => {
        setFriendState("none");
        await queryClient.invalidateQueries(trpc.friends.pathFilter());
        toast.success("Friend removed");
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }),
  );

  const handleMessageClick = () => {
    void openChat(
      profileInfo.id,
      profileInfo.name,
      getUserImageUrl(profileInfo.image) ?? "",
    );
  };

  const handleFriendClick = () => {
    // if (profileInfo.isFriend) {
    //   deleteFriend.mutate({ userId: profileInfo.id });
    // } else {
    //   addFriend.mutate({ userId: profileInfo.id });
    // }
    switch (friendState) {
      case "friend":
        deleteFriend.mutate({ userId: profileInfo.id });
        break;
      case "friend-requested":
        cancelFriendRequest.mutate({ userId: profileInfo.id });
        break;
      case "friend-request-acceptable":
        agreeFriendRequest.mutate({ id_user: profileInfo.id });
        break;
      default:
        addFriend.mutate({ userId: profileInfo.id });
    }
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4">
      <Card className="w-full max-w-full transform border-slate-200 bg-white/50 transition-all duration-300 hover:scale-[1.01] hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-600 md:w-svw">
        <div className="w-full overflow-hidden rounded-t-lg">
          <ImageWithFallback
            src={getUserImageUrl(profileInfo.headerImage)}
            fallback={
              <div className="h-40 w-full bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600" />
            }
            className="h-40 w-full object-cover md:h-56"
          />
        </div>
        <CardHeader className="grid grid-cols-12 justify-between">
          <div className="col-span-12 md:col-span-7">
            <UserAvatar
              name={profileInfo.name}
              image={getUserImageUrl(profileInfo.image)}
              isVerified={false}
              isInfluencer={false}
              size="large"
            />
          </div>
          <div className="col-span-12 flex items-center gap-2 md:col-span-5 md:justify-end">
            <Button
              onClick={handleFriendClick}
              variant={
                friendState === "friend"
                  ? "destructive"
                  : friendState === "friend-requested"
                    ? "secondary"
                    : "primary"
              }
              className="flex items-center gap-2"
            >
              {profileInfo.isFriend ? (
                <>
                  <UserMinus className="size-5" />
                  <span>{friendButtonText}</span>
                </>
              ) : (
                <>
                  <UserPlus className="size-5" />
                  <span>{friendButtonText}</span>
                </>
              )}
            </Button>
            {friendState === "friend" ? (
              <Button
                onClick={handleMessageClick}
                variant="outline"
                size="icon"
              >
                <MessageCircle className="size-5" />
              </Button>
            ) : null}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Phone</span>
              {profileInfo.phoneVisible ? (
                <span>{profileInfo.phone ?? "Not provided"}</span>
              ) : (
                <Readacted className="relative inline-flex h-5 w-28 items-center" />
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Address</span>
              {profileInfo.addressVisible ? (
                <span className="text-right">
                  {profileInfo.address ?? "Not provided"}
                </span>
              ) : (
                <Readacted className="relative inline-flex h-5 w-40 items-center" />
              )}
            </div>
          </div>
        </CardContent>
        {profileInfo.about ? (
          <CardFooter>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              {profileInfo.about}
            </p>
          </CardFooter>
        ) : null}
      </Card>
    </div>
  );
}
