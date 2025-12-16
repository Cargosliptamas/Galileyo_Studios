"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";

import { Card, CardDescription, CardTitle, Skeleton } from "@galileyo/ui";

import type { ThirdPartyContentProps } from "./types";
import type { LinkPreviewData } from "~/lib/types/preview";
import { env } from "~/env/client";

export default function PreviewContent({ link }: ThirdPartyContentProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["preview", link],
    queryFn: async () => {
      const response = await fetch(`/api/preview/link`, {
        method: "POST",
        body: JSON.stringify({ url: link }),
      });
      const data = (await response.json()) as LinkPreviewData;
      return data;
    },
    refetchOnWindowFocus: false,
    enabled: env.NEXT_PUBLIC_PREVIEW_ENABLED,
  });

  if (isLoading) {
    return <Skeleton className="h-[200px] w-full rounded-lg" />;
  }

  if (!data || !env.NEXT_PUBLIC_PREVIEW_ENABLED) {
    return (
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-blue-500 hover:text-blue-600"
      >
        <span className="flex-1 truncate">{link}</span>
        <ExternalLink className="h-4 w-4" />
      </a>
    );
  }

  const hasImage = data.image;
  const displayUrl = data.url ?? link;
  let domain = "";
  try {
    domain = displayUrl ? new URL(displayUrl).hostname.replace("www.", "") : "";
  } catch {
    // Invalid URL, use empty string
  }

  return (
    <Link
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
    >
      <Card className="w-full overflow-hidden transition-all duration-200 hover:border-primary/20 hover:shadow-lg">
        <div
          className={`grid grid-cols-1 md:flex ${hasImage ? "md:flex-row" : "md:flex-col"} ${hasImage ? "h-[200px]" : "min-h-[120px]"}`}
        >
          {hasImage && (
            <div className="relative flex h-full w-40 flex-shrink-0 items-center justify-center bg-muted md:w-[200px]">
              <img
                src={data.image}
                alt={data.title ?? "Link preview"}
                className="object-cover"
                sizes="200px"
              />
            </div>
          )}
          <div className="flex min-w-0 flex-1 flex-col justify-between p-4">
            <div className="space-y-2">
              {data.title && (
                <CardTitle className="line-clamp-2 text-base transition-colors group-hover:text-primary">
                  {data.title}
                </CardTitle>
              )}
              {data.description && (
                <CardDescription className="line-clamp-2 text-sm">
                  {data.description}
                </CardDescription>
              )}
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              {data.logo && (
                <div className="relative h-4 w-4 flex-shrink-0">
                  <img
                    src={data.logo}
                    alt={data.publisher ?? domain}
                    className="rounded object-contain"
                    sizes="16px"
                  />
                </div>
              )}
              <span className="truncate">{data.publisher ?? domain}</span>
              {data.author && (
                <>
                  <span>•</span>
                  <span className="truncate">{data.author}</span>
                </>
              )}
              <ExternalLink className="ml-auto h-3 w-3 flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
