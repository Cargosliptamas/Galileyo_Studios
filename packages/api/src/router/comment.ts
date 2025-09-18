import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";

// import { desc, eq } from "@galileyo/db";
// import { CreatePostSchema, Post } from "@galileyo/db/schema";

import type { Comment } from "../types/feed";
import {
  protectedProcedure,
  // publicProcedure
} from "../trpc";

export const commentRouter = {
  create: protectedProcedure
    .input(
      z.object({
        comment: z.string().min(2).max(300),
        newsId: z.number(),
        parentId: z.number().optional().nullish(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const request = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/comment/create`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ctx.session.session.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: input.comment,
            id_news: input.newsId,
            id_parent: input.parentId,
          }),
        },
      );

      const result = (await request.json()) as {
        status: "success" | "error";
        data: Comment;
        error: {
          message: string;
          code: string | number | null;
        };
      };

      if (result.status !== "success") {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.error.message,
        });
      }

      return result.data;
    }),

  getCommentsForNews: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        limit: z.number().optional().default(10),
        cursor: z.number().optional().default(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      const feed = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/comment/get`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ctx.session.session.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id_news: input.id,
            page: input.cursor,
            page_size: input.limit,
          }),
        },
      );

      const result = (await feed.json()) as {
        status: "success" | "error";
        data: {
          id_news: number | null;
          id_comment: number | null;
          list: Comment[];
          count: number;
          page: number;
          page_size: number;
        };
      };

      if (result.status !== "success") {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }

      console.log(result.data.list);

      return result.data;
    }),
  getRepliesForComment: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        limit: z.number().optional().default(10),
        cursor: z.number().optional().default(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      const feed = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/comment/get-replies`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ctx.session.session.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id_comment: input.id,
            page: input.cursor,
            page_size: input.limit,
          }),
        },
      );

      const result = (await feed.json()) as {
        status: "success" | "error";
        data: {
          id_comment: number | null;
          list: Comment[];
          count: number;
          page: number;
          page_size: number;
        };
      };

      if (result.status !== "success") {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }

      return result.data;
    }),
} satisfies TRPCRouterRecord;
