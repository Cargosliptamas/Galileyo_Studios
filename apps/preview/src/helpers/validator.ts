import type { z } from "zod/v4";
import { validator } from "hono/validator";

export function validate<T extends z.ZodSchema>(
  type: "json" | "form",
  schema: T,
) {
  return validator(type, (value, c) => {
    const parsed = schema.safeParse(value);

    if (!parsed.success) {
      return c.json({ error: "Invalid request" }, { status: 422 });
    }

    return parsed.data as z.infer<T>;
  });
}
