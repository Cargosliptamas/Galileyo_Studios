import type { ReactNode, RefObject } from "react";
import { Loader2 } from "lucide-react";

import { cn } from "@galileyo/ui";

interface VideoFeedBaseProps<T> {
  header?: ReactNode;
  videos: T[];
  renderVideo: (video: T, index: number) => ReactNode;
  appendSlide?: ReactNode;
  aside?: ReactNode;
  containerRef: RefObject<HTMLDivElement | null>;
  loadMoreRef?: (node?: Element | null) => void;
  isFetchingNextPage?: boolean;
  isLoading?: boolean;
  emptyState?: ReactNode;
  className?: string;
  scrollAreaClassName?: string;
}

export function VideoFeedBase<T>({
  header,
  videos,
  renderVideo,
  appendSlide,
  aside,
  containerRef,
  loadMoreRef,
  isFetchingNextPage,
  isLoading,
  emptyState,
  className,
  scrollAreaClassName,
}: VideoFeedBaseProps<T>) {
  return (
    <div
      className={cn(
        "md:bg-card/72 relative w-full overflow-hidden md:rounded-[2rem] md:border md:border-border/70 md:shadow-[0_24px_80px_-32px_rgba(15,23,42,0.3)] md:backdrop-blur-xl",
        className,
      )}
    >
      {header}
      <div className="flex w-full">
        <div
          ref={containerRef}
          className={cn(
            "h-[100dvh] min-h-[100dvh] w-full snap-y snap-mandatory overflow-y-scroll md:h-[calc(100dvh-var(--desktop-utility-bar-height,4.5rem)-1.5rem)] md:min-h-[calc(100dvh-var(--desktop-utility-bar-height,4.5rem)-1.5rem)]",
            scrollAreaClassName,
          )}
          style={{ scrollSnapType: "y mandatory" }}
        >
          {isLoading ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <div className="flex items-center gap-2 rounded-full bg-muted px-4 py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Loading videos…</span>
              </div>
            </div>
          ) : videos.length === 0 ? (
            (emptyState ?? (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <p className="text-lg font-semibold text-foreground">
                    No videos yet
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Check back later for new uploads.
                  </p>
                </div>
              </div>
            ))
          ) : (
            <>
              {videos.map((video, index) => renderVideo(video, index))}
              {appendSlide}
            </>
          )}

          {loadMoreRef && <div ref={loadMoreRef} className="h-6" />}

          {isFetchingNextPage && (
            <div className="flex items-center justify-center py-6 text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span className="text-sm">Loading more videos…</span>
            </div>
          )}
        </div>

        {aside}
      </div>
    </div>
  );
}
