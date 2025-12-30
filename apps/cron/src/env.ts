import { createEnv } from "@t3-oss/env-core";
import { vercel } from "@t3-oss/env-core/presets-zod";
import { z } from "zod/v4";

export const env = createEnv({
  extends: [vercel()],
  shared: {
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
  },
  server: {
    NEXT_PUBLIC_API_URL: z.url(),
    ZYTE_API_KEY: z.string(),
    INFLUENCER_IMPERSONATION_API_KEY: z.string(),
    DATABASE_URL: z.url(),
    REDIS_HOST: z.string().default("localhost"),
    REDIS_PORT: z.coerce.number().default(6379),
    REDIS_USERNAME: z.string().optional(),
    REDIS_PASSWORD: z.string().optional(),
  },
  runtimeEnv: process.env,
  skipValidation:
    !!process.env.CI || process.env.npm_lifecycle_event === "lint",
});
