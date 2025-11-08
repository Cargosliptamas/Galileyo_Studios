import {
  boolean,
  int,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const user = mysqlTable("user", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  isValidEmail: boolean("is_valid_email").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { fsp: 3 })
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  firstName: text("first_name").default("").notNull(),
  lastName: text("last_name").default("").notNull(),
  isInfluencer: boolean("is_influencer").default(false),
  isVerified: boolean("is_verified").default(false),
  isSpsActive: boolean("is_sps_active").default(false),
  status: int("status").default(1).notNull(),
});

export const session = mysqlTable("session", {
  id: int("id").autoincrement().primaryKey(),
  expiresAt: timestamp("expires_at", { fsp: 3 }).notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { fsp: 3 })
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: int("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = mysqlTable("account", {
  id: int("id").autoincrement().primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: int("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { fsp: 3 }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { fsp: 3 }),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { fsp: 3 })
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const verification = mysqlTable("verification", {
  id: int("id").autoincrement().primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { fsp: 3 }).notNull(),
  createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { fsp: 3 })
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const api_key = mysqlTable("api_key", {
  id: int("id").autoincrement().primaryKey(),
  name: text("name"),
  start: text("start"),
  prefix: text("prefix"),
  key: text("key").notNull(),
  userId: int("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  refillInterval: int("refill_interval"),
  refillAmount: int("refill_amount"),
  lastRefillAt: timestamp("last_refill_at", { fsp: 3 }),
  enabled: boolean("enabled").default(true),
  rateLimitEnabled: boolean("rate_limit_enabled").default(true),
  rateLimitTimeWindow: int("rate_limit_time_window").default(86400000),
  rateLimitMax: int("rate_limit_max").default(10),
  requestCount: int("request_count").default(0),
  remaining: int("remaining"),
  lastRequest: timestamp("last_request", { fsp: 3 }),
  expiresAt: timestamp("expires_at", { fsp: 3 }),
  createdAt: timestamp("created_at", { fsp: 3 }).notNull(),
  updatedAt: timestamp("updated_at", { fsp: 3 }).notNull(),
  permissions: text("permissions"),
  metadata: text("metadata"),
});
