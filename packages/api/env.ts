import { createEnv } from "@t3-oss/env-nextjs";

// import { z } from "zod/v4";

export function apiEnv() {
  return createEnv({
    server: {},
    experimental__runtimeEnv: {},
    skipValidation:
      !!process.env.CI || process.env.npm_lifecycle_event === "lint",
  });
}
