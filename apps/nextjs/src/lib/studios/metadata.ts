import type { Metadata } from "next";

import { getImageUrl } from "./images";

/**
 * Local fallback share image. The studios poster art is not in the repo yet
 * (public/studios is empty), so we fall back to the Galileyo logo rather than
 * a broken image. Replace with a 1200x630 studios poster once it lands, or set
 * an episode heroImageId so the Cloudflare Images hero variant is used.
 */
const STUDIOS_OG_FALLBACK = "/galileyo_new_logo.png";

interface StudiosMetadataInput {
  title: string;
  description: string;
  path: string;
  heroImageId?: string | null;
}

/**
 * Builds OpenGraph and Twitter card metadata for a Studios page. The share
 * card is the advertisement, so callers should pass selling copy. Uses the
 * Cloudflare Images hero variant when an id is provided, otherwise the local
 * fallback. metadataBase is set on the Studios layout so relative image and
 * url paths resolve to absolute urls.
 */
export function buildStudiosMetadata({
  title,
  description,
  path,
  heroImageId,
}: StudiosMetadataInput): Metadata {
  const image = heroImageId
    ? getImageUrl(heroImageId, "hero")
    : STUDIOS_OG_FALLBACK;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: path,
      siteName: "Galileyo Studios",
      type: "website",
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
