"use client";

import { BellIcon, CheckIcon, XIcon, UserPlusIcon, HeartIcon, MessageCircleIcon } from "lucide-react";
import { useState } from "react";

import { Badge } from "@galileyo/ui/badge";
import { Button } from "@galileyo/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@galileyo/ui/popover";
import { ScrollArea } from "@galileyo/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@galileyo/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@galileyo/ui/avatar";
import { useTRPC } from "~/trpc/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@galileyo/ui";


// Mock data types - replace with your actual types
interface Notification {
  id: string;
  type: "like" | "comment" | "follow" | "mention" | "system";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  user?: {
    id: string;
    full_name: string;
    photo?: string;
  };
  post?: {
    id: string;
    title: string;
  };
}

interface FriendRequest {
  id: number;
  full_name: string;
  photo?: string;
  timestamp?: Date;
  mutualFriends?: number;
}

const mockNotifications: Notification[] = [
  // {
  //   id: "1",
  //   type: "like",
  //   title: "New Like",
  //   message: "John Doe liked your post",
  //   timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
  //   read: false,
  //   user: {
  //     id: "1",
  //     name: "John Doe",
  //     avatar: "/avatars/john.jpg",
  //   },
  //   post: {
  //     id: "1",
  //     title: "My awesome post",
  //   },
  // },
  // {
  //   id: "2",
  //   type: "comment",
  //   title: "New Comment",
  //   message: "Sarah commented on your post",
  //   timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
  //   read: false,
  //   user: {
  //     id: "2",
  //     name: "Sarah Wilson",
  //     avatar: "/avatars/sarah.jpg",
  //   },
  //   post: {
  //     id: "2",
  //     title: "Another post",
  //   },
  // },
  // {
  //   id: "3",
  //   type: "follow",
  //   title: "New Follower",
  //   message: "Mike Johnson started following you",
  //   timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
  //   read: true,
  //   user: {
  //     id: "3",
  //     name: "Mike Johnson",
  //     avatar: "/avatars/mike.jpg",
  //   },
  // },
  // {
  //   id: "4",
  //   type: "system",
  //   title: "System Notification",
  //   message: "Your account has been verified",
  //   timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  //   read: true,
  // },
];

function NotificationItem({ notification }: { notification: Notification }) {
  const getNotificationIcon = () => {
    switch (notification.type) {
      case "like":
        return <HeartIcon className="h-4 w-4 text-red-500" />;
      case "comment":
        return <MessageCircleIcon className="h-4 w-4 text-blue-500" />;
      case "follow":
        return <UserPlusIcon className="h-4 w-4 text-green-500" />;
      case "mention":
        return <MessageCircleIcon className="h-4 w-4 text-purple-500" />;
      case "system":
        return <BellIcon className="h-4 w-4 text-gray-500" />;
      default:
        return <BellIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  /*const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  };*/

  return (
    <div className={`flex items-start gap-3 p-3 hover:bg-muted/50 transition-colors ${!notification.read ? "bg-blue-50/50 dark:bg-blue-950/20" : ""}`}>
      <div className="flex-shrink-0">
        {notification.user ? (
          <Avatar className="h-8 w-8">
            <AvatarImage src={notification.user.photo} alt={notification.user.full_name} />
            <AvatarFallback>{notification.user.full_name.charAt(0)}</AvatarFallback>
          </Avatar>
        ) : (
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
            {getNotificationIcon()}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground truncate">
            {notification.title}
          </p>
          {!notification.read && (
            <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {/*formatTimestamp(request.timestamp)*/}
        </p>
      </div>
    </div>
  );
}

function FriendRequestItem({ request }: { request: FriendRequest }) {
  /*const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  };*/
  
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const agreeFriendRequest = useMutation(
    trpc.friends.agreeFriendRequest.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.friends.pathFilter());
        toast.success("Friend request accepted");
      },
      onError: (err) => {
        toast.error(err.message);
      },
    })
  );

  const handleAccept = () => {
    agreeFriendRequest.mutate({ id_user: Number(request.id) });
  };

  const handleDecline = () => {
    denyFriendRequest.mutate({ id_user: Number(request.id) });
  };

  const denyFriendRequest = useMutation(
    trpc.friends.denyFriendRequest.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.friends.pathFilter());
        toast.success("Friend request denied");
      },
      onError: (err) => {
        toast.error(err.message);
      },
    })
  );

  return (
    <div className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors">
      <Avatar className="h-10 w-10">
        <AvatarImage src={request.photo} alt={request.full_name} />
        <AvatarFallback>{request.full_name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {request.full_name}
        </p>
        {request.mutualFriends && (
          <p className="text-xs text-muted-foreground">
            {request.mutualFriends} mutual friends 
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          {/*formatTimestamp(request.timestamp)*/}
        </p>
      </div>
      <div className="flex gap-1">
        <Button
          size="sm"
          variant="outline"
          onClick={handleAccept}
          className="h-8 px-3"
        >
          <CheckIcon className="h-3 w-3" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleDecline}
          className="h-8 px-3"
        >
          <XIcon className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("notifications");
  const [notifications] = useState<Notification[]>(mockNotifications);
  //const [friendRequests] = useState<FriendRequest[]>(mockFriendRequests);

  const trpc = useTRPC();
  const { data } = useQuery(
    trpc.friends.getFriendRequestToYou.queryOptions(),
  );

  const friendRequests = data?.list ?? [];

  const unreadNotifications = notifications.filter(n => !n.read).length;
  const totalUnread = unreadNotifications + friendRequests.length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
        >
          <BellIcon className="h-5 w-5" />
          {totalUnread > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {totalUnread > 99 ? "99+" : totalUnread}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600" align="end">
        <Tabs className="w-full" value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-2 rounded-none border-b">
            <TabsTrigger value="notifications" className="rounded-none">
              <div className="flex items-center gap-2">
                Notifications
                {unreadNotifications > 0 && (
                  <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                    {unreadNotifications}
                  </Badge>
                )}
              </div>
            </TabsTrigger>
            <TabsTrigger value="requests" className="rounded-none">
              <div className="flex items-center gap-2">
                Requests
                {friendRequests.length > 0 && (
                  <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                    {friendRequests.length}
                  </Badge>
                )}
              </div>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="notifications" className="m-0">
            <ScrollArea className="h-80">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <BellIcon className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="requests" className="m-0">
            <ScrollArea className="h-80">
              {friendRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <UserPlusIcon className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No friend requests</p>
                </div>
              ) : (
                <div className="divide-y">
                  {friendRequests.map((request) => (
                    <FriendRequestItem
                      key={request.id}
                      request={request}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
        
        {notifications.length > 0 && tab === "notifications" && (
          <div className="border-t p-3">
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => {
                // Handle mark all as read
                console.log("Mark all as read");
              }}
            >
              Mark all as read
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
