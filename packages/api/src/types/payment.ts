import { z } from "zod/v4";

export const PaymentDetailsSchema = z.object({
  first_name: z.string().min(1, { message: "First name is required" }),
  last_name: z.string().min(1, { message: "Last name is required" }),
  phone: z.string().min(1, { message: "Phone number is required" }),
  card_number: z.string().min(1, { message: "Card number is required" }),
  security_code: z.string().min(1, { message: "Security code is required" }),
  expiration_year: z
    .string()
    .min(1, { message: "Expiration year is required" }),
  expiration_month: z
    .string()
    .min(1, { message: "Expiration month is required" }),
  zip: z.string().min(1, { message: "ZIP code is required" }),
});

export type PaymentDetailsType = z.infer<typeof PaymentDetailsSchema>;

export const PaymentHistoryTypeSchema = z.enum([
  "authorize",
  "bitpay",
  "apply_credit",
  "pay_from_credit",
  "discount",
  "apple",
  "unknown",
]);

export type PaymentHistoryTypes = z.infer<typeof PaymentHistoryTypeSchema>;

export const PaymentHistorySchema = z.object({
  id: z.number(),
  created_at: z.string(),
  updated_at: z.string().nullable(),
  type: PaymentHistoryTypeSchema,
  total: z.number(),
  title: z.string(),
  is_void: z.boolean(),
  is_test: z.boolean(),
  is_success: z.boolean(),
  card_number: z.string().optional().nullable(),
  invoice_id: z.number(),
});

export type PaymentHistoryType = z.infer<typeof PaymentHistorySchema>;

export const PaymentHistoryListSchema = z.object({
  count: z.number(),
  page: z.number(),
  page_size: z.number(),
  list: z.array(PaymentHistorySchema),
});

export type PaymentHistoryListType = z.infer<typeof PaymentHistoryListSchema>;

export const PlanSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  current: z.boolean(),
  price: z.number(),
  settings: z.record(z.string(), z.string().or(z.number())),
  is_new_plan: z.boolean(),
  is_scheduled: z.boolean().optional().nullable(),
});

export type PlanType = z.infer<typeof PlanSchema>;

export const PlanListSchema = z.object({
  is_cancelled: z.boolean(),
  can_reactivate: z.boolean(),
  end_at: z.string().nullable(),
  count: z.number(),
  page: z.number(),
  page_size: z.number(),
  list: z.array(PlanSchema),
});

export type PlanListType = z.infer<typeof PlanListSchema>;
