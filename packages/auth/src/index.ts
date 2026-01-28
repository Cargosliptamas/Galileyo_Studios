import type { BetterAuthOptions } from "better-auth";
import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import {
  apiKey,
  // oAuthProxy,
  lastLoginMethod,
  magicLink,
} from "better-auth/plugins";

import { db } from "@galileyo/db/client";
import * as schema from "@galileyo/db/schema";

import { passwordPlugin } from "./plugins/password";

export interface EmailOptions {
  sendMagicLink: (
    data: {
      email: string;
      url: string;
      token: string;
    },
    request?: Request,
  ) => Promise<void> | void;
}

export function initAuth(options: {
  baseUrl: string;
  apiUrl?: string;
  productionUrl: string;
  secret: string | undefined;
  emailOptions: EmailOptions;
  trustedOrigins?: string[];

  // discordClientId: string;
  // discordClientSecret: string;
}) {
  // Allow Next app to override Better Auth trusted origins (useful for ngrok/tunnels)
  const trustedOrigins = options.trustedOrigins?.length
    ? options.trustedOrigins
    : ["expo://", "http://localhost:3000"]; // defaults for dev

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
        passwordHash: {
          type: "string",
          required: false,
          unique: false,
          returned: false,
        },
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
        isInfluencer: {
          type: "boolean",
          required: false,
          defaultValue: false,
        },
        isVerified: {
          type: "boolean",
          required: false,
          defaultValue: false,
        },
        isSpsActive: {
          type: "boolean",
          required: false,
          defaultValue: false,
        },
        status: {
          type: "number",
          required: true,
          defaultValue: 1,
        },
        role: {
          type: "number",
          required: false,
          defaultValue: 1,
        },
      },
    },
    session: {
      additionalFields: {},
      expiresIn: 604800, // 7 days
      updateAge: 259200, // 3 days
    },
    baseURL: options.baseUrl,
    secret: options.secret,
    emailAndPassword: {
      enabled: false,
    },
    plugins: [
      lastLoginMethod(),
      apiKey({
        disableKeyHashing: true,
        rateLimit: {
          enabled: false,
        },
        schema: {
          apikey: {
            modelName: "api_key",
          },
        },
      }),
      passwordPlugin({
        apiUrl: options.apiUrl ?? options.baseUrl,
      }),
      magicLink({
        disableSignUp: true,
        sendMagicLink: (data) => options.emailOptions.sendMagicLink(data),
      }),
      // oAuthProxy(),
      expo(),
    ],
    socialProviders: {
      // discord: {
      //   clientId: options.discordClientId,
      //   clientSecret: options.discordClientSecret,
      //   redirectURI: `${options.productionUrl}/api/auth/callback/discord`,
      // },
    },
    trustedOrigins,
  } satisfies BetterAuthOptions;

  return betterAuth(config);
}

export type Auth = ReturnType<typeof initAuth>;
export type Session = Auth["$Infer"]["Session"];
