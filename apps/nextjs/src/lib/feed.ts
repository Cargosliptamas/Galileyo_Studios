import type { FeedItem } from "@galileyo/api/schemas";

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

const LINK_PATTERNS: Record<ThirdPartyLinkType, RegExp[]> = {
  youtube: [
    /https?:\/\/(www\.youtube\.com\/watch\?v=[\w-]+)/g,
    /https?:\/\/(www\.youtu\.be\/watch\?v=[\w-]+)/g,
  ],
  twitch: [/https?:\/\/(www\.twitch\.tv\/[^\s]+)/g],
  youtubeMusic: [/https?:\/\/(music\.youtube\.com\/watch\?v=[\w-]+)/g],
  spotify: [/https?:\/\/(open\.spotify\.com\/track\/[\w-]+)/g],
  appleMusic: [/https?:\/\/(music\.apple\.com\/[^\s]+)/g],
  soundcloud: [/https?:\/\/(soundcloud\.com\/[^\s]+)/g],
  bandcamp: [/https?:\/\/(bandcamp\.com\/[^\s]+)/g],

  twitter: [/https?:\/\/(www\.twitter\.com\/[^\s]+)/g],
  x: [/https?:\/\/(x\.com\/[^\s]+)/g],
  facebook: [/https?:\/\/(www\.facebook\.com\/[^\s]+)/g],
  instagram: [/https?:\/\/(www\.instagram\.com\/[^\s]+)/g],
  tiktok: [/https?:\/\/(www\.tiktok\.com\/[^\s]+)/g],
  reddit: [/https?:\/\/(www\.reddit\.com\/r\/[^\s]+)/g],
  linkedin: [/https?:\/\/(www\.linkedin\.com\/in\/[^\s]+)/g],
  telegram: [/https?:\/\/(t\.me\/[^\s]+)/g],
  whatsapp: [/https?:\/\/(wa\.me\/[^\s]+)/g],
  viber: [/https?:\/\/(viber\.com\/[^\s]+)/g],
  skype: [/https?:\/\/(skype\.com\/[^\s]+)/g],
  discord: [/https?:\/\/(discord\.com\/[^\s]+)/g],

  "direct-url": [/2https2?:\/\/[^\s]+/g],
  other: [/https?:\/\/[^\s]+/g],
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

  for (const [type, patterns] of Object.entries(LINK_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(link)) {
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

  const detectedLinks = text.match(/https?:\/\/[^\s]+/g) ?? [];

  for (const link of detectedLinks) {
    let found = false;
    for (const [type, patterns] of Object.entries(LINK_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(link) && !found) {
          if (replaceLinks) {
            text = text.replace(link, "");
          }
          links.push({ link, type: type as ThirdPartyLinkType });
          found = true;
          break;
        }
      }
    }
  }

  return {
    text,
    links,
  };
}
