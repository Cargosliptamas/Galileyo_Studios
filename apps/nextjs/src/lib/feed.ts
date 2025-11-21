import * as linkify from "linkifyjs";

import type { FeedItem } from "@galileyo/validators";

export function getUniqueId(item: FeedItem) {
  const idPart = item.id ?? crypto.randomUUID();
  const createdAtPart = item.created_at ?? "";

  return `${item.type}-${idPart}-${createdAtPart}`;
}

export type ThirdPartyLinkType =
  | "youtube"
  | "twitter"
  | "spotify"
  | "instagram"
  | "tiktok"
  | "reddit"
  | "linkedin"
  | "x"
  | "facebook"
  | "telegram"
  | "whatsapp"
  | "viber"
  | "skype"
  | "discord"
  | "twitch"
  | "youtubeMusic"
  | "appleMusic"
  | "soundcloud"
  | "bandcamp"
  | "direct-url"
  | "other";

const HOST_PATTERNS: Partial<Record<ThirdPartyLinkType, string[]>> = {
  youtube: ["youtube.com", "youtu.be"],
  twitch: ["twitch.tv"],

  youtubeMusic: ["music.youtube.com"],
  spotify: ["spotify.com"],
  appleMusic: ["music.apple.com"],
  soundcloud: ["soundcloud.com"],
  bandcamp: ["bandcamp.com"],

  twitter: ["twitter.com", "x.com"],
  instagram: ["instagram.com"],
  tiktok: ["tiktok.com"],
  reddit: ["reddit.com"],
  facebook: ["facebook.com"],
};

export interface DetectedLink {
  link: string;
  type: ThirdPartyLinkType;
}

export function detectLinkType(
  link?: string | null,
  defaultType?: ThirdPartyLinkType,
): ThirdPartyLinkType {
  if (!link) {
    return defaultType ?? ("other" as ThirdPartyLinkType);
  }

  for (const [type, patterns] of Object.entries(HOST_PATTERNS)) {
    for (const pattern of patterns) {
      if (link.includes(pattern)) {
        return type as ThirdPartyLinkType;
      }
    }
  }

  return defaultType ?? ("other" as ThirdPartyLinkType);
}

export function detectLinks(text?: string | null, replaceLinks = false) {
  if (!text) {
    return {
      text: "",
      links: [],
    };
  }

  const links: DetectedLink[] = [];

  const detectedLinks = linkify.find(text, {
    validate: {
      url: (value) => /^https?:\/\//.test(value),
    },
    ignoreTags: ["script", "style"],
  });

  for (const link of detectedLinks) {
    if (link.type === "url") {
      const type = detectLinkType(link.href, "other");
      links.push({ link: link.href, type });

      if (replaceLinks) {
        text = text.replace(link.href, "");
      }
    }
  }

  return {
    text,
    links,
  };
}
