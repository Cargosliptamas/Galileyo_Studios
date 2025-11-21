import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";

import type {
  PrivateFeedListType,
  PrivateFeedType,
} from "@galileyo/validators";

import { protectedProcedure } from "../../trpc";

export const privateFeedsRouter = {
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().optional().default(100),
        cursor: z.number().optional().default(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/private-feed/index`,
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

      const responseJson = (await response.json()) as {
        status: "success" | "error";
        data: PrivateFeedListType;
        error?: {
          message: string;
          code: string | number | null;
        };
      };

      if (responseJson.status !== "success") {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            responseJson.error?.message ?? "Failed to fetch private feeds",
        });
      }

      return responseJson.data;
    }),
  create: protectedProcedure
    .input(z.instanceof(FormData))
    .mutation(async ({ ctx, input }) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/private-feed/create`,
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
        data: PrivateFeedType;
        error?: {
          message: string;
          code: string | number | null;
        };
      };

      if (responseJson.status !== "success") {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            responseJson.error?.message ?? "Failed to create private feed",
        });
      }

      return responseJson.data;
    }),
  update: protectedProcedure
    .input(z.instanceof(FormData))
    .mutation(async ({ ctx, input }) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/private-feed/update`,
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
        data: PrivateFeedType;
        error?: {
          message: string;
          code: string | number | null;
        };
      };

      if (responseJson.status !== "success") {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            responseJson.error?.message ?? "Failed to update private feed",
        });
      }

      return responseJson.data;
    }),
  updateImage: protectedProcedure
    .input(z.instanceof(FormData))
    .mutation(async ({ ctx, input }) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/private-feed/update-image`,
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
        data: PrivateFeedType;
        error?: {
          message: string;
          code: string | number | null;
        };
      };

      if (responseJson.status !== "success") {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            responseJson.error?.message ??
            "Failed to update private feed image",
        });
      }

      return responseJson.data;
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/private-feed/delete`,
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
            responseJson.error?.message ?? "Failed to delete private feed",
        });
      }
    }),
  invite: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        email: z.string().email().optional(),
        phone_number: z.string().optional(),
        name: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/private-feed/invite`,
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
          message: responseJson.error?.message ?? "Failed to send invite",
        });
      }
    }),
  getInvites: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        limit: z.number().optional().default(100),
        cursor: z.number().optional().default(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/private-feed/get-invites`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ctx.session.session.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: input.id,
            page: input.cursor,
            page_size: input.limit,
          }),
        },
      );

      const responseJson = (await response.json()) as {
        status: "success" | "error";
        data: {
          list: {
            id: number;
            email: string | null;
            phone_number: string | null;
            name: string | null;
            created_at: string;
          }[];
          count: number;
          page: number;
          page_size: number;
        };
        error?: {
          message: string;
          code: string | number | null;
        };
      };

      if (responseJson.status !== "success") {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: responseJson.error?.message ?? "Failed to fetch invites",
        });
      }

      return responseJson.data;
    }),
  getFollowers: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        limit: z.number().optional().default(100),
        cursor: z.number().optional().default(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/private-feed/get-followers`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ctx.session.session.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: input.id,
            page: input.cursor,
            page_size: input.limit,
          }),
        },
      );

      const responseJson = (await response.json()) as {
        status: "success" | "error";
        data: {
          list: {
            id: number;
            photo: string | null;
            email: string | null;
            name: string;
            phone_number: string | null;
          }[];
          count: number;
          page: number;
          page_size: number;
        };
        error?: {
          message: string;
          code: string | number | null;
        };
      };

      if (responseJson.status !== "success") {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: responseJson.error?.message ?? "Failed to fetch followers",
        });
      }

      return responseJson.data;
    }),
  deleteFollower: protectedProcedure
    .input(z.object({ id: z.number(), id_follower: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/private-feed/delete-follower`,
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
          message: responseJson.error?.message ?? "Failed to delete follower",
        });
      }
    }),
  deleteInvite: protectedProcedure
    .input(z.object({ id: z.number(), id_invite: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/private-feed/delete-invite`,
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
          message: responseJson.error?.message ?? "Failed to delete invite",
        });
      }
    }),
  reInvite: protectedProcedure
    .input(z.object({ id: z.number(), id_invite: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/private-feed/re-invite`,
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
          message: responseJson.error?.message ?? "Failed to resend invite",
        });
      }
    }),
  history: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        message: z.string().optional(),
        created_at: z.string().optional(),
        limit: z.number().optional().default(100),
        cursor: z.number().optional().default(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/private-feed/history`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ctx.session.session.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: input.id,
            message: input.message,
            created_at: input.created_at,
            page: input.cursor,
            page_size: input.limit,
          }),
        },
      );

      const responseJson = (await response.json()) as {
        status: "success" | "error";
        data: {
          list: {
            id: number;
            message: string;
            created_at: string;
            subscribers: number;
          }[];
          count: number;
          page: number;
          page_size: number;
        };
        error?: {
          message: string;
          code: string | number | null;
        };
      };

      if (responseJson.status !== "success") {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: responseJson.error?.message ?? "Failed to fetch history",
        });
      }

      return responseJson.data;
    }),
} satisfies TRPCRouterRecord;
