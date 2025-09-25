import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";

// import { z } from "zod/v4";

// import { desc, eq } from "@galileyo/db";
// import { CreatePostSchema, Post } from "@galileyo/db/schema";

import { protectedProcedure, publicProcedure } from "../trpc";
import { ProfileGeneralSchema, SignupSchema, ChangePasswordSchema, PrivacySchema } from "../types/profile";

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
        general_visibility: number;
        phone_visibility: number;
        address_visibility: number;
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
  removeAvatar: protectedProcedure.mutation(async ({ ctx }) => {
    const request = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/customer/remove-avatar`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ctx.session.session.token}`,
  
          },
        },
      );

      const result = (await request.json()) as {
        status: "success" | "error";
        data: {
          id: string;
          photo: string;
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
  removeHeader: protectedProcedure.mutation(async ({ ctx }) => {
    const request = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/customer/remove-header`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ctx.session.session.token}`,
        },
      },
    );

      const result = (await request.json()) as {
        status: "success" | "error";
        data: {
          id: string;
          header: string;
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
  changePassword: protectedProcedure.input(ChangePasswordSchema).mutation(async ({ ctx, input }) => {
    const request = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/customer/change-password`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ctx.session.session.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          old_password: input.currentPassword,
          new_password: input.newPassword,
        }),
      },
    );

    const result = (await request.json()) as {
      status: "success" | "error";
      data: {
        id: string;
        password: string;
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
  updatePrivacy: protectedProcedure.input(PrivacySchema).mutation(async ({ ctx, input }) => {
    const request = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/customer/update-privacy`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ctx.session.session.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          generalVisibility: input.memberDirectory === "Public" ? 0 : 1,
          phoneVisibility: input.satellitePhoneNumber === "Public" ? 0 : 1,
          addressVisibility: input.location === "Public" ? 0 : 1,
        }),
      },
    );

    const result = (await request.json()) as {
      status: "success" | "error";
      data: {
        id: string;
        general_visibility: string;
        phone_visibility: string;
        address_visibility: string;
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
