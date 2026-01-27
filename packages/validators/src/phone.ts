import { z } from "zod/v4";

export const PhoneIdSchema = z.object({
  id: z.number(),
});

export type PhoneIdInput = z.infer<typeof PhoneIdSchema>;

export const PhoneSetSchema = z.object({
  id: z.number(),
  is_send: z.boolean(),
  is_emergency_only: z.boolean(),
});

export type PhoneSetInput = z.infer<typeof PhoneSetSchema>;
