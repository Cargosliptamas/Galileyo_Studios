import { TRPCError } from "@trpc/server";
import type { TRPCRouterRecord } from "@trpc/server";

// import { z } from "zod/v4";

// import { desc, eq } from "@galileyo/db";
// import { CreatePostSchema, Post } from "@galileyo/db/schema";

import {
  protectedProcedure,
  // publicProcedure
} from "../trpc";

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

    console.log(profile);

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
} satisfies TRPCRouterRecord;
