import { timingSafeEqual } from "node:crypto";

import { env } from "~/env/server";

export function verifyApiKey(req: Request): "ok" | "unconfigured" | "denied" {
  const key = env.SOLVENT_API_KEY;
  if (!key) return "unconfigured";

  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return "denied";

  const provided = header.slice(7);
  try {
    const keyBuf = Buffer.from(key, "utf8");
    const providedBuf = Buffer.from(provided, "utf8");
    if (keyBuf.length !== providedBuf.length) return "denied";
    return timingSafeEqual(keyBuf, providedBuf) ? "ok" : "denied";
  } catch {
    return "denied";
  }
}
