import { authRouter } from "./router/auth";
import { bookmarkRouter } from "./router/bookmark";
import { commentRouter } from "./router/comment";
import { feedRouter } from "./router/feed";
import { postRouter } from "./router/post";
import { profileRouter } from "./router/profile";
import { searchRouter } from "./router/search";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  bookmark: bookmarkRouter,
  comment: commentRouter,
  feed: feedRouter,
  post: postRouter,
  profile: profileRouter,
  search: searchRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
