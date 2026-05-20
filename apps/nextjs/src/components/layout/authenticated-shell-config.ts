"use client";

import type { LayoutDashboard } from "lucide-react";
import {
  Ellipsis,
  Home,
  MapIcon,
  MessageSquare,
  UserRound,
  Video,
} from "lucide-react";

import type { SurfaceFilterUser, SurfaceItem } from "./command-search-surfaces";
import type { User } from "~/auth/client";
import { getVisibleSurfaceItems } from "./command-search-surfaces";

export type AuthenticatedShellLayout =
  | "public"
  | "auth-two-column"
  | "auth-three-column"
  | "auth-mobile-videos-immersive";

export interface AuthenticatedTabItem {
  key: "home" | "videos" | "chat" | "map" | "other";
  label: string;
  href?: string;
  icon: typeof LayoutDashboard;
}

export interface AuthenticatedNavigationModel {
  primary: SurfaceItem[];
  secondary: SurfaceItem[];
  account: SurfaceItem[];
  shortcuts: SurfaceItem[];
  mobileOverflow: SurfaceItem[];
  mobileTabs: AuthenticatedTabItem[];
}

const AUTH_ROUTE_PREFIXES = [
  "/dashboard",
  "/videos",
  "/chat",
  "/bookmarks",
  "/friends",
  "/profile",
  "/my-feeds",
  "/payment",
  "/analytics",
  "/creator/analytics",
  "/members",
  "/alerts-map",
  "/search",
] as const;

const THREE_COLUMN_PREFIXES = ["/dashboard", "/videos"] as const;

const PRIMARY_KEYS = [
  "page-dashboard",
  "page-videos",
  "page-chat",
  "page-alerts-map",
] as const;

const SECONDARY_KEYS = [
  "page-bookmarks",
  "page-friends",
  "page-my-feeds",
  "page-studios",
] as const;

const ACCOUNT_KEYS = [
  "page-profile",
  "page-payment",
  "page-analytics",
  "page-members",
  "feature-creator-studio",
  "feature-edit-profile",
  "page-my-feeds",
  "page-bookmarks",
  "page-friends",
] as const;

const MOBILE_OVERFLOW_KEYS = [
  "page-profile",
  "page-bookmarks",
  "page-friends",
  "page-my-feeds",
  "page-payment",
  "page-analytics",
  "page-members",
  "feature-creator-studio",
  "feature-edit-profile",
  "page-discover",
  "page-subscriptions",
] as const;

function matchesRoutePrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function pickVisibleItems(
  visibleByKey: Map<string, SurfaceItem>,
  keys: readonly string[],
) {
  return keys
    .map((key) => visibleByKey.get(key))
    .filter((item): item is SurfaceItem => Boolean(item));
}

export function isAuthenticatedAppDestination(pathname: string) {
  return AUTH_ROUTE_PREFIXES.some((prefix) =>
    matchesRoutePrefix(pathname, prefix),
  );
}

export function getAuthenticatedShellLayout(
  pathname: string,
  isAuthenticated: boolean,
  isMobile: boolean,
): AuthenticatedShellLayout {
  if (!isAuthenticated || !isAuthenticatedAppDestination(pathname)) {
    return "public";
  }

  if (isMobile && matchesRoutePrefix(pathname, "/videos")) {
    return "auth-mobile-videos-immersive";
  }

  if (
    THREE_COLUMN_PREFIXES.some((prefix) => matchesRoutePrefix(pathname, prefix))
  ) {
    return "auth-three-column";
  }

  return "auth-two-column";
}

export function isSurfaceActive(pathname: string, href: string) {
  const [cleanHref] = href.split("?");
  if (!cleanHref) return false;
  return matchesRoutePrefix(pathname, cleanHref);
}

export function getAuthenticatedNavigationModel(
  user: SurfaceFilterUser | User,
  showMap: boolean,
): AuthenticatedNavigationModel {
  const visibleItems = getVisibleSurfaceItems(user, showMap);
  const visibleByKey = new Map(visibleItems.map((item) => [item.key, item]));

  const primary = pickVisibleItems(visibleByKey, PRIMARY_KEYS);
  const secondary = pickVisibleItems(visibleByKey, SECONDARY_KEYS);
  const account = pickVisibleItems(visibleByKey, ACCOUNT_KEYS);
  const shortcuts = [...secondary, ...account].slice(0, 6);
  const mobileOverflow = pickVisibleItems(visibleByKey, MOBILE_OVERFLOW_KEYS);

  const mapSurface = visibleByKey.get("page-alerts-map");

  return {
    primary,
    secondary,
    account,
    shortcuts,
    mobileOverflow,
    mobileTabs: [
      {
        key: "home",
        label: "Home",
        href: "/dashboard",
        icon: Home,
      },
      {
        key: "videos",
        label: "Videos",
        href: "/videos",
        icon: Video,
      },
      {
        key: "chat",
        label: "Chat",
        href: "/chat",
        icon: MessageSquare,
      },
      {
        key: "map",
        label: mapSurface ? "Map" : "Profile",
        href: mapSurface?.href ?? "/profile",
        icon: mapSurface ? MapIcon : UserRound,
      },
      {
        key: "other",
        label: "Other",
        icon: Ellipsis,
      },
    ],
  };
}
