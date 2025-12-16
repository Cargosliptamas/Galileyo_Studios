import { createEnv } from "@t3-oss/env-nextjs";

import { clientEnv } from "./client";
import { serverEnv } from "./server";

export const env = createEnv({
  extends: [serverEnv(), clientEnv()],
  experimental__runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
  },
  skipValidation:
    !!process.env.CI || process.env.npm_lifecycle_event === "lint",
});
