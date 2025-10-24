import { createEnv } from "@t3-oss/env-nextjs";
import { vercel } from "@t3-oss/env-nextjs/presets-zod";
import { z } from "zod/v4";

import { authEnv } from "@galileyo/auth/env";

export const env = createEnv({
  extends: [authEnv(), vercel()],
  shared: {
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
  },
  /**
   * Specify your server-side environment variables schema here.
   * This way you can ensure the app isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z.url(),
    EMAIL_IS_SECURE: z.coerce.boolean().default(false),
    EMAIL_HOST: z.string().default("localhost"),
    EMAIL_PORT: z.coerce.number().default(1026),
    EMAIL_USER: z.string().nullish().default(null),
    EMAIL_PASSWORD: z.string().nullish().default(null),
    EMAIL_FROM: z.string().default("no-reply@galileyo.com"),
    VAPID_PRIVATE_KEY: z.string().default(""),
    GROWTHBOOK_CLIENT_KEY: z.string().optional(),
    GROWTHBOOK_API_HOST: z.string().optional(),
    ZYTE_API_KEY: z.string().optional(),
    DISASTERAWARE_USERNAME: z.string().min(1),
    DISASTERAWARE_PASSWORD: z.string().min(1),
  },

  /**
   * Specify your client-side environment variables schema here.
   * For them to be exposed to the client, prefix them with `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_API_URL: z.url(),
    NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().default(""),
    NEXT_PUBLIC_STYLEGUIDE_ENABLED: z.coerce.boolean().default(false),
    NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
    NEXT_PUBLIC_POSTHOG_HOST: z.string().optional(),
    NEXT_PUBLIC_ZYTE_ENABLED: z.coerce.boolean().default(false),
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
    NEXT_PUBLIC_ZYTE_ENABLED: process.env.NEXT_PUBLIC_ZYTE_ENABLED,
  },
  skipValidation:
    !!process.env.CI || process.env.npm_lifecycle_event === "lint",
});
