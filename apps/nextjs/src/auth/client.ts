import {
  apiKeyClient,
  inferAdditionalFields,
  magicLinkClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import type { auth } from "./server";

export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields<typeof auth>(),
    magicLinkClient(),
    apiKeyClient(),
  ],
});

export type User = typeof authClient.$Infer.Session.user;
