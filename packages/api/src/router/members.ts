import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";

import { protectedProcedure, publicProcedure } from "../trpc";

export const membersRouter = {
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().optional().default(100),
        cursor: z.number().optional().default(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      const request = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/member/list`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${ctx.session.session.token}`,
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
          admin: {
            id: number;
            first_name: string;
            last_name: string;
            email: string;
            full_name: string;
          };
          members: {
            id: number;
            first_name: string;
            last_name: string;
            email: string;
            full_name: string;
            is_member_admin: boolean;
          }[];
          templates: {
            id: number;
            first_name: string;
            last_name: string;
            email: string;
            full_name: string;
            expired_at: string;
            is_expired: boolean;
          }[];
        };
        error?: {
          message: string;
          code: string | number | null;
        };
      };

      if (result.status !== "success") {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.error?.message ?? "Failed to fetch members",
        });
      }

      return result.data;
    }),

  add: protectedProcedure
    .input(
      z.object({
        firstName: z.string().min(1, "First name is required"),
        lastName: z.string().min(1, "Last name is required"),
        email: z.string().email("Invalid email address"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const request = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/member/add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${ctx.session.session.token}`,
          },
          body: JSON.stringify({
            firstName: input.firstName,
            lastName: input.lastName,
            email: input.email,
          }),
        },
      );

      const result = (await request.json()) as {
        status: "success" | "error";
        data?: {
          message: string;
          template: {
            id: number;
            first_name: string;
            last_name: string;
            email: string;
            expired_at: string;
          };
        };
        error?: {
          message: string;
          code: string | number | null;
        };
      };

      if (result.status !== "success") {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.error?.message ?? "Failed to add member",
        });
      }

      return result.data;
    }),

  delete: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        type: z.enum(["template", "member"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const request = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/member/delete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${ctx.session.session.token}`,
          },
          body: JSON.stringify({
            id: input.id,
            type: input.type,
          }),
        },
      );

      const result = (await request.json()) as {
        status: "success" | "error";
        data?: {
          message: string;
        };
        error?: {
          message: string;
          code: string | number | null;
        };
      };

      if (result.status !== "success") {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.error?.message ?? "Failed to delete member",
        });
      }

      return result.data;
    }),

  sendInvitation: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const request = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/member/send-invitation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${ctx.session.session.token}`,
          },
          body: JSON.stringify({
            id: input.id,
          }),
        },
      );

      const result = (await request.json()) as {
        status: "success" | "error";
        data?: {
          message: string;
          template: {
            id: number;
            first_name: string;
            last_name: string;
            email: string;
            expired_at: string;
          };
        };
        error?: {
          message: string;
          code: string | number | null;
        };
      };

      if (result.status !== "success") {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.error?.message ?? "Failed to send invitation",
        });
      }

      return result.data;
    }),

  getTemplateByKey: publicProcedure
    .input(
      z.object({
        mk: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const request = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/member/get-template`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mk: input.mk,
          }),
        },
      );

      const result = (await request.json()) as {
        status: "success" | "error";
        data?: {
          template: {
            id: number;
            first_name: string;
            last_name: string;
            email: string;
            full_name: string;
            expired_at: string;
            is_expired: boolean;
          };
          admin: {
            first_name: string;
            last_name: string;
            full_name: string;
          };
          can_restore: boolean;
        };
        error?: {
          message: string;
          code: string | number | null;
        };
      };

      if (result.status !== "success") {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.error?.message ?? "Failed to get template",
        });
      }

      return result.data;
    }),

  subaccountSignup: publicProcedure
    .input(
      z.object({
        mk: z.string(),
        first_name: z.string().min(1),
        last_name: z.string().min(1),
        email: z.email(),
        password: z.string().min(8),
        country: z.string(),
        state: z.string().optional(),
        zip: z.string().optional(),
        city: z.string().optional(),
        timezone: z.string().optional(),
        iagree: z.boolean(),
        iam18: z.boolean(),
      }),
    )
    .mutation(async ({ input }) => {
      const request = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/member/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mk: input.mk,
            first_name: input.first_name,
            last_name: input.last_name,
            email: input.email,
            password: input.password,
            country: input.country,
            state: input.state,
            iagree: input.iagree,
            iam18: input.iam18,
          }),
        },
      );

      const result = (await request.json()) as {
        status: "success" | "error";
        data?: {
          message: string;
          user: {
            id: number;
            email: string;
            first_name: string;
            last_name: string;
          };
          access_token: string;
        };
        error?: {
          message: string;
          code: string | number | null;
        };
      };

      if (result.status !== "success") {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.error?.message ?? "Failed to create account",
        });
      }

      return result.data;
    }),
} satisfies TRPCRouterRecord;
