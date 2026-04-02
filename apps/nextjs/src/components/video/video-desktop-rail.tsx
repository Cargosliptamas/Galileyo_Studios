"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@galileyo/ui/card";
import { ScrollArea } from "@galileyo/ui/scroll-area";

import type { SurfaceItem } from "~/components/layout/command-search-surfaces";
import { TrendingHashtags } from "./trending-hashtags";

export function VideoDesktopRail({
  title,
  description,
  summary,
  controls,
  quickLinks,
}: {
  title: string;
  description: string;
  summary?: React.ReactNode;
  controls?: React.ReactNode;
  quickLinks: SurfaceItem[];
}) {
  return (
    <ScrollArea className="hidden h-[100dvh] w-[320px] flex-none xl:block">
      <aside className="w-[320px] space-y-4 border-l border-border/70 bg-card/70 p-4 backdrop-blur-xl">
        <Card className="bg-card/92 rounded-[1.75rem] border-border/70 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {summary}
            {controls}
          </CardContent>
        </Card>

        <Card className="bg-card/92 rounded-[1.75rem] border-border/70 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Trending Hashtags</CardTitle>
            <CardDescription>
              Keep one eye on what people are reusing right now.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-1">
            <TrendingHashtags orientation="vertical" />
          </CardContent>
        </Card>

        <Card className="bg-card/92 rounded-[1.75rem] border-border/70 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quick Jumps</CardTitle>
            <CardDescription>
              Leave the video stack without losing the app context.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className="flex items-center gap-3 rounded-[1.25rem] border border-border/70 bg-background/75 px-4 py-3 transition-colors hover:bg-accent/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{item.label}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  <ArrowUpRight
                    className="h-4 w-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </aside>
    </ScrollArea>
  );
}
