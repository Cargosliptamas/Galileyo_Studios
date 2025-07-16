import { authRouter } from "./router/auth";
import { feedRouter } from "./router/feed";
import { postRouter } from "./router/post";
import { profileRouter } from "./router/profile";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  post: postRouter,
  profile: profileRouter,
  feed: feedRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
