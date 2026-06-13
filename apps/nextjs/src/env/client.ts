import { createEnv } from "@t3-oss/env-nextjs";
import { vercel } from "@t3-oss/env-nextjs/presets-zod";
import { z } from "zod/v4";

export function clientEnv() {
  return createEnv({
    extends: [vercel()],
    shared: {
      NODE_ENV: z
        .enum(["development", "production", "test"])
        .default("development"),
    },
    /**
     * Specify your server-side environment variables schema here.
     * This way you can ensure the app isn't built with invalid env vars.
     */
    server: {},

    /**
     * Specify your client-side environment variables schema here.
     * For them to be exposed to the client, prefix them with `NEXT_PUBLIC_`.
     */
    client: {
      NEXT_PUBLIC_API_URL: z.url(),
      NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().default(""),
      NEXT_PUBLIC_STYLEGUIDE_ENABLED: z
        .enum(["true", "false"])
        .default("false")
        .transform((val) => val === "true"),
      NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
      NEXT_PUBLIC_POSTHOG_HOST: z.string().optional(),
      NEXT_PUBLIC_WS_PORT: z.coerce.number().default(3001),
      NEXT_PUBLIC_WS_FULL_URL: z.string().optional(),
      NEXT_PUBLIC_FEED_LIMIT: z.coerce.number().default(20),
      NEXT_PUBLIC_AD_SPACING: z.coerce.number().default(5),
      NEXT_PUBLIC_AD_NUMBER: z.coerce.number().default(1),
      NEXT_PUBLIC_UPGRADE_AD_SPACING: z.coerce.number().default(18),
      NEXT_PUBLIC_VIDEO_FEED_INITIAL_LIMIT: z.coerce
        .number()
        .int()
        .min(1)
        .default(1),
      NEXT_PUBLIC_VIDEO_FEED_PREFETCH_AHEAD: z.coerce
        .number()
        .int()
        .min(0)
        .default(1),
      NEXT_PUBLIC_WEBHOOKS_ENABLED: z
        .enum(["true", "false"])
        .default("true")
        .transform((val) => val === "true"),
      NEXT_PUBLIC_ANALYTICS_ENABLED: z
        .enum(["true", "false"])
        .default("false")
        .transform((val) => val === "true"),
      NEXT_PUBLIC_ANALYTICS_ID: z.string().optional(),
      NEXT_PUBLIC_PREVIEW_ENABLED: z
        .enum(["true", "false"])
        .default("false")
        .transform((val) => val === "true"),
      NEXT_PUBLIC_DELETE_UNFINISHED_PAYMENT: z
        .enum(["true", "false"])
        .default("false")
        .transform((val) => val === "true"),
      NEXT_PUBLIC_VIDEO_PROXY_ENABLED: z
        .enum(["true", "false"])
        .default("true")
        .transform((val) => val === "true"),
      NEXT_PUBLIC_EPISODE_1_TRAILER_URL: z.string().default(""),
      NEXT_PUBLIC_NEXT_EPISODE_DATE: z.string().default(""),
      NEXT_PUBLIC_STUDIOS_FUNDING_FILM_CURRENT: z.coerce.number().default(0),
      NEXT_PUBLIC_STUDIOS_FUNDING_FILM_TARGET: z.coerce
        .number()
        .default(3500000),
      NEXT_PUBLIC_STUDIOS_FUNDING_GAME_CURRENT: z.coerce.number().default(0),
      NEXT_PUBLIC_STUDIOS_FUNDING_GAME_TARGET: z.coerce
        .number()
        .default(1000000),
      NEXT_PUBLIC_EPISODE_1_HLS_URL: z.string().default(""),
      NEXT_PUBLIC_CLOUDFLARE_IMAGES_ACCOUNT_HASH: z.string().default(""),
    },
    /**
     * Destructure all variables from `process.env` to make sure they aren't tree-shaken away.
     */
    experimental__runtimeEnv: {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      NEXT_PUBLIC_VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      NEXT_PUBLIC_STYLEGUIDE_ENABLED: process.env.NEXT_STYLEGUIDE_ENABLED,
      NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
      NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      NEXT_PUBLIC_WS_PORT: process.env.NEXT_PUBLIC_WS_PORT,
      NEXT_PUBLIC_WS_FULL_URL: process.env.NEXT_PUBLIC_WS_FULL_URL,
      NEXT_PUBLIC_FEED_LIMIT: process.env.NEXT_PUBLIC_FEED_LIMIT,
      NEXT_PUBLIC_AD_SPACING: process.env.NEXT_PUBLIC_AD_SPACING,
      NEXT_PUBLIC_AD_NUMBER: process.env.NEXT_PUBLIC_AD_NUMBER,
      NEXT_PUBLIC_UPGRADE_AD_SPACING:
        process.env.NEXT_PUBLIC_UPGRADE_AD_SPACING,
      NEXT_PUBLIC_VIDEO_FEED_INITIAL_LIMIT:
        process.env.NEXT_PUBLIC_VIDEO_FEED_INITIAL_LIMIT,
      NEXT_PUBLIC_VIDEO_FEED_PREFETCH_AHEAD:
        process.env.NEXT_PUBLIC_VIDEO_FEED_PREFETCH_AHEAD,
      NEXT_PUBLIC_WEBHOOKS_ENABLED: process.env.NEXT_PUBLIC_WEBHOOKS_ENABLED,
      NEXT_PUBLIC_ANALYTICS_ENABLED: process.env.NEXT_PUBLIC_ANALYTICS_ENABLED,
      NEXT_PUBLIC_ANALYTICS_ID: process.env.NEXT_PUBLIC_ANALYTICS_ID,
      NEXT_PUBLIC_PREVIEW_ENABLED: process.env.NEXT_PUBLIC_PREVIEW_ENABLED,
      NEXT_PUBLIC_DELETE_UNFINISHED_PAYMENT:
        process.env.NEXT_PUBLIC_DELETE_UNFINISHED_PAYMENT,
      NEXT_PUBLIC_VIDEO_PROXY_ENABLED:
        process.env.NEXT_PUBLIC_VIDEO_PROXY_ENABLED,
      NEXT_PUBLIC_EPISODE_1_TRAILER_URL:
        process.env.NEXT_PUBLIC_EPISODE_1_TRAILER_URL,
      NEXT_PUBLIC_NEXT_EPISODE_DATE: process.env.NEXT_PUBLIC_NEXT_EPISODE_DATE,
      NEXT_PUBLIC_STUDIOS_FUNDING_FILM_CURRENT:
        process.env.NEXT_PUBLIC_STUDIOS_FUNDING_FILM_CURRENT,
      NEXT_PUBLIC_STUDIOS_FUNDING_FILM_TARGET:
        process.env.NEXT_PUBLIC_STUDIOS_FUNDING_FILM_TARGET,
      NEXT_PUBLIC_STUDIOS_FUNDING_GAME_CURRENT:
        process.env.NEXT_PUBLIC_STUDIOS_FUNDING_GAME_CURRENT,
      NEXT_PUBLIC_STUDIOS_FUNDING_GAME_TARGET:
        process.env.NEXT_PUBLIC_STUDIOS_FUNDING_GAME_TARGET,
      NEXT_PUBLIC_EPISODE_1_HLS_URL: process.env.NEXT_PUBLIC_EPISODE_1_HLS_URL,
      NEXT_PUBLIC_CLOUDFLARE_IMAGES_ACCOUNT_HASH:
        process.env.NEXT_PUBLIC_CLOUDFLARE_IMAGES_ACCOUNT_HASH,
    },
    skipValidation:
      !!process.env.CI || process.env.npm_lifecycle_event === "lint",
  });
}

export const env = clientEnv();
