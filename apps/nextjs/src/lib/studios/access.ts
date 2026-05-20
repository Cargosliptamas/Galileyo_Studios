import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

import { env } from "~/env/server";

export const STUDIOS_UNLOCK_COOKIE = "studios_unlock";

interface UnlockPayload {
  email: string;
  episode: string;
  iat: number;
}

export function signUnlockToken(payload: UnlockPayload): string {
  const json = JSON.stringify(payload);
  const sig = createHmac("sha256", env.STUDIOS_UNLOCK_SECRET)
    .update(json)
    .digest("hex");
  return `${Buffer.from(json).toString("base64url")}.${sig}`;
}

export function verifyUnlockToken(token: string): UnlockPayload | null {
  const [encodedPayload, sig] = token.split(".");
  if (!encodedPayload || !sig) return null;

  let json: string;
  try {
    json = Buffer.from(encodedPayload, "base64url").toString("utf-8");
  } catch {
    return null;
  }

  const expectedSig = createHmac("sha256", env.STUDIOS_UNLOCK_SECRET)
    .update(json)
    .digest("hex");

  const sigBuf = Buffer.from(sig, "hex");
  const expectedBuf = Buffer.from(expectedSig, "hex");
  if (sigBuf.length !== expectedBuf.length) return null;
  if (!timingSafeEqual(sigBuf, expectedBuf)) return null;

  try {
    const parsed = JSON.parse(json) as UnlockPayload;
    if (
      typeof parsed.email !== "string" ||
      typeof parsed.episode !== "string" ||
      typeof parsed.iat !== "number"
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export async function hasEpisode1Access(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(STUDIOS_UNLOCK_COOKIE)?.value;
  if (!token) return false;
  const payload = verifyUnlockToken(token);
  return payload?.episode === "episode-1";
}
