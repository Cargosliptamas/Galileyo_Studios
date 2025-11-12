import type { FC } from "react";

export interface ThirdPartyContentProps {
  link: string;
}

export type ThirdPartyContentComponent = FC<ThirdPartyContentProps>;
