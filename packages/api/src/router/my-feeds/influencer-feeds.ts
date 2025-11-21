import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";

import type {
  InfluencerFeedListType,
  InfluencerFeedType,
} from "@galileyo/validators";

import { protectedProcedure } from "../../trpc";

export const influencerFeedsRouter = {
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().optional().default(100),
        cursor: z.number().optional().default(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/influencer/index`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ctx.session.session.token}`,
          },
          body: JSON.stringify({
            page: input.cursor,
            page_size: input.limit,
          }),
        },
      );

      const responseJson = (await response.json()) as {
        status: "success" | "error";
        data: InfluencerFeedListType;
        error?: {
          message: string;
          code: string | number | null;
        };
      };

      if (responseJson.status !== "success") {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            responseJson.error?.message ?? "Failed to fetch influencer feeds",
        });
      }

      return responseJson.data;
    }),
  create: protectedProcedure
    .input(z.instanceof(FormData))
    .mutation(async ({ ctx, input }) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/influencer/create`,
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
        data: {
          influencer_feed: InfluencerFeedType;
        };
        error?: {
          message: string;
          code: string | number | null;
        };
      };

      if (responseJson.status !== "success") {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            responseJson.error?.message ?? "Failed to create influencer feed",
        });
      }

      return responseJson.data;
    }),
  update: protectedProcedure
    .input(z.instanceof(FormData))
    .mutation(async ({ ctx, input }) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/influencer/update`,
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
        data: {
          influencer_feed: InfluencerFeedType;
        };
        error?: {
          message: string;
          code: string | number | null;
        };
      };

      if (responseJson.status !== "success") {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            responseJson.error?.message ?? "Failed to update influencer feed",
        });
      }

      return responseJson.data;
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      console.log(input);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/influencer/delete`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ctx.session.session.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(input),
        },
      );

      const responseJson = (await response.json()) as {
        status: "success" | "error";
        error?: {
          message: string;
          code: string | number | null;
        };
      };

      if (responseJson.status !== "success") {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            responseJson.error?.message ?? "Failed to delete influencer feed",
        });
      }
    }),
  editPromocode: protectedProcedure
    .input(z.object({ text: z.string().min(1).max(25) }))
    .mutation(async ({ ctx, input }) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/influencer/edit-promocode`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ctx.session.session.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(input),
        },
      );

      const responseJson = (await response.json()) as {
        status: "success" | "error";
        data: {
          code: string;
        };
        error?: {
          message: string;
          code: string | number | null;
        };
      };

      if (responseJson.status !== "success") {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: responseJson.error?.message ?? "Failed to edit promocode",
        });
      }

      return responseJson.data;
    }),
} satisfies TRPCRouterRecord;
