import type { BetterAuthClientPlugin } from "better-auth";

import type { passwordPlugin } from "./index";

export const passwordClientPlugin = () => {
  return {
    id: "galileyoPasswordPlugin",
    $InferServerPlugin: {} as ReturnType<typeof passwordPlugin>,
  } satisfies BetterAuthClientPlugin;
};
