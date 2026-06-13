import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

import { eq } from "@galileyo/db";
import { db } from "@galileyo/db/client";
import { studiosEntitlement } from "@galileyo/db/schema";

import { getSession } from "~/auth/server";
import { env } from "~/env/server";

export const STUDIOS_UNLOCK_COOKIE = "studios_unlock";
export const STUDIOS_VIEWER_COOKIE = "studios_viewer";

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

interface ViewerPayload {
  email: string;
  iat: number;
}

/**
 * Signs a studios_viewer cookie token. Same HMAC pattern as the unlock cookie.
 * Set by the thank-you page after a verified purchase, since webhooks cannot
 * set cookies.
 */
export function signViewerToken(payload: ViewerPayload): string {
  const json = JSON.stringify(payload);
  const sig = createHmac("sha256", env.STUDIOS_UNLOCK_SECRET)
    .update(json)
    .digest("hex");
  return `${Buffer.from(json).toString("base64url")}.${sig}`;
}

export function verifyViewerToken(token: string): ViewerPayload | null {
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
    const parsed = JSON.parse(json) as ViewerPayload;
    if (typeof parsed.email !== "string" || typeof parsed.iat !== "number") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Resolves the current viewer's email: the session user email when logged in,
 * otherwise the signed studios_viewer cookie set after a purchase.
 */
export async function getViewerEmail(): Promise<string | null> {
  const session = await getSession();
  if (session?.user.email) return session.user.email;

  const cookieStore = await cookies();
  const token = cookieStore.get(STUDIOS_VIEWER_COOKIE)?.value;
  if (!token) return null;
  return verifyViewerToken(token)?.email ?? null;
}

function nowDatetime(): string {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

function isProducerKind(kind: string): boolean {
  return kind.startsWith("producer_");
}

/**
 * True when the viewer can watch the given episode: a free episode with the
 * unlock cookie, an episode entitlement for that slug, an unexpired bronze
 * entitlement, or any producer entitlement.
 */
export async function hasEpisodeAccess(
  slug: string,
  viewerEmail: string | null,
): Promise<boolean> {
  if (slug === "episode-1" && (await hasEpisode1Access())) return true;
  if (!viewerEmail) return false;

  const rows = await db
    .select()
    .from(studiosEntitlement)
    .where(eq(studiosEntitlement.email, viewerEmail));
  const now = nowDatetime();

  return rows.some((entitlement) => {
    if (entitlement.kind === "episode" && entitlement.episodeSlug === slug) {
      return true;
    }
    if (entitlement.kind === "bronze") {
      return !entitlement.expiresAt || entitlement.expiresAt > now;
    }
    return isProducerKind(entitlement.kind);
  });
}

/**
 * True when the viewer should not see mid-roll ads: an ad_free entitlement, an
 * unexpired bronze entitlement, or any producer entitlement.
 */
export async function hasAdFree(viewerEmail: string | null): Promise<boolean> {
  if (!viewerEmail) return false;

  const rows = await db
    .select()
    .from(studiosEntitlement)
    .where(eq(studiosEntitlement.email, viewerEmail));
  const now = nowDatetime();

  return rows.some((entitlement) => {
    if (entitlement.kind === "ad_free") return true;
    if (entitlement.kind === "bronze") {
      return !entitlement.expiresAt || entitlement.expiresAt > now;
    }
    return isProducerKind(entitlement.kind);
  });
}
