import { createPrivateKey, createSign } from "crypto";

import { env } from "~/env/server";

/**
 * Cloudflare Stream playback helpers.
 *
 * Free episodes, trailers, and commercials use unsigned public manifests.
 * Paid episodes use short-lived RS256 signed tokens built with node:crypto
 * (jose is not installed and must not be added).
 */

function base64url(input: Buffer | string): string {
  const buf = typeof input === "string" ? Buffer.from(input) : input;
  return buf.toString("base64url");
}

function getSubdomain(): string {
  return env.CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN;
}

/**
 * Public HLS manifest for unsigned playback (Episode 1, trailers, commercials).
 */
export function getPublicHlsUrl(videoUid: string): string {
  return `https://${getSubdomain()}/${videoUid}/manifest/video.m3u8`;
}

/**
 * Signed HLS manifest for paid playback. Builds an RS256 JWT whose header
 * carries the signing key id and whose payload scopes the token to the video
 * uid for the requested ttl, then swaps the token in for the uid in the
 * manifest URL per the Cloudflare Stream signed URL format.
 *
 * Defaults to a 6 hour ttl. Falls back to the public URL when signing
 * material is not configured so local and staging setups keep working.
 */
export function getSignedHlsUrl(
  videoUid: string,
  ttlSeconds = 60 * 60 * 6,
): string {
  const keyId = env.CLOUDFLARE_STREAM_SIGNING_KEY_ID;
  const pem = env.CLOUDFLARE_STREAM_SIGNING_KEY_PEM;

  if (!keyId || !pem) {
    return getPublicHlsUrl(videoUid);
  }

  // Support PEMs stored on a single line with escaped newlines.
  const normalizedPem = pem.includes("\\n") ? pem.replace(/\\n/g, "\n") : pem;
  const privateKey = createPrivateKey(normalizedPem);

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", kid: keyId };
  const payload = {
    sub: videoUid,
    kid: keyId,
    exp: now + ttlSeconds,
    nbf: now,
  };

  const signingInput = `${base64url(JSON.stringify(header))}.${base64url(
    JSON.stringify(payload),
  )}`;
  const signature = createSign("RSA-SHA256")
    .update(signingInput)
    .sign(privateKey);
  const token = `${signingInput}.${base64url(signature)}`;

  return `https://${getSubdomain()}/${token}/manifest/video.m3u8`;
}

/**
 * Thumbnail JPEG for a given video, optionally seeked to a timestamp.
 */
export function getThumbnailUrl(
  videoUid: string,
  timeSeconds?: number,
): string {
  const base = `https://${getSubdomain()}/${videoUid}/thumbnails/thumbnail.jpg`;
  return typeof timeSeconds === "number"
    ? `${base}?time=${timeSeconds}s`
    : base;
}
