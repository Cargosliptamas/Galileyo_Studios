"use client";

import type { ThirdPartyContentComponent } from "./types";
import type { ThirdPartyLinkType } from "~/lib/feed";
import SpotifyContent from "./spotify";
import YoutubeContent from "./youtube";

// import OtherContent from "./other";

const NoopContent: ThirdPartyContentComponent = () => {
  return null;
};

export const ThirdPartyContent: Partial<
  Record<ThirdPartyLinkType, ThirdPartyContentComponent>
> = {
  youtube: YoutubeContent,
  spotify: SpotifyContent,
  // other: OtherContent,
  other: NoopContent,
};

export const getThirdPartyContentComponent = (type: ThirdPartyLinkType) => {
  return ThirdPartyContent[type] ?? ThirdPartyContent.other ?? NoopContent;
};
