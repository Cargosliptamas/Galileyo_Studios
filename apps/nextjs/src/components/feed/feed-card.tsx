/* eslint-disable @next/next/no-img-element */
import {
  AlertTriangle,
  Bookmark,
  Heart,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Satellite,
  Share,
} from "lucide-react";

import type { FeedItem, InfluencerItem } from "@galileyo/api";
import { Button } from "@galileyo/ui/button";
import { Card, CardContent, CardHeader } from "@galileyo/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@galileyo/ui/dropdown-menu";
import { Separator } from "@galileyo/ui/separator";

import { useCommentsModal } from "~/hooks/use-comments-modal";
import { UserAvatar } from "./user-avatar";

export default function FeedCard({ item }: { item: FeedItem }) {
  const { openModal } = useCommentsModal();
  const getPostTypeIcon = (type: string, emergencyLevel?: string) => {
    switch (type) {
      case "emergency":
        return (
          <div
            className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
              emergencyLevel === "critical"
                ? "bg-red-500/20 text-red-400"
                : emergencyLevel === "high"
                  ? "bg-orange-500/20 text-orange-400"
                  : emergencyLevel === "medium"
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-blue-500/20 text-blue-400"
            }`}
          >
            <AlertTriangle className="h-3 w-3" />
            Emergency Alert
          </div>
        );
      case "satellite_update":
        return (
          <div className="flex items-center gap-1 rounded-full bg-cyan-500/20 px-2 py-1 text-xs font-medium text-cyan-400">
            <Satellite className="h-3 w-3" />
            Network Update
          </div>
        );
      default:
        return null;
    }
  };

  const handleLike = () => {
    console.log("handleLike");
  };

  const handleBookmark = () => {
    console.log("handleBookmark");
  };

  const isInfluencer = item.type === "influencer";
  const isVerified = item.type !== "aaa";

  const formatNumber = (num: number | null | undefined) => {
    if (num === null || num === undefined) {
      return "0";
    }

    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k";
    }

    return num.toString();
  };

  return (
    // <Card className="max-w-3xl mx-auto">
    <Card className="border-slate-200 bg-white/50 transition-colors hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-600">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <UserAvatar
              name={item.title}
              image={(item as InfluencerItem).image ?? ""}
              isVerified={isVerified}
              isInfluencer={isInfluencer}
            >
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <span>{item.title}</span>
                <span>•</span>
                <span>{item.created_at}</span>
                {item.location && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{item.location}</span>
                    </div>
                  </>
                )}
              </div>
            </UserAvatar>
            {/* <Avatar className="w-12 h-12">
                <AvatarImage src={(item as InfluencerItem).image ?? ''} alt={item.title} />
                <AvatarFallback className="bg-slate-700 text-white">
                  {(item.title || '').split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-white">{item.title}</h3>
                  {isVerified && (
                    <Verified className="w-4 h-4 text-cyan-400 fill-current" />
                  )}
                  {isInfluencer && (
                    <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs font-medium rounded">
                      Influencer
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <span>{item.title}</span>
                  <span>•</span>
                  <span>{item.created_at}</span>
                  {item.location && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{item.location}</span>
                      </div>
                    </>
                  )}
                </div>
              </div> */}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Follow {item.title}</DropdownMenuItem>
              <DropdownMenuItem>Mute {item.title}</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-500 hover:bg-slate-700 dark:text-red-400">
                Report Post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Post Type Badge */}
        {getPostTypeIcon(item.type, item.emergency_level ?? undefined)}
      </CardHeader>

      <CardContent className="pt-0">
        {/* Post Content */}
        <p className="mb-4 leading-relaxed">{item.body}</p>

        {/* Post Image */}
        {item.images.length > 0 && (
          <div className="mb-4 overflow-hidden rounded-lg max-w-md mx-auto">
            <img
              src={item.images[0]?.sizes[0]?.url ?? ""}
              alt="Post content"
              className="h-auto w-full object-cover"
            />
          </div>
        )}

        {/* Satellite Info */}
        {/* {post.satelliteInfo && (
            <div className="mb-4 p-3 bg-slate-900/50 border border-slate-600 rounded-lg">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span className="text-slate-300">Coverage: </span>
                  <span className="text-cyan-400 font-medium">{post.satelliteInfo.coverage}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span className="text-slate-300">Signal: </span>
                  <span className="text-green-400 font-medium">{post.satelliteInfo.signal}</span>
                </div>
              </div>
            </div>
          )} */}

        <Separator className="my-4 bg-slate-200 dark:bg-slate-700" />

        {/* Post Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={() => handleLike()}
              className={`flex items-center gap-2 transition-colors ${
                (item.is_liked ?? false)
                  ? "text-red-400 hover:text-red-300"
                  : "text-slate-500 hover:text-red-400 dark:text-slate-400"
              }`}
            >
              <Heart
                className={`h-5 w-5 ${item.is_liked ? "fill-current" : ""}`}
              />
              <span className="text-sm font-medium">
                {formatNumber(/*item.likes*/ 0)}
              </span>
            </button>

            <button
              className="flex items-center gap-2 text-slate-500 transition-colors hover:text-cyan-500 dark:text-slate-400 dark:hover:text-cyan-400"
              onClick={() => openModal(item)}
            >
              <MessageCircle className="h-5 w-5" />
              <span className="text-sm font-medium">
                {formatNumber(item.comment_quantity)}
              </span>
            </button>

            <button className="flex items-center gap-2 text-slate-500 transition-colors hover:text-green-400 dark:text-slate-400">
              <Share className="h-5 w-5" />
              <span className="text-sm font-medium">{formatNumber(0)}</span>
            </button>
          </div>

          <button
            onClick={() => handleBookmark()}
            className={`rounded-full p-2 transition-colors ${
              (item.is_bookmarked ?? false)
                ? "text-yellow-400 hover:text-yellow-300"
                : "text-slate-500 hover:text-yellow-400 dark:text-slate-400"
            }`}
          >
            <Bookmark
              className={`h-5 w-5 ${item.is_bookmarked ? "fill-current" : ""}`}
            />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
