import type { GetLatestNewsParamTypes } from "@galileyo/validators/feed";

type FeedTypes = GetLatestNewsParamTypes["type"];

export function getDashboardActiveTab(tab?: string): FeedTypes {
  return tab === "discover" ? "discover" : "subscriptions";
}

export function getDashboardUrl(tab?: string): string {
  if (tab === "discover" || tab === "subscriptions") {
    return `/dashboard?tab=${encodeURIComponent(tab)}`;
  }

  return "/dashboard";
}

export function getDashboardDeepLinkCallbackUrl(
  postId: number,
  tab?: string,
): string {
  if (tab === "discover" || tab === "subscriptions") {
    return `/dashboard/${postId}?tab=${encodeURIComponent(tab)}`;
  }

  return `/dashboard/${postId}`;
}
