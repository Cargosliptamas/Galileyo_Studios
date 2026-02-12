"use client";

import { Fragment, useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";

import { cn } from "@galileyo/ui";

interface VideoCaptionProps {
  caption: string | null;
  maxLines?: number;
  className?: string;
}

// Parse caption and convert hashtags and mentions to links
function parseCaption(
  text: string,
): { type: "text" | "hashtag" | "mention"; content: string }[] {
  const parts: {
    type: "text" | "hashtag" | "mention";
    content: string;
  }[] = [];

  // Regex to match hashtags and mentions
  const regex = /(#[a-zA-Z0-9_]+)|(@[a-zA-Z0-9_]+)/g;

  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push({
        type: "text",
        content: text.slice(lastIndex, match.index),
      });
    }

    // Add the match
    const matchedText = match[0];
    if (matchedText.startsWith("#")) {
      parts.push({ type: "hashtag", content: matchedText });
    } else if (matchedText.startsWith("@")) {
      parts.push({ type: "mention", content: matchedText });
    }

    lastIndex = regex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({
      type: "text",
      content: text.slice(lastIndex),
    });
  }

  return parts;
}

export function VideoCaption({
  caption,
  maxLines = 2,
  className,
}: VideoCaptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef<HTMLParagraphElement>(null);

  const parts = useMemo(() => {
    if (!caption) return [];
    return parseCaption(caption);
  }, [caption]);

  const toggleExpand = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded((prev) => !prev);
  }, []);

  if (!caption) return null;

  // Consider caption long if > 100 chars or has multiple lines
  const isLong = caption.length > 100 || caption.includes("\n");

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          !isExpanded && "max-h-[3.5rem]",
          isExpanded && "max-h-[500px]",
        )}
      >
        <p
          ref={contentRef}
          className={cn(
            "text-sm text-white transition-opacity duration-200",
            !isExpanded && maxLines > 0 && "line-clamp-2",
          )}
          style={
            !isExpanded && maxLines > 0
              ? {
                  display: "-webkit-box",
                  WebkitLineClamp: maxLines,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }
              : undefined
          }
        >
          {parts.map((part, index) => (
            <Fragment key={index}>
              {part.type === "hashtag" ? (
                <Link
                  href={`/videos/tag/${part.content.slice(1).toLowerCase()}`}
                  className="font-semibold text-cyan-400 hover:text-cyan-300 hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {part.content}
                </Link>
              ) : part.type === "mention" ? (
                <Link
                  href={`/profile/${part.content.slice(1)}`}
                  className="font-semibold text-cyan-400 hover:text-cyan-300 hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {part.content}
                </Link>
              ) : (
                part.content
              )}
            </Fragment>
          ))}
        </p>
      </div>

      {/* Show more/less button */}
      {isLong && (
        <button
          onClick={toggleExpand}
          className="mt-1.5 flex items-center gap-0.5 text-xs font-medium text-white/70 transition-colors hover:text-white"
        >
          {isExpanded ? (
            <>
              Show less
              <ChevronUp className="h-3 w-3" />
            </>
          ) : (
            <>
              Show more
              <ChevronDown className="h-3 w-3" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
