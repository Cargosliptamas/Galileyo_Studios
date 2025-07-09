import { drizzle, MySql2Database } from "drizzle-orm/mysql2";

import * as schema from "./schema";
import * as relations from "./relations";

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
