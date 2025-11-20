import type { FC } from "react";

import type { ThirdPartyLinkType } from "~/lib/feed";

export interface ThirdPartyContentProps {
  link: string;
  type: ThirdPartyLinkType;
}

export type ThirdPartyContentComponent = FC<ThirdPartyContentProps>;
