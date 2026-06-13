import { env } from "~/env/client";

/**
 * Cloudflare Images delivery helper.
 *
 * Returns a Cloudflare Images delivery URL for the given image id and variant.
 * When the account hash is not configured, the input is returned unchanged so
 * existing local "/studios/..." paths keep working as the fallback.
 */
export type StudiosImageVariant = "poster" | "hero" | "card" | "logo";

export function getImageUrl(
  imageId: string,
  variant: StudiosImageVariant,
): string {
  const accountHash = env.NEXT_PUBLIC_CLOUDFLARE_IMAGES_ACCOUNT_HASH;
  if (!accountHash) {
    return imageId;
  }
  return `https://imagedelivery.net/${accountHash}/${imageId}/${variant}`;
}
