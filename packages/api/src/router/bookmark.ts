import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";

import type {
  BookmarkListType,
  BookmarkListTypeWithOptionalPost,
  BookmarkType,
} from "../types/bookmark";
import { mapFeedItem } from "../lib/feed";
import { protectedProcedure } from "../trpc";
import { CreateBookmarkSchema } from "../types/bookmark";

export const bookmarkRouter = {
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().optional().default(10),
        cursor: z.number().optional().default(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      const feed = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/bookmark/index`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ctx.session.session.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            page: input.cursor,
            page_size: input.limit,
          }),
        },
      );

      let result = (await feed.json()) as {
        status: "success" | "error";
        data: BookmarkListTypeWithOptionalPost;
      };

      if (result.status === "success") {
        result = {
          ...result,
          data: {
            ...result.data,
            list: (
              result.data.list.filter(
                (item) => item.post,
              ) as BookmarkListType["list"]
            ).map((item) => ({
              ...item,
              post: mapFeedItem(item.post),
            })),
          },
        };
      }

      if (result.status !== "success") {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }

      return result.data;
    }),
  create: protectedProcedure
    .input(CreateBookmarkSchema)
    .mutation(async ({ input, ctx }) => {
      const request = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/bookmark/create`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ctx.session.session.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            post_id: input.post_id,
          }),
        },
      );

      const result = (await request.json()) as {
        status: "success" | "error";
        data: BookmarkType;
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
  delete: protectedProcedure
    .input(CreateBookmarkSchema)
    .mutation(async ({ input, ctx }) => {
      const request = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/bookmark/delete`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${ctx.session.session.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            post_id: input.post_id,
          }),
        },
      );

      const result = (await request.json()) as {
        status: "success" | "error";
        data: BookmarkType;
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
} satisfies TRPCRouterRecord;
