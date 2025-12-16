"use client";

import { useEffect, useState } from "react";

import { env } from "~/env/client";

function Analytics({ enabled }: { enabled: boolean }) {
  if (
    !enabled ||
    !env.NEXT_PUBLIC_ANALYTICS_ID ||
    !env.NEXT_PUBLIC_ANALYTICS_ENABLED
  ) {
    return null;
  }

  return (
    <>
      <script
        async
        defer
        src={`https://tools.luckyorange.com/core/lo.js?site-id=${env.NEXT_PUBLIC_ANALYTICS_ID}`}
      ></script>
    </>
  );
}

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <>
      {children}
      <Analytics enabled={isClient} />
    </>
  );
}
