/* eslint-disable @next/next/no-img-element */
import { useMemo } from "react";
import {
  AlertTriangle,
  Bookmark,
  // Globe,
  // Shield,
  Heart,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Satellite,
  Share,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import type {
  FeedItem,
  FinancialItem,
  InfluencerItem,
} from "@galileyo/api/schemas";
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

function formatPrice(price: string | number | null | undefined) {
  const priceNumber =
    typeof price === "string" ? parseFloat(price) : (price ?? 0);

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(priceNumber);
}

export default function FeedCard({
  item,
  isMocked = false,
}: {
  item: FeedItem;
  isMocked?: boolean;
}) {
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

  const getUserAvatarIcon = (item: FeedItem) => {
    switch (item.type) {
      case "influencer":
        return (item as InfluencerItem).image ?? null;
      case "financial":
        // TODO: add financial avatar icon
        return null;
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

  const hasActions = useMemo(() => {
    return item.type !== "financial" && item.type !== "not_sended_yet";
  }, [item]);

  const isInfluencer = item.type === "influencer";
  const isVerified = ["influencer", "financial", "not_sended_yet"].includes(
    item.type,
  );

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
              image={getUserAvatarIcon(item)}
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
        {item.type !== "financial" && (
          <p className="mb-4 leading-relaxed">{item.body}</p>
        )}

        {/* Post Image */}
        {item.images.length > 0 && (
          <div className="mx-auto mb-4 max-w-md overflow-hidden rounded-lg">
            <img
              src={item.images[0]?.sizes[0]?.url ?? ""}
              alt="Post content"
              className="h-auto w-full object-cover"
            />
          </div>
        )}

        {/* Satellite Info */}
        {/* {1 == 1 && (
          <div className="mb-4 p-3 bg-slate-900/50 border border-slate-600 rounded-lg">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span className="text-slate-300">Coverage: </span>
                <span className="text-cyan-400 font-medium">{100}</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-slate-300">Signal: </span>
                <span className="text-green-400 font-medium">{32}</span>
              </div>
            </div>
          </div>
        )} */}

        {item.type === "financial" && (
          <div className="">
            <div className="mb-1 text-2xl font-bold text-slate-900 dark:text-white">
              {formatPrice((item as unknown as FinancialItem).price)}
            </div>
            <div
              className={`flex items-center gap-1 text-sm font-medium ${
                (item as unknown as FinancialItem).percent >= 0
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {(item as unknown as FinancialItem).percent >= 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span>
                {(item as unknown as FinancialItem).percent >= 0 ? "+" : ""}
                {(item as unknown as FinancialItem).percent.toFixed(2)}
              </span>
              <span>
                ({(item as unknown as FinancialItem).percent >= 0 ? "+" : ""}
                {(item as unknown as FinancialItem).percent.toFixed(2)}%)
              </span>
            </div>
          </div>
        )}

        {hasActions && (
          <>
            <Separator className="my-4 bg-slate-200 dark:bg-slate-700" />

            {/* Post Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <button
                  onClick={() => handleLike()}
                  disabled={isMocked}
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
                  disabled={isMocked}
                >
                  <MessageCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">
                    {formatNumber(item.comment_quantity)}
                  </span>
                </button>

                <button
                  className="flex items-center gap-2 text-slate-500 transition-colors hover:text-green-400 dark:text-slate-400"
                  disabled={isMocked}
                >
                  <Share className="h-5 w-5" />
                  <span className="text-sm font-medium">{formatNumber(0)}</span>
                </button>
              </div>

              <button
                onClick={() => handleBookmark()}
                disabled={isMocked}
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
          </>
        )}
      </CardContent>
    </Card>
  );
}
