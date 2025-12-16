import { env } from "~/env/client";

export const FEED_LIMIT = env.NEXT_PUBLIC_FEED_LIMIT;

// Ad configuration
export const AD_SPACING = env.NEXT_PUBLIC_AD_SPACING; // Show an ad after every X posts
export const AD_NUMBER = env.NEXT_PUBLIC_AD_NUMBER; // Number of ads to show per ad break
export const UPGRADE_AD_SPACING = env.NEXT_PUBLIC_UPGRADE_AD_SPACING; // Show an upgrade ad after every X posts
