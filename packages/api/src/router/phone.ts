import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";

import { PhoneIdSchema, PhoneSetSchema } from "@galileyo/validators/phone";

import { protectedProcedure } from "../trpc";

export interface PhoneData {
  id: number;
  type: string;
  is_valid: boolean;
  is_send: boolean;
  is_emergency_only: boolean;
  is_primary: boolean;
  number: string;
}

interface ApiResponse<T> {
  status: "success" | "error";
  data: T;
  error?: {
    message: string;
    code: string | number | null;
  };
}

const PhoneCreateSchema = z.object({
  number: z.string(),
  is_emergency_only: z.boolean(),
  is_send: z.boolean(),
  type: z.number(),
});

export const phoneRouter = {
  list: protectedProcedure.query(async ({ ctx }) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/phone/list`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ctx.session.session.token}`,
          "Content-Type": "application/json",
        },
        // body: JSON.stringify({
        //   page: input.page,
        //   page_size: input.page_size,
        // }),
      },
    );

    const result = (await response.json()) as ApiResponse<{
      list: PhoneData[];
      count: number;
      page: number;
      page_size: number;
    }>;

    if (result.status !== "success") {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: result.error?.message ?? "Failed to fetch phones",
      });
    }

    return result.data;
  }),

  verify: protectedProcedure
    .input(PhoneIdSchema)
    .mutation(async ({ ctx, input }) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/phone/verify`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ctx.session.session.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: input.id }),
        },
      );

      const result = (await response.json()) as ApiResponse<{
        message: string;
      }>;

      if (result.status !== "success") {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.error?.message ?? "Failed to send verification",
        });
      }

      return result.data;
    }),

  create: protectedProcedure
    .input(PhoneCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/phone/create`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ctx.session.session.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            number: input.number,
            type: +input.type,
            is_emergency_only: input.is_emergency_only ? 1 : 0,
            is_send: input.is_send ? 1 : 0,
          }),
        },
      );

      const result = (await response.json()) as ApiResponse<PhoneData>;

      if (result.status !== "success") {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.error?.message ?? "Failed to create phone",
        });
      }

      return result.data;
    }),

  set: protectedProcedure
    .input(PhoneSetSchema)
    .mutation(async ({ ctx, input }) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/phone/set`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ctx.session.session.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: input.id,
            is_send: input.is_send ? 1 : 0,
            is_emergency_only: input.is_emergency_only ? 1 : 0,
          }),
        },
      );

      const result = (await response.json()) as ApiResponse<PhoneData>;

      if (result.status !== "success") {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.error?.message ?? "Failed to update phone settings",
        });
      }

      return result.data;
    }),

  setPrimary: protectedProcedure
    .input(PhoneIdSchema)
    .mutation(async ({ ctx, input }) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/phone/set-primary`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ctx.session.session.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: input.id }),
        },
      );

      const result = (await response.json()) as ApiResponse<PhoneData>;

      if (result.status !== "success") {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.error?.message ?? "Failed to set primary phone",
        });
      }

      return result.data;
    }),

  delete: protectedProcedure
    .input(PhoneIdSchema)
    .mutation(async ({ ctx, input }) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/phone/delete`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ctx.session.session.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: input.id }),
        },
      );

      const result = (await response.json()) as ApiResponse<{
        success: boolean;
      }>;

      if (result.status !== "success") {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.error?.message ?? "Failed to delete phone",
        });
      }

      return result.data;
    }),
} satisfies TRPCRouterRecord;
