// app/components/Video.tsx (App Router) or components/Video.tsx (Pages Router)
import * as React from "react";
import clsx from "clsx";

interface Source {
  src: string;
  type: string;
}
interface Track {
  src: string;
  srclang: string;
  label: string;
  default?: boolean;
}

export interface VideoProps
  extends React.VideoHTMLAttributes<HTMLVideoElement> {
  sources: Source[]; // e.g., [{ src: "/videos/hero.webm", type: "video/webm" }, { src: "/videos/hero.mp4", type: "video/mp4" }]
  tracks?: Track[]; // optional captions
  containerClassName?: string; // for responsive wrappers
}

const Video = React.forwardRef<HTMLVideoElement, VideoProps>(function Video(
  {
    sources,
    tracks,
    containerClassName,
    className,
    muted = true,
    playsInline = true,
    ...props
  },
  ref,
) {
  return (
    <div
      className={clsx(
        "relative w-full overflow-hidden rounded-xl",
        "aspect-video",
        containerClassName,
      )}
    >
      <video
        ref={ref}
        className={clsx("h-full w-full object-cover", className)}
        muted={muted}
        playsInline={playsInline}
        // Good defaults for inline autoplay hero videos:
        autoPlay
        loop
        // Lazy-ish loading; browser can decide. Use "auto" if you want eager.
        preload="metadata"
        {...props}
      >
        {sources.map((s) => (
          <source key={s.src} src={s.src} type={s.type} />
        ))}
        {tracks?.map((t) => (
          <track
            key={t.src}
            src={t.src}
            kind="captions"
            srcLang={t.srclang}
            label={t.label}
            default={t.default}
          />
        ))}
        Your browser does not support the video tag.
      </video>
    </div>
  );
});

export default Video;
