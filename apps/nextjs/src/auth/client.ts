import {
  apiKeyClient,
  inferAdditionalFields,
  lastLoginMethodClient,
  magicLinkClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { passwordClientPlugin } from "@galileyo/auth/plugins/password/client";

import type { auth } from "./server";

export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields<typeof auth>(),
    lastLoginMethodClient(),
    magicLinkClient(),
    apiKeyClient(),
    passwordClientPlugin(),
  ],
});

export type User = typeof authClient.$Infer.Session.user;
