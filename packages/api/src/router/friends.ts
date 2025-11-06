import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";

import { protectedProcedure } from "../trpc";

export const friendsRouter = {
  getFriendRequestToYou: protectedProcedure.query(async ({ ctx }) => {
    const friend = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/customer/get-friend-request-to-you`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ctx.session.session.token}`,
        },
      },
    );
    const result = (await friend.json()) as {
      status: "success" | "error";
      data: {
        list: {
          id: number;
          full_name: string;
          photo?: string;
        }[];
      };
    };

    if (result.status !== "success") {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }

    return result.data;
  }),
  agreeFriendRequest: protectedProcedure
    .input(
      z.object({
        id_user: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const request = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/customer/agree-friend-request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${ctx.session.session.token}`,
          },
          body: JSON.stringify(input),
        },
      );

      const result = (await request.json()) as {
        status: "success" | "error";
        data: {
          id_user: string;
        };
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
  denyFriendRequest: protectedProcedure
    .input(
      z.object({
        id_user: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const request = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/customer/deny-friend-request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${ctx.session.session.token}`,
          },
          body: JSON.stringify(input),
        },
      );

      const result = (await request.json()) as {
        status: "success" | "error";
        data: {
          id_user: string;
        };
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
  friendList: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(10),
        cursor: z.number().default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      const request = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/customer/friends`,
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

      const result = (await request.json()) as {
        status: "success" | "error";
        data: {
          search: string | null;
          list: {
            id: number;
            full_name: string;
            first_name: string;
            last_name: string;
            photo: string;
            country: string;
            state: string;
            zip: string;
            is_phone_visible: boolean;
            is_address_visible: boolean;
            is_deleted: boolean;
          }[];
          count: string;
          page: number;
          page_size: number;
        };
      };

      if (result.status !== "success") {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }

      return result.data;
    }),
  addFriend: protectedProcedure
    .input(
      z.object({
        userId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const request = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/customer/add-friend`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ctx.session.session.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id_user: input.userId,
          }),
        },
      );

      const result = (await request.json()) as {
        status: "success" | "error";
        data: {
          id_user: string;
        };
      };

      if (result.status !== "success") {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  cancelFriendRequest: protectedProcedure
    .input(
      z.object({
        userId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const request = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/customer/cancel-friend-request`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ctx.session.session.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id_user: input.userId,
          }),
        },
      );

      const result = (await request.json()) as {
        status: "success" | "error";
        data: {
          id_user: string;
        };
      };

      if (result.status !== "success") {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  deleteFriend: protectedProcedure
    .input(
      z.object({
        userId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const request = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/customer/delete-friend`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ctx.session.session.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id_user: input.userId,
          }),
        },
      );

      const result = (await request.json()) as {
        status: "success" | "error";
        data: {
          id_user: string;
        };
      };

      if (result.status !== "success") {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
} satisfies TRPCRouterRecord;
