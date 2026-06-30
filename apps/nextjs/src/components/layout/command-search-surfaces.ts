import type { LucideIcon } from "lucide-react";
import {
  Bookmark,
  ChartBar,
  Clapperboard,
  Compass,
  CreditCard,
  Flame,
  Home,
  MapIcon,
  MessageSquare,
  Newspaper,
  Settings,
  UserRound,
  Users,
  Video,
} from "lucide-react";

import type { User } from "~/auth/client";
import { fuzzySearch } from "~/lib/fuzzy-search";

export type SurfaceKind = "page" | "feature";

export interface SurfaceItem {
  key: string;
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
  kind: SurfaceKind;
  keywords: string[];
  requiresInfluencer?: boolean;
  requiresAdmin?: boolean;
  requiresMap?: boolean;
  hideForTestAccount?: boolean;
}

export type SurfaceFilterUser = Pick<User, "email" | "isInfluencer" | "role">;

export const SURFACE_CATALOG: SurfaceItem[] = [
  {
    key: "page-dashboard",
    label: "Home",
    description: "Jump to your main feed hub",
    href: "/dashboard",
    icon: Home,
    kind: "page",
    keywords: ["feed", "home", "timeline"],
  },
  {
    key: "page-discover",
    label: "Discover",
    description: "Explore global public content",
    href: "/dashboard?tab=discover",
    icon: Compass,
    kind: "page",
    keywords: ["discover", "explore", "for-you"],
  },
  {
    key: "page-subscriptions",
    label: "Subscriptions",
    description: "Content from your subscribed channels",
    href: "/dashboard?tab=subscriptions",
    icon: Newspaper,
    kind: "page",
    keywords: ["following", "subscriptions", "my feed"],
  },
  {
    key: "page-videos",
    label: "Videos",
    description: "Scroll the short-form video feed",
    href: "/videos",
    icon: Video,
    kind: "page",
    keywords: ["reels", "clips", "shorts"],
  },
  {
    key: "page-chat",
    label: "Chat",
    description: "Open conversations and group messages",
    href: "/chat",
    icon: MessageSquare,
    kind: "page",
    keywords: ["messages", "dm", "conversation"],
  },
  {
    key: "page-bookmarks",
    label: "Bookmarks",
    description: "Review your saved posts and clips",
    href: "/bookmarks",
    icon: Bookmark,
    kind: "page",
    keywords: ["saved", "favorites"],
  },
  {
    key: "page-friends",
    label: "Friends",
    description: "Manage your social graph",
    href: "/friends",
    icon: Users,
    kind: "page",
    keywords: ["followers", "connections"],
  },
  {
    key: "page-profile",
    label: "Profile",
    description: "View and edit your profile settings",
    href: "/profile",
    icon: UserRound,
    kind: "page",
    keywords: ["account", "profile settings"],
  },
  {
    key: "page-my-feeds",
    label: "My Feeds",
    description: "Manage private and influencer feeds",
    href: "/my-feeds",
    icon: Newspaper,
    kind: "page",
    keywords: ["private feeds", "channels"],
  },
  {
    key: "page-studios",
    label: "Studios",
    description: "Original short-form films from Galileyo Studios",
    href: "/",
    icon: Clapperboard,
    kind: "page",
    keywords: ["studios", "films", "episodes", "watch", "cinema"],
  },
  {
    key: "page-payment",
    label: "Payment",
    description: "Billing methods and invoices",
    href: "/payment",
    icon: CreditCard,
    kind: "page",
    keywords: ["billing", "plans", "subscription"],
    hideForTestAccount: true,
  },
  {
    key: "page-analytics",
    label: "Analytics",
    description: "Track creator and feed performance",
    href: "/analytics",
    icon: ChartBar,
    kind: "page",
    keywords: ["stats", "metrics", "insights"],
    requiresInfluencer: true,
  },
  {
    key: "page-members",
    label: "Members",
    description: "Member access and admin controls",
    href: "/members",
    icon: Users,
    kind: "page",
    keywords: ["team", "admin"],
    requiresAdmin: true,
  },
  {
    key: "page-alerts-map",
    label: "Alerts Map",
    description: "Live map of alerts and incidents",
    href: "/alerts-map",
    icon: MapIcon,
    kind: "page",
    keywords: ["map", "alerts", "incidents"],
    requiresMap: true,
  },
  {
    key: "feature-trending-discover",
    label: "Trending Discover Feed",
    description: "Open discover and scan trending posts quickly",
    href: "/dashboard?tab=discover",
    icon: Flame,
    kind: "feature",
    keywords: ["trending", "discover", "for-you"],
  },
  {
    key: "feature-open-bookmarks",
    label: "Saved Highlights",
    description: "Open your saved collection instantly",
    href: "/bookmarks",
    icon: Bookmark,
    kind: "feature",
    keywords: ["saved", "bookmarked", "favorites"],
  },
  {
    key: "feature-creator-studio",
    label: "Creator Analytics Studio",
    description: "Dive deeper into creator performance metrics",
    href: "/creator/analytics",
    icon: ChartBar,
    kind: "feature",
    keywords: ["creator", "analytics", "studio"],
    requiresInfluencer: true,
  },
  {
    key: "feature-edit-profile",
    label: "Tune Profile Settings",
    description: "Update profile, privacy, and account controls",
    href: "/profile",
    icon: Settings,
    kind: "feature",
    keywords: ["settings", "privacy", "account"],
  },
];

export const isSurfaceVisibleToUser = (
  surface: SurfaceItem,
  user: SurfaceFilterUser,
  showMap: boolean,
) => {
  const isTestAccount = user.email.trim().toLowerCase() === "test@galileyo.com";
  if (surface.requiresInfluencer && !user.isInfluencer) return false;
  if (surface.requiresAdmin && user.role !== 1) return false;
  if (surface.requiresMap && !showMap) return false;
  if (surface.hideForTestAccount && isTestAccount) return false;
  return true;
};

export function getVisibleSurfaceItems(
  user: SurfaceFilterUser,
  showMap: boolean,
) {
  return SURFACE_CATALOG.filter((surface) =>
    isSurfaceVisibleToUser(surface, user, showMap),
  );
}

const matchesSurfaceQuery = (surface: SurfaceItem, rawQuery: string) => {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return true;

  const label = surface.label.toLowerCase();
  const description = surface.description.toLowerCase();
  const joinedKeywords = surface.keywords.join(" ").toLowerCase();

  return (
    label.includes(query) ||
    description.includes(query) ||
    joinedKeywords.includes(query) ||
    fuzzySearch(query, label) ||
    fuzzySearch(query, description)
  );
};

export function filterSurfaceItems(
  query: string,
  user: SurfaceFilterUser,
  showMap: boolean,
) {
  const visible = getVisibleSurfaceItems(user, showMap);
  const all = visible.filter((surface) => matchesSurfaceQuery(surface, query));
  const pages = getPageSurfaceItems(all);
  const features = getFeatureSurfaceItems(all);

  return { all, pages, features };
}

export const getPageSurfaceItems = (items: SurfaceItem[]) =>
  items.filter((surface) => surface.kind === "page");

export const getFeatureSurfaceItems = (items: SurfaceItem[]) =>
  items.filter((surface) => surface.kind === "feature");
