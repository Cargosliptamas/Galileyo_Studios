import { drizzle } from "drizzle-orm/mysql2";

import * as relations from "./relations";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("Missing DATABASE_URL");
}

export const db = drizzle({
  connection: process.env.DATABASE_URL,
  schema: {
    ...schema,
    ...relations,
  },
  mode: "default",
});
