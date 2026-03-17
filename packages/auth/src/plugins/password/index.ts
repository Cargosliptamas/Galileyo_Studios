import type { BetterAuthPlugin } from "better-auth";
import type { User as BetterAuthUser } from "better-auth/types";
import { APIError } from "better-auth/api";
import { setSessionCookie } from "better-auth/cookies";
import { createAuthEndpoint } from "better-auth/plugins";
import z from "zod";

import type { user as userSchema } from "@galileyo/db/schema";

const DEFAULT_IMPERSONATION_TOKEN_TTL_SECONDS = 60;
const DEFAULT_IMPERSONATION_CALLBACK_URL = "/dashboard";

interface PasswordPluginOptions {
  apiUrl: string;
  rateLimit?: { window?: number; max?: number };
  impersonationSharedSecret?: string;
  impersonationTokenTtlSeconds?: number;
}

function normalizeCallbackURL(callbackURL?: string): string {
  if (!callbackURL) {
    return DEFAULT_IMPERSONATION_CALLBACK_URL;
  }

  if (!callbackURL.startsWith("/") || callbackURL.startsWith("//")) {
    return DEFAULT_IMPERSONATION_CALLBACK_URL;
  }

  return callbackURL;
}

function getTokenTimestamp(token: string): number | null {
  const lastUnderscoreIndex = token.lastIndexOf("_");
  if (lastUnderscoreIndex === -1) {
    return null;
  }

  const timestamp = Number(token.slice(lastUnderscoreIndex + 1));
  if (!Number.isFinite(timestamp)) {
    return null;
  }

  return timestamp;
}

function isAdminTokenValid(token: string, ttlSeconds: number): boolean {
  const timestamp = getTokenTimestamp(token);
  if (timestamp === null) {
    return false;
  }

  return timestamp + ttlSeconds > Math.floor(Date.now() / 1000);
}

function toAuthUser(user: typeof userSchema.$inferSelect): BetterAuthUser & {
  firstName: string;
  lastName: string;
} {
  return {
    id: String(user.id),
    email: user.email ?? "",
    name: user.nameSearch ?? `${user.firstName} ${user.lastName}`,
    firstName: user.firstName,
    lastName: user.lastName ?? "",
    image: user.image,
    createdAt: new Date(user.createdAt),
    updatedAt: user.updatedAt ? new Date(user.updatedAt) : new Date(),
    emailVerified: user.isValidEmail === 1,
  };
}

export const passwordPlugin = (opts: PasswordPluginOptions) =>
  ({
    id: "galileyoPasswordPlugin",
    endpoints: {
      signInSuperLogin: createAuthEndpoint(
        "/sign-in/super-login",
        {
          method: "GET",
          requireHeaders: true,
          query: z.object({
            t: z.string().min(1),
            snnd: z.string().min(1),
            callbackURL: z.string().optional(),
          }),
        },
        async (ctx) => {
          const sharedSecret = opts.impersonationSharedSecret;
          const tokenTtlSeconds =
            opts.impersonationTokenTtlSeconds ??
            DEFAULT_IMPERSONATION_TOKEN_TTL_SECONDS;

          if (!sharedSecret || sharedSecret !== ctx.query.snnd) {
            throw new APIError(404);
          }

          if (!isAdminTokenValid(ctx.query.t, tokenTtlSeconds)) {
            throw new APIError(404);
          }

          const user = await ctx.context.adapter.findOne<
            typeof userSchema.$inferSelect
          >({
            model: "user",
            where: [
              {
                field: "adminToken",
                value: ctx.query.t,
              },
            ],
          });

          if (!user) {
            throw new APIError(404);
          }

          await ctx.context.adapter.update<{ id: number }>({
            model: "user",
            where: [
              {
                field: "id",
                value: String(user.id),
              },
              {
                field: "adminToken",
                value: ctx.query.t,
              },
            ],
            update: {
              adminToken: null,
            },
          });

          const session = await ctx.context.internalAdapter.createSession(
            String(user.id),
            ctx,
          );

          await setSessionCookie(ctx, {
            session,
            user: toAuthUser(user),
          });

          throw ctx.redirect(normalizeCallbackURL(ctx.query.callbackURL));
        },
      ),
      signInPassword: createAuthEndpoint(
        "/sign-in/password",
        {
          method: "POST",
          requireHeaders: true,
          body: z.object({
            email: z.email(),
            password: z.string(),
          }),
        },
        async (ctx) => {
          const { email, password } = ctx.body;

          const response = await fetch(`${opts.apiUrl}/default/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email,
              password,
              device: {
                uuid: "web-api",
                os: "web-api",
                info: {
                  build: {
                    date: "2999-12-31",
                  },
                },
              },
            }),
          });

          const result = (await response.json()) as {
            status: string;
            data:
              | {
                  user: {
                    id: number;
                    email: string;
                  };
                }
              | undefined
              | null;
            error:
              | {
                  code: string;
                  message: string;
                }
              | undefined;
          };

          if (result.status !== "success" || !result.data?.user) {
            throw new APIError("UNAUTHORIZED", {
              message: "Wrong email or password",
              code: "INVALID_CREDENTIALS",
            });
          }

          const user = await ctx.context.adapter.findOne<
            typeof userSchema.$inferSelect
          >({
            model: "user",
            where: [
              {
                field: "id",
                value: String(result.data.user.id),
              },
            ],
          });

          if (!user) {
            throw new APIError("UNAUTHORIZED", {
              message: "Wrong email or password",
              code: "INVALID_CREDENTIALS",
            });
          }

          const session = await ctx.context.internalAdapter.createSession(
            String(user.id),
            ctx,
          );

          await setSessionCookie(ctx, {
            session,
            user: toAuthUser(user),
          });

          return ctx.json({
            status: true,
          });
        },
      ),
    },
    rateLimit: [
      {
        pathMatcher(path) {
          return path.startsWith("/sign-in/password");
        },
        window: opts.rateLimit?.window ?? 60,
        max: opts.rateLimit?.max ?? 5,
      },
    ],
  }) satisfies BetterAuthPlugin;
