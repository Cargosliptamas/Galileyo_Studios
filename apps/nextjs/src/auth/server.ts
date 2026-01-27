// TODO: Remove this once we have a proper server-only implementation on the ws module
// import "server-only";

import { cache } from "react";
import { headers } from "next/headers";

// import bcrypt from "bcrypt";

import { initAuth } from "@galileyo/auth";
import { getBaseUrl } from "@galileyo/utils";

import { env } from "~/env";
import { sendMagicLinkEmail } from "~/lib/emails";

/*
function normalizeOrigin(input: string): string {
  const t = input.trim().replace(/\/+$/, ""); // strip trailing slashes
  // Keep non-http(s) schemes (e.g., expo://) as-is
  if (!(t.startsWith("http://") || t.startsWith("https://"))) return t;
  try {
    return new URL(t).origin; // reduce to scheme+host+port
  } catch {
    return t;
  }
}

function parseTrustedOrigins(raw?: string): string[] {
  const defaults = ["http://localhost:3000", "http://127.0.0.1:3000"];
  const parts = (raw ?? "")
    .split(/[,\s]+/) // split by commas or whitespace
    .filter(Boolean)
    .map(normalizeOrigin);

  // de-dup and keep order (defaults first)
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of [...defaults, ...parts]) {
    if (!seen.has(v)) {
      seen.add(v);
      out.push(v);
    }
  }
  return out;
}

export const trustedOrigins = parseTrustedOrigins(
  process.env.AUTH_TRUSTED_ORIGINS,
);
*/

export const auth = initAuth({
  baseUrl: getBaseUrl(env),
  apiUrl: env.NEXT_PUBLIC_API_URL,
  productionUrl: `https://${env.VERCEL_PROJECT_PRODUCTION_URL ?? "galileyo.com"}`,
  secret: env.AUTH_SECRET,
  //trustedOrigins,
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
