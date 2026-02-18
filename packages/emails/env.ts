import { createEnv } from "@t3-oss/env-core";
import { z } from "zod/v4";

export function emailsEnv() {
  return createEnv({
    server: {
      RESEND_API_KEY: z.string().optional(),

      EMAIL_IS_SECURE: z.coerce.boolean().default(false),
      EMAIL_HOST: z.string().default("localhost"),
      EMAIL_PORT: z.coerce.number().default(1026),
      EMAIL_USER: z.string().nullish().default(null),
      EMAIL_PASSWORD: z.string().nullish().default(null),
      EMAIL_FROM: z.email().default("no-reply@galileyo.com"),
    },
    runtimeEnv: process.env,
    skipValidation:
      !!process.env.CI || process.env.npm_lifecycle_event === "lint",
  });
}
