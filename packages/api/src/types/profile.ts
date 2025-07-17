import { z } from "zod/v4";

const passwordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters long" })
  .max(20, { message: "Password must be at most 20 characters long" })
  .refine((password) => /[A-Z]/.test(password), {
    message: "Password must contain at least one uppercase letter",
  })
  .refine((password) => /[a-z]/.test(password), {
    message: "Password must contain at least one lowercase letter",
  })
  .refine((password) => /[0-9]/.test(password), {
    message: "Password must contain at least one number",
  })
  .refine((password) => /[!@#$%^&*]/.test(password), {
    message: "Password must contain at least one special character",
  });

export const SignupSchema = z
  .object({
    first_name: z.string().min(1, { message: "First name is required" }),
    last_name: z.string().min(1, { message: "Last name is required" }),
    email: z.email({ message: "Invalid email address" }),
    password: passwordSchema,
    password_confirmation: z
      .string()
      .min(1, { message: "Password confirmation is required" }),
    country: z.string().min(1, { message: "Country is required" }),
    state: z.string().optional(),
    accept_terms: z
      .boolean()
      .refine((value) => value, {
        message: "You must accept the terms and conditions",
      }),
    after_eighteen: z
      .boolean()
      .refine((value) => value, {
        message: "You must be at least 18 years old",
      }),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });

export type SignupInput = z.infer<typeof SignupSchema>;
