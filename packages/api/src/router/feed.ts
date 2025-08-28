import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";

// import { desc, eq } from "@galileyo/db";
// import { CreatePostSchema, Post } from "@galileyo/db/schema";

import type {
  FeedItem,
  FinancialItemBackend,
  InfluencerFeedType,
  PrivateFeedType,
} from "../types/feed";
import {
  protectedProcedure,
  // publicProcedure
} from "../trpc";

function mapFeedItem(item: FeedItem): FeedItem {
  const itemMap = { ...item };

  if (Array.isArray(item.reactions)) {
    itemMap.reactions = item.reactions.map((reaction) => ({
      id: String(reaction.id),
      cnt: Number(reaction.cnt),
      selected: reaction.selected,
    }));
  }

  return itemMap as FeedItem;
}

export const feedRouter = {
  getLatestNews: protectedProcedure
    .input(
      z.object({
        limit: z.number().optional().default(10),
        cursor: z.number().optional().default(1),
        type: z.enum(["subscriptions", "discover"]),
      }),
    )
    .query(async ({ ctx, input }) => {
      let url = `${process.env.NEXT_PUBLIC_API_URL}/news/last`;
      if (input.type === "discover") {
        url = `${process.env.NEXT_PUBLIC_API_URL}/news/by-influencers`;
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

      const result = feedJson as {
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
    .input(
      z.object({
        content: z.string(),
        satelliteContent: z.string().optional(),
        media: z.array(z.any()),
        scheduledFor: z.date().optional(),
        isScheduled: z.boolean(),
        profileId: z.string().nullish(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const {
        content,
        satelliteContent,
        media,
        scheduledFor,
        isScheduled,
        profileId,
      } = input;

      const formData = new FormData();
      formData.append("text", content);
      if (satelliteContent) {
        formData.append("satellite_text", satelliteContent);
      }
      formData.append("subscriptions", "[]");
      formData.append(
        "schedule",
        scheduledFor ? scheduledFor.toISOString() : "",
      );
      formData.append("timezone", "UTC");
      formData.append("is_schedule", isScheduled ? "1" : "0");

      media.forEach((file) => {
        formData.append("files[]", file);
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/all-send-form/send`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ctx.session.session.token}`,
            "Content-Type": "application/json",
            // "Content-Type": "multipart/form-data",
          },
          body: JSON.stringify({
            text: content,
            text_short: satelliteContent ?? null,
            subscriptions: profileId ? [+profileId] : [],
            schedule: scheduledFor ? scheduledFor.toISOString() : null,
            timezone: "UTC",
            is_schedule: isScheduled ? "1" : "0",
          }),
        },
      );

      const responseJson = (await response.json()) as {
        status: "success" | "error";
        data: FeedItem;
      };

      console.log(responseJson);

      if (responseJson.status !== "success") {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }

      // return mapFeedItem(responseJson.data);
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

    return responseJson.data.list;
  }),
} satisfies TRPCRouterRecord;
