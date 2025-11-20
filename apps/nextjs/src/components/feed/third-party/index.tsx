"use client";

import type { ThirdPartyContentComponent } from "./types";
import type { ThirdPartyLinkType } from "~/lib/feed";
// import OtherContent from "./other";
import PreviewContent from "./preview";
import SpotifyContent from "./spotify";
import YoutubeContent from "./youtube";

// import MicrolinkContent from "./microlink";

const NoopContent: ThirdPartyContentComponent = () => {
  return null;
};

export const ThirdPartyContent: Partial<
  Record<ThirdPartyLinkType, ThirdPartyContentComponent>
> = {
  youtube: YoutubeContent,
  spotify: SpotifyContent,
  // other: OtherContent,
  "direct-url": PreviewContent,
  other: PreviewContent,
};

export const getThirdPartyContentComponent = (type: ThirdPartyLinkType) => {
  return ThirdPartyContent[type] ?? ThirdPartyContent.other ?? NoopContent;
};
