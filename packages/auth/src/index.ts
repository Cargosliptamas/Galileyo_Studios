import type { BetterAuthOptions } from "better-auth";
import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink, oAuthProxy } from "better-auth/plugins";

import * as schema from "@galileyo/db/schema";
import { db } from "@galileyo/db/client";

export interface EmailOptions {
  sendMagicLink: (data: {
      email: string;
      url: string;
      token: string;
  }, request?: Request) => Promise<void> | void;
}

export function initAuth(options: {
  baseUrl: string;
  productionUrl: string;
  secret: string | undefined;
  emailOptions: EmailOptions;

  // discordClientId: string;
  // discordClientSecret: string;
}) {
  const config = {
    database: drizzleAdapter(db, {
      provider: "mysql",
      schema,
    }),
    advanced: {
      database: {
        // generateId: false,
        useNumberId: true,
      },
    },
    user: {
      modelName: "user",
      fields: {
        name: "firstName",
        emailVerified: "isValidEmail",
      },
      additionalFields: {
        firstName: {
          type: "string",
          required: true,
          defaultValue: "",
        },
        lastName: {
          type: "string",
          required: true,
          defaultValue: "",
        },
      },
    },
    baseURL: options.baseUrl,
    secret: options.secret,
    plugins: [
      magicLink({
        disableSignUp: true,
        sendMagicLink: (data) => options.emailOptions.sendMagicLink(data),
      }),
      oAuthProxy({
        /**
         * Auto-inference blocked by https://github.com/better-auth/better-auth/pull/2891
         */
        currentURL: options.baseUrl,
        productionURL: options.productionUrl,
      }),
      expo(),
    ],
    socialProviders: {
      // discord: {
      //   clientId: options.discordClientId,
      //   clientSecret: options.discordClientSecret,
      //   redirectURI: `${options.productionUrl}/api/auth/callback/discord`,
      // },
    },
    trustedOrigins: ["expo://"],
  } satisfies BetterAuthOptions;

  return betterAuth(config);
}

export type Auth = ReturnType<typeof initAuth>;
export type Session = Auth["$Infer"]["Session"];
