"use client";

import { useState } from "react";

import { Button } from "@galileyo/ui";

interface ExpandableDescriptionProps {
  description: string;
  maxLength?: number;
}

export function ExpandableDescription({
  description,
  maxLength = 300,
}: ExpandableDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Strip HTML tags to get plain text length
  const stripHtml = (html: string) => {
    if (typeof document === "undefined") {
      // Fallback for SSR - simple regex to remove HTML tags
      return html
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&");
    }
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const htmlContent = description.replace(/\n/g, "<br />");
  const plainText = stripHtml(description);
  const needsTruncation = plainText.length > maxLength;
  const shouldShowToggle = needsTruncation;

  let displayHtml = htmlContent;
  if (needsTruncation && !isExpanded) {
    // Truncate at maxLength, trying to break at word boundary
    let truncated = plainText.slice(0, maxLength);
    const lastSpace = truncated.lastIndexOf(" ");
    if (lastSpace > maxLength * 0.8) {
      truncated = truncated.slice(0, lastSpace);
    }
    displayHtml = truncated + "...";
  }

  return (
    <div className="text-slate-900 dark:text-slate-100">
      <p
        className="whitespace-pre-wrap break-words"
        dangerouslySetInnerHTML={{
          __html: displayHtml,
        }}
      />
      {shouldShowToggle && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 h-auto p-0 text-sm text-blue-500 hover:bg-transparent hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
        >
          {isExpanded ? "Show less" : "Show more"}
        </Button>
      )}
    </div>
  );
}
