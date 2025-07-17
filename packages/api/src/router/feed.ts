import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";

// import { desc, eq } from "@galileyo/db";
// import { CreatePostSchema, Post } from "@galileyo/db/schema";

import type { FeedItem, FinancialItemBackend } from "../types/feed";
import {
  protectedProcedure,
  // publicProcedure
} from "../trpc";

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

      const result = (await feed.json()) as {
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
} satisfies TRPCRouterRecord;
