import { createEnv } from "@t3-oss/env-nextjs";
import { vercel } from "@t3-oss/env-nextjs/presets-zod";
import { z } from "zod/v4";

import { authEnv } from "@galileyo/auth/env";
import { emailsEnv } from "@galileyo/emails/env";

export function serverEnv() {
  return createEnv({
    extends: [authEnv(), emailsEnv(), vercel()],
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
      NODE_ENV: z
        .enum(["development", "production", "test"])
        .default("development"),
      DATABASE_URL: z.url(),
      // EMAIL_IS_SECURE: z.coerce.boolean().default(false),
      // EMAIL_HOST: z.string().default("localhost"),
      // EMAIL_PORT: z.coerce.number().default(1026),
      // EMAIL_USER: z.string().nullish().default(null),
      // EMAIL_PASSWORD: z.string().nullish().default(null),
      // EMAIL_FROM: z.string().default("no-reply@galileyo.com"),
      VAPID_PRIVATE_KEY: z.string().default(""),
      GROWTHBOOK_CLIENT_KEY: z.string().optional(),
      GROWTHBOOK_API_HOST: z.string().optional(),
      ZYTE_API_KEY: z.string().optional(),
      REDIS_URL: z.url().optional(),
      PREVIEW_SERVER_URL: z.url().default("http://localhost:3001"),
      OPENWEATHER_API_KEY: z.string().optional(),
    },
    experimental__runtimeEnv: {
      NODE_ENV: process.env.NODE_ENV,
    },
    skipValidation:
      !!process.env.CI || process.env.npm_lifecycle_event === "lint",
  });
}

export const env = serverEnv();
