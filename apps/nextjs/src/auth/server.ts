// import "server-only";

import { cache } from "react";
import { headers } from "next/headers";

// import bcrypt from "bcrypt";

import { initAuth } from "@galileyo/auth";
import { getBaseUrl } from "@galileyo/utils";

import { env } from "~/env";
import { sendMagicLinkEmail } from "~/lib/emails";

export const auth = initAuth({
  baseUrl: getBaseUrl(env),
  apiUrl: env.NEXT_PUBLIC_API_URL,
  productionUrl: `https://${env.VERCEL_PROJECT_PRODUCTION_URL ?? "galileyo.com"}`,
  secret: env.AUTH_SECRET,
  emailOptions: {
    sendMagicLink: async ({ email, token, url }) =>
      sendMagicLinkEmail({ to: email, token, url }),
  },
  // emailAndPassword: {
  //   enabled: true,
  //   password: {
  //     hash: async (password) => await bcrypt.hash(password, 10),
  //     verify: async ({ hash, password }) => await bcrypt.compare(password, hash),
  //   },
  // },
  // discordClientId: env.AUTH_DISCORD_ID,
  // discordClientSecret: env.AUTH_DISCORD_SECRET,
});

export const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() }),
);
