"use client";

import { useMemo } from "react";

import type { ThirdPartyContentProps } from "./types";

export default function SpotifyContent({ link }: ThirdPartyContentProps) {
  const trackId = useMemo(() => {
    return link.split("track/")[1]?.split("?")[0];
  }, [link]);

  if (!trackId) {
    return null;
  }

  return (
    <iframe
      src={`https://open.spotify.com/embed/track/${trackId}`}
      width="100%"
      height="352"
      title="Spotify track"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen"
      style={{ borderRadius: "12px" }}
    ></iframe>
  );
}
