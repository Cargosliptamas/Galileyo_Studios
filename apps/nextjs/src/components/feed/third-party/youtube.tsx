"use client";

import { useMemo } from "react";

import type { ThirdPartyContentProps } from "./types";

export default function YoutubeContent({ link }: ThirdPartyContentProps) {
  const videoId = useMemo(() => {
    if (link.includes("youtu.be")) {
      return link.split("/").pop();
    }

    return link.split("v=")[1]?.split("&")[0];
  }, [link]);

  if (!videoId) {
    return null;
  }

  return (
    <div className="mb-4 aspect-video max-h-[315px] rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-900/50">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        width="100%"
        height="100%"
        title="Youtube video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  );
}
