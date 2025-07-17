import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";

// import { z } from "zod/v4";

// import { desc, eq } from "@galileyo/db";
// import { CreatePostSchema, Post } from "@galileyo/db/schema";

import { protectedProcedure, publicProcedure } from "../trpc";
import { ProfileGeneralSchema, SignupSchema } from "../types/profile";

export const profileRouter = {
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const profile = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/customer/get-profile`,
      {
        headers: {
          Authorization: `Bearer ${ctx.session.session.token}`,
        },
      },
    );

    const result = (await profile.json()) as {
      status: "success" | "error";
      data: {
        id: string;
        email: string;
        full_name: string;
        first_name: string;
        last_name: string;
        country: string;
        state: string;
        full_state: string;
        full_country: string;
        zip: string;
        about: string;
        photo: string;
        header: unknown;
        created_at: string;
        following: number;
        phone: string | null;
        friend_status: string;
        is_influencer: boolean;
        phones: {
          phone: string;
          type: string;
        }[];
        referrer_link: string;
        points: number;
      };
    };

    if (result.status !== "success") {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }

    return result.data;
  }),
  signup: publicProcedure.input(SignupSchema).mutation(async ({ input }) => {
    const request = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/default/signup`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: input.first_name,
          last_name: input.last_name,
          email: input.email,
          password: input.password,
          country: input.country,
          state: input.state,
          iam18: input.accept_terms,
          iagree: input.after_eighteen,
          "from-new-site": true,
        }),
      },
    );

    const result = (await request.json()) as {
      status: "success" | "error";
      data: {
        id: string;
        email: string;
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
  updateProfile: protectedProcedure
    .input(ProfileGeneralSchema)
    .mutation(async ({ ctx, input }) => {
      const request = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/customer/update-profile`,
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
          id: string;
          email: string;
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
} satisfies TRPCRouterRecord;
