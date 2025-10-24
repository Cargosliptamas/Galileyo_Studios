import { alertsRouter } from "./router/alerts";
import { authRouter } from "./router/auth";
import { bookmarkRouter } from "./router/bookmark";
import { commentRouter } from "./router/comment";
import { feedRouter } from "./router/feed";
import { friendsRouter } from "./router/friends";
import { paymentRouter } from "./router/payment";
import { postRouter } from "./router/post";
import { profileRouter } from "./router/profile";
import { scraperRouter } from "./router/scraper";
import { searchRouter } from "./router/search";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  alerts: alertsRouter,
  auth: authRouter,
  bookmark: bookmarkRouter,
  comment: commentRouter,
  feed: feedRouter,
  friends: friendsRouter,
  post: postRouter,
  payment: paymentRouter,
  profile: profileRouter,
  scraper: scraperRouter,
  search: searchRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
