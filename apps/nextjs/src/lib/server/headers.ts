import { headers } from "next/headers";

export async function isNativeUserAgent() {
  const h = await headers();

  return /\bGalileyoApp(?:\/|$)/.test(h.get("user-agent") ?? "");
}
