import type { BetterAuthPlugin } from "better-auth";
import type { User as BetterAuthUser } from "better-auth/types";
import { APIError } from "better-auth/api";
import { setSessionCookie } from "better-auth/cookies";
import { createAuthEndpoint } from "better-auth/plugins";
import z from "zod";

import type { user as userSchema } from "@galileyo/db/schema";

interface PasswordPluginOptions {
  apiUrl: string;
  rateLimit?: { window?: number; max?: number };
}

export const passwordPlugin = (opts: PasswordPluginOptions) =>
  ({
    id: "galileyoPasswordPlugin",
    endpoints: {
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

          const userData: BetterAuthUser & {
            firstName: string;
            lastName: string;
          } = {
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

          await setSessionCookie(ctx, {
            session,
            user: userData,
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
