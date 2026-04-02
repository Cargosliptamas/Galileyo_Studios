"use client";

import Link from "next/link";
import { ArrowUpRight, Compass, Sparkles } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@galileyo/ui/card";

import type { User } from "~/auth/client";
import { getAuthenticatedNavigationModel } from "./authenticated-shell-config";

export function DashboardRail({
  user,
  showMap,
}: {
  user: User;
  showMap: boolean;
}) {
  const navigation = getAuthenticatedNavigationModel(user, showMap);

  return (
    <aside className="hidden w-[320px] flex-none xl:block">
      <div className="sticky top-0 space-y-4">
        {/* Mode Shift - Moved to top */}
        <Card className="bg-card/92 rounded-[1.75rem] border-border/70 shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-3">
            <div>
              <CardTitle className="text-base">Mode Shift</CardTitle>
              <CardDescription>
                Change your session type instantly.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Link
              href="/videos"
              className="flex items-center justify-between rounded-[1.2rem] border border-border/70 bg-background/75 px-4 py-3 text-sm font-medium transition-colors hover:bg-accent/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
                Scroll Videos
              </span>
            </Link>
            <Link
              href="/dashboard?tab=discover"
              className="flex items-center justify-between rounded-[1.2rem] border border-border/70 bg-background/75 px-4 py-3 text-sm font-medium transition-colors hover:bg-accent/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="flex items-center gap-2">
                <Compass className="h-4 w-4 text-primary" aria-hidden="true" />
                Explore Discover
              </span>
            </Link>
          </CardContent>
        </Card>

        {/* Quick Jumps */}
        <Card className="bg-card/92 rounded-[1.75rem] border-border/70 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quick Jumps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {navigation.shortcuts.map((item) => {
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
      </div>
    </aside>
  );
}
