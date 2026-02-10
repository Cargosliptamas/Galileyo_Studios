import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";

import type {
  PaymentHistoryListType,
  PaymentHistoryTypes,
  PlanListType,
  PlanType,
} from "@galileyo/validators/payment";
import { eq } from "@galileyo/db";
// import { z } from "zod/v4";

import { db } from "@galileyo/db/client";
import { register as registerSchema } from "@galileyo/db/schema";
import { PaymentDetailsSchema } from "@galileyo/validators/payment";

import { protectedProcedure } from "../trpc";

function getPaymentHistoryType(type: number): PaymentHistoryTypes {
  switch (type) {
    case 1:
      return "authorize";
    case 2:
      return "bitpay";
    case 3:
      return "apply_credit";
    case 4:
      return "pay_from_credit";
    case 5:
      return "discount";
    case 6:
      return "apple";
  }

  return "unknown";
}

async function fetchAvailablePlans(
  token: string,
  cursor: number,
  limit: number,
) {
  const request = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/product/list`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        full_info: true,
        page: cursor,
        page_size: limit,
      }),
    },
  );

  const result = (await request.json()) as {
    status: "success" | "error";
    data: {
      end_at: string | null;
      is_cancelled: boolean;
      can_reactivate: boolean;
      count: number;
      page: number;
      page_size: number;
      list: {
        id: number;
        current: boolean;
        is_scheduled: boolean;
        name: string;
        description: string | null;
        price: number;
        settings: Record<string, string | number>;
        is_new_plan: boolean;
      }[];
    };
  };

  if (result.status !== "success") {
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
  }

  return result.data;
}

export const paymentRouter = {
  getPayment: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().optional().default(100),
          cursor: z.number().optional().default(1),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const payment = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/credit-card/list`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${ctx.session.session.token}`,
          },
          body: JSON.stringify({
            page: input?.cursor,
            page_size: input?.limit,
          }),
        },
      );

      const result = (await payment.json()) as {
        status: "success" | "error";
        data: {
          count: number;
          page: number;
          page_size: number;
          list: {
            id: number;
            type: string | null;
            first_name: string;
            last_name: string;
            num: string;
            expiration_year: string;
            expiration_month: string;
            zip: string;
            phone: string;
            is_agree_to_receive: boolean;
            is_preferred: boolean;
            created_at: string;
          }[];
        };
      };

      if (result.status !== "success") {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }

      return result.data;
    }),

  createPayment: protectedProcedure
    .input(PaymentDetailsSchema)
    .mutation(async ({ input, ctx }) => {
      const request = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/credit-card/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${ctx.session.session.token}`,
          },
          body: JSON.stringify({
            first_name: input.first_name,
            last_name: input.last_name,
            phone: input.phone,
            card_number: input.card_number,
            cvv: input.security_code,
            expiration_year: +input.expiration_year,
            expiration_month: +input.expiration_month,
            zip: input.zip,
            //full_num : input.card_number,
            num: input.card_number,
            is_agree_to_receive: true,
            //id_user: 21623, //input.id,
            "from-new-site": true,
          }),
        },
      );

      const result = (await request.json()) as {
        status: "success" | "error";
        data: {
          card_number: string | number;
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

  updatePayment: protectedProcedure
    .input(PaymentDetailsSchema)
    .mutation(async ({ ctx, input }) => {
      const request = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/credit-card/update`,
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
          first_name: string;
          last_name: string;
          phone: string;
          card_number: string;
          cvv: string;
          expiration_year: string;
          expiration_month: string;
          zip: string;
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

  setPreferred: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const request = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/credit-card/set-preferred`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${ctx.session.session.token}`,
          },
          body: JSON.stringify({ id: input.id }),
        },
      );

      const result = (await request.json()) as {
        status: "success" | "error";
        error?: { message?: string };
      };

      if (result.status !== "success") {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.error?.message ?? "Failed to set preferred card",
        });
      }

      return { success: true } as const;
    }),
  deletePayment: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const request = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/credit-card/delete`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${ctx.session.session.token}`,
          },
          body: JSON.stringify({ id: input.id }),
        },
      );

      const result = (await request.json()) as {
        status: "success" | "error";
        error?: { message?: string };
      };

      if (result.status !== "success") {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.error?.message ?? "Failed to delete card",
        });
      }

      return { success: true } as const;
    }),
  getPaymentHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().optional().default(20),
        cursor: z.number().optional().default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      const request = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payment-history/list`,
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
          count: number;
          page: number;
          page_size: number;
          list: {
            id: number;
            created_at: string;
            updated_at: string | null;
            type: number;
            total: string;
            title: string;
            is_void: boolean;
            is_test: boolean;
            is_success: boolean;
            card_number: string | null;
            invoice_id: number;
          }[];
        };
      };

      if (result.status !== "success") {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }

      const response: PaymentHistoryListType = {
        ...result.data,
        list: result.data.list.map((item) => ({
          ...item,
          total: +item.total,
          type: getPaymentHistoryType(item.type),
        })),
      };

      return response;
    }),
  getAvailablePlans: protectedProcedure
    .input(
      z.object({
        limit: z.number().optional().default(10),
        cursor: z.number().optional().default(1),
      }),
    )
    .query(async ({ ctx, input }): Promise<PlanListType> => {
      const plans = await fetchAvailablePlans(
        ctx.session.session.token,
        input.cursor,
        input.limit,
      );

      return plans;
    }),
  getAvailableAlerts: protectedProcedure.query(async ({ ctx }) => {
    const request = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/product/alerts`,
      {
        headers: {
          Authorization: `Bearer ${ctx.session.session.token}`,
        },
      },
    );

    const result = (await request.json()) as {
      status: "success" | "error";
      data: {
        list: {
          id: number;
          name: string;
          description: string;
          price: string;
          alerts: string;
        }[];
      };
    };

    if (result.status !== "success") {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }

    return {
      ...result.data,
      list: result.data.list.map((item) => ({
        ...item,
        price: +item.price,
        alerts: +item.alerts,
      })),
    };
  }),
  cancelMembership: protectedProcedure.mutation(async ({ ctx }) => {
    const request = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/customer/cancel-membership`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ctx.session.session.token}`,
          "Content-Type": "application/json",
        },
      },
    );

    const result = (await request.json()) as {
      status: "success" | "error";
      error?: { message?: string };
    };

    if (result.status !== "success") {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }

    return { success: true } as const;
  }),
  restoreMembership: protectedProcedure.mutation(async ({ ctx }) => {
    const request = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/customer/restore-membership`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ctx.session.session.token}`,
          "Content-Type": "application/json",
        },
      },
    );

    const result = (await request.json()) as {
      status: "success" | "error";
      error?: { message?: string };
    };

    if (result.status !== "success") {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }

    return { success: true } as const;
  }),
  switchPlan: protectedProcedure
    .input(
      z.object({
        plan_id: z.number(),
        card_id: z.number(),
        pay_interval: z.number().optional().default(1),
        affiliate_token: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Get affiliate token from input or cookie
      let affiliateToken = input.affiliate_token;
      if (!affiliateToken && ctx.cookies?.affiliate_token) {
        affiliateToken = ctx.cookies.affiliate_token;
      }

      const request = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/product/pay`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ctx.session.session.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...input,
            affiliate_token: affiliateToken,
          }),
        },
      );

      const result = (await request.json()) as {
        status: "success" | "error";
        error?: { message?: string };
      };

      if (result.status !== "success") {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.error?.message ?? "Failed to switch plan",
        });
      }
    }),
  getPrice: protectedProcedure
    .input(
      z.object({
        plan_id: z.number(),
        pay_interval: z.number().optional().default(1),
        affiliate_token: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      let affiliateToken = input.affiliate_token;
      if (!affiliateToken && ctx.cookies?.affiliate_token) {
        affiliateToken = ctx.cookies.affiliate_token;
      }

      console.log("affiliateToken", affiliateToken);

      const request = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/product/get-price`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ctx.session.session.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...input,
            affiliate_token: affiliateToken,
          }),
        },
      );

      const result = (await request.json()) as {
        status: "success" | "error";
        data: {
          price: number;
        };
        error?: { message?: string };
      };

      if (result.status !== "success") {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.error?.message ?? "Failed to get price for the plan",
        });
      }

      return result.data;
    }),
  downloadInvoice: protectedProcedure
    .input(
      z.object({
        invoice_id: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const request = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/product/download-invoice`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ctx.session.session.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(input),
        },
      );

      return request.blob();
    }),
  hasUnfinishedPayment: protectedProcedure.query(
    async ({ ctx }): Promise<PlanType | null> => {
      const register = await db
        .select()
        .from(registerSchema)
        .where(eq(registerSchema.email, ctx.session.user.email));

      if (register.length === 0) {
        return null;
      }

      const filtered = register.filter((item) => item.selectedPlan !== null);

      if (filtered.length === 0) {
        return null;
      }

      const lastRegister = filtered[filtered.length - 1];

      const plans = await fetchAvailablePlans(
        ctx.session.session.token,
        1,
        100,
      );

      return (
        plans.list.find((item) => item.id === lastRegister?.selectedPlan) ??
        null
      );
    },
  ),
  suppressUnfinishedPayment: protectedProcedure.mutation(async ({ ctx }) => {
    await db
      .delete(registerSchema)
      .where(eq(registerSchema.email, ctx.session.user.email));
  }),
} satisfies TRPCRouterRecord;
