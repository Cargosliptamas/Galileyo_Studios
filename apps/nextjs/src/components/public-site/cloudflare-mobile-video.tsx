"use client";

import { useEffect, useRef } from "react";
import Hls from "hls.js";

import { cn } from "@galileyo/ui";

import { env } from "~/env/client";

const POSTER_URL = "/galileyo-mobile-poster.jpg";

function isHlsSource(src: string): boolean {
  if (src.endsWith(".m3u8")) return true;

  try {
    const url = new URL(src, window.location.origin);
    return url.searchParams.get("format") === "hls";
  } catch {
    return false;
  }
}

export function CloudflareMobileVideo({ className }: { className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const src = env.NEXT_PUBLIC_GALILEYO_MOBILE_VIDEO_URL;
  const isHls = src ? isHlsSource(src) : false;
  const useHlsJs = isHls && Hls.isSupported();

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    if (useHlsJs) {
      const hls = new Hls({ enableWorker: true });
      hls.loadSource(src);
      hls.attachMedia(video);
      return () => hls.destroy();
    }

    if (isHls && video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    }
  }, [isHls, src, useHlsJs]);

  if (!src) {
    return (
      <img
        src={POSTER_URL}
        alt=""
        width={272}
        height={504}
        className={cn("max-w-full rounded-xl shadow-lg", className)}
      />
    );
  }

  return (
    <video
      ref={videoRef}
      className={cn("max-w-full rounded-xl shadow-lg", className)}
      src={useHlsJs ? undefined : src}
      poster={POSTER_URL}
      width={272}
      height={504}
      playsInline
      muted
      autoPlay
      loop
      controls={false}
      preload="metadata"
    />
  );
}
