import type { TRPCRouterRecord } from "@trpc/server";

import { alertsRouter } from "./router/alerts";
import { authRouter } from "./router/auth";
import { bookmarkRouter } from "./router/bookmark";
import { chatRouter } from "./router/chat";
import { commentRouter } from "./router/comment";
import { feedRouter } from "./router/feed";
import { friendsRouter } from "./router/friends";
import { mapRouter } from "./router/map";
import { membersRouter } from "./router/members";
import { influencerFeedsRouter } from "./router/my-feeds/influencer-feeds";
import { privateFeedsRouter } from "./router/my-feeds/private-feeds";
import { paymentRouter } from "./router/payment";
import { phoneRouter } from "./router/phone";
import { profileRouter } from "./router/profile";
import { scraperRouter } from "./router/scraper";
import { searchRouter } from "./router/search";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  alerts: alertsRouter,
  auth: authRouter,
  bookmark: bookmarkRouter,
  chat: chatRouter,
  comment: commentRouter,
  feed: feedRouter,
  friends: friendsRouter,
  map: mapRouter,
  members: membersRouter,
  payment: paymentRouter,
  phone: phoneRouter,
  profile: profileRouter,
  scraper: scraperRouter,
  search: searchRouter,
  myFeeds: {
    private: privateFeedsRouter,
    influencer: influencerFeedsRouter,
  } satisfies TRPCRouterRecord,
});

// export type definition of API
export type AppRouter = typeof appRouter;
