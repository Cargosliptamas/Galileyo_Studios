import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";

import type { SearchResultType } from "@galileyo/validators/search";

import { protectedProcedure } from "../trpc";

export const searchRouter = {
  search: protectedProcedure
    .input(
      z.object({
        query: z.string().min(3),
        limit: z.number().optional().default(10),
        cursor: z.number().optional().default(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const feed = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/search/index`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ctx.session.session.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phrase: input.query,
            page: input.cursor,
            page_size: input.limit,
          }),
        },
      );

      const result = (await feed.json()) as {
        status: "success" | "error";
        data: SearchResultType;
      };

      if (result.status !== "success") {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }

      return result.data;
    }),
} satisfies TRPCRouterRecord;
