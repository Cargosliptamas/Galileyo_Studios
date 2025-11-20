"use client";

import { useEffect, useState } from "react";

import type { DetectedLink } from "~/lib/feed";
import { getThirdPartyContentComponent } from "./third-party";

export default function FeedThirdPartyContent({
  links,
}: {
  links: DetectedLink[];
}) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-1">
      {links.map((link, index) => {
        const Component = getThirdPartyContentComponent(link.type);
        return (
          <div key={`${link.link}-${index}`} className="mx-auto w-full">
            <Component link={link.link} type={link.type} />
          </div>
        );
      })}
    </div>
  );
}
