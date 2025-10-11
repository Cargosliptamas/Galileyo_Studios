import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";

import type {
  FeedItem,
  FinancialItemBackend,
  InfluencerFeedType,
  PrivateFeedType,
} from "../types/feed";
import { mapFeedItem } from "../lib/feed";
import { protectedProcedure, publicProcedure } from "../trpc";
import { GetBySubscriptionParams, GetLatestNewsParams } from "../types/feed";

export const feedRouter = {
  getLatestNews: protectedProcedure
    .input(GetLatestNewsParams)
    .query(async ({ ctx, input }) => {
      let url = `${process.env.NEXT_PUBLIC_API_URL}/news/last`;
      if (input.type === "discover" && input.onlyInfluencers) {
        url = `${process.env.NEXT_PUBLIC_API_URL}/news/by-influencers`;
      } else if (input.type === "discover" && !input.onlyInfluencers) {
        url = `${process.env.NEXT_PUBLIC_API_URL}/news/by-discover`;
      }

      const feed = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ctx.session.session.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          page: input.cursor,
          page_size: input.limit,
        }),
      });

      let feedJson = (await feed.json()) as {
        status: "success" | "error";
        data: {
          more_than_id: number | null;
          less_than_id: number | null;
          is_test_count: number | null;
          list: FeedItem[];
          count: number;
          page: number;
          page_size: number;
        };
      };

      if (feedJson.status === "success") {
        feedJson = {
          ...feedJson,
          data: {
            ...feedJson.data,
            list: feedJson.data.list.map(mapFeedItem),
          },
        };
      }

      const result = feedJson;

      if (result.status !== "success") {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }

      return {
        ...result.data,
        list: result.data.list.map((item) => {
          if (item.type === "financial") {
            const financialItem = item as FinancialItemBackend;

            return {
              ...item,
              percent: Number(financialItem.percent.replace("%", "")),
              price: Number(financialItem.price),
            };
          }

          return item;
        }),
      };
    }),
  setReaction: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        reaction: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, reaction } = input;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/news/set-reaction`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ctx.session.session.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id_news: id,
            id_reaction: reaction,
          }),
        },
      );

      const responseJson = (await response.json()) as {
        status: "success" | "error";
        data: FeedItem;
      };

      if (responseJson.status !== "success") {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }

      return mapFeedItem(responseJson.data);
    }),
  removeReaction: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        reaction: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, reaction } = input;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/news/remove-reaction`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ctx.session.session.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id_news: id,
            id_reaction: reaction,
          }),
        },
      );

      const responseJson = (await response.json()) as {
        status: "success" | "error";
        data: FeedItem;
      };

      if (responseJson.status !== "success") {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }

      return mapFeedItem(responseJson.data);
    }),
  createPost: protectedProcedure
    .input(z.instanceof(FormData))
    .mutation(async ({ ctx, input }) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/all-send-form/send`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ctx.session.session.token}`,
          },
          body: input,
        },
      );

      const responseJson = (await response.json()) as {
        status: "success" | "error";
        data: FeedItem | null;
      };

      console.log(responseJson);

      if (responseJson.status !== "success") {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  getPrivateFeeds: protectedProcedure.query(async ({ ctx }) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/private-feed/index`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${ctx.session.session.token}`,
        },
      },
    );

    const responseJson = (await response.json()) as {
      status: "success" | "error";
      data: {
        list: PrivateFeedType[];
        count: number;
        page: number;
        page_size: number;
      };
    };

    if (responseJson.status !== "success") {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }

    return responseJson.data.list;
  }),
  getInfluencerFeeds: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session.user.isInfluencer) {
      return {
        list: [] as InfluencerFeedType[],
        count: 0,
        page: 1,
        page_size: 10,
      };
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/influencer/index`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${ctx.session.session.token}`,
        },
      },
    );

    const responseJson = (await response.json()) as {
      status: "success" | "error";
      data: {
        list: InfluencerFeedType[];
        count: number;
        page: number;
        page_size: number;
      };
    };

    if (responseJson.status !== "success") {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }

    return responseJson.data;
  }),
  getNewsBySubscriptionOrFollowerList: publicProcedure
    .input(GetBySubscriptionParams)
    .query(async ({ ctx, input }) => {
      const config: {
        url: string;
        body: Record<string, number | string>;
        headers: Record<string, string>;
      } = {
        url: ``,
        body: {},
        headers: {
          "Content-Type": "application/json",
        },
      };

      if (ctx.session?.session.token) {
        config.headers.Authorization = `Bearer ${ctx.session.session.token}`;
      }

      switch (input.type) {
        case "subscription":
          config.url = `${process.env.NEXT_PUBLIC_API_URL}/default/news-by-subscription`;
          config.body = {
            id_subscription: input.id,
          };
          break;
        case "followerList":
          config.url = `${process.env.NEXT_PUBLIC_API_URL}/news/by-follower-list`;
          config.body = {
            id_follower_list: input.id,
          };
          break;
      }

      const response = await fetch(config.url, {
        method: "POST",
        headers: config.headers,
        body: JSON.stringify({
          ...config.body,
          page: input.cursor,
          page_size: input.limit,
        }),
      });

      let responseJson = (await response.json()) as {
        status: "success" | "error";
        data: {
          id_subscription: number | undefined;
          id_follower_list: number | undefined;
          is_public: boolean;
          is_subscribe: boolean;
          short_page_format: boolean;
          page_description: string | null;
          more_than_id: number | null;
          less_than_id: number | null;
          is_test_count: number | null;
          list?: FeedItem[];
          count: number;
          page: number;
          page_size: number;
        };
      };

      if (responseJson.status !== "success") {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }

      responseJson = {
        ...responseJson,
        data: {
          ...responseJson.data,
          list: responseJson.data.list?.map(mapFeedItem) ?? [],
        },
      };

      return responseJson.data;
    }),
  setSubscription: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        subscribed: z.boolean(),
        zip: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/feed/set`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${ctx.session.session.token}`,
          },
          body: JSON.stringify({
            id: input.id,
            checked: input.subscribed,
            zip: input.zip,
          }),
        },
      );

      const responseJson = (await response.json()) as {
        status: "success" | "error";
        data: {
          id: number;
          checked: boolean;
        };
      };

      if (responseJson.status !== "success") {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }

      return responseJson.data;
    }),
  reportPost: protectedProcedure
    .input(
      z.object({
        postId: z.string(),
        reason: z.string(),
        additionalText: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { postId, reason, additionalText } = input;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/news/report`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ctx.session.session.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id_news: postId,
            reason: reason,
            additional_text: additionalText ?? null,
          }),
        },
      );

      const responseJson = (await response.json()) as {
        status: "success" | "error";
        // data?: any;
      };

      if (responseJson.status !== "success") {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }

      return responseJson;
    }),
  muteSubscription: protectedProcedure
    .input(
      z.object({
        subscriptionId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { subscriptionId } = input;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/news/mute`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ctx.session.session.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id_subscription: subscriptionId,
          }),
        },
      );

      const responseJson = (await response.json()) as {
        status: "success" | "error";
      };

      if (responseJson.status !== "success") {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }

      return responseJson;
    }),
  unmuteSubscription: protectedProcedure
    .input(
      z.object({
        subscriptionId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { subscriptionId } = input;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/news/unmute`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ctx.session.session.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id_subscription: subscriptionId,
          }),
        },
      );

      const responseJson = (await response.json()) as {
        status: "success" | "error";
      };

      if (responseJson.status !== "success") {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }

      return responseJson;
    }),
} satisfies TRPCRouterRecord;
