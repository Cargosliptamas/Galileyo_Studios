"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, LogOut, MoreHorizontal } from "lucide-react";

import { cn } from "@galileyo/ui";
import { Button } from "@galileyo/ui/button";
import { useIsMobile } from "@galileyo/ui/hooks";
import { ScrollArea } from "@galileyo/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@galileyo/ui/sheet";
import {
  Sidebar,
  SidebarContent,
  // SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@galileyo/ui/sidebar";
import { ThemeToggle } from "@galileyo/ui/theme";

import type { User } from "~/auth/client";
import { authClient } from "~/auth/client";
import { AppIcon } from "../app-icon";
import { SiteFooter } from "../site-footer";
import { SiteHeader } from "../site-header";
import {
  getAuthenticatedNavigationModel,
  getAuthenticatedShellLayout,
  isSurfaceActive,
} from "./authenticated-shell-config";
import { DesktopUtilityBar } from "./desktop-utility-bar";

// import { UserMenu } from "./user-menu";

function ShellNavigationSection({
  label,
  items,
  pathname,
  delayOffset = 0,
}: {
  label: string;
  items: ReturnType<typeof getAuthenticatedNavigationModel>["primary"];
  pathname: string;
  delayOffset?: number;
}) {
  if (items.length === 0) return null;

  return (
    <SidebarGroup className="px-2 py-0">
      <SidebarGroupLabel className="px-3">{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="gap-1">
          {items.map((item, index) => {
            const Icon = item.icon;
            const isActive = isSurfaceActive(pathname, item.href);

            return (
              <SidebarMenuItem
                key={item.key}
                className="sidebar-item-animate"
                style={{
                  animationDelay: `${delayOffset + index * 40}ms`,
                }}
              >
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.label}
                >
                  <Link href={item.href}>
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function DesktopSidebar({
  user,
  showMap,
  pathname,
}: {
  user: User;
  showMap: boolean;
  pathname: string;
}) {
  const navigation = useMemo(
    () => getAuthenticatedNavigationModel(user, showMap),
    [showMap, user],
  );

  return (
    <Sidebar variant="inset" collapsible="icon" className="border-r-0">
      <SidebarHeader className="sticky top-0 z-20 flex shrink-0 items-center justify-center border-b border-sidebar-border/30 bg-sidebar/95 px-4 py-3 backdrop-blur-xl">
        {/* Logo only - no text */}
        <div className="flex shrink-0 items-center justify-center">
          <AppIcon className="size-16" />
        </div>
      </SidebarHeader>

      <SidebarContent className="flex-1 gap-5 overflow-y-auto px-2 py-4">
        <ShellNavigationSection
          label="Primary"
          items={navigation.primary}
          pathname={pathname}
          delayOffset={0}
        />
        <ShellNavigationSection
          label="Library"
          items={navigation.secondary}
          pathname={pathname}
          delayOffset={100}
        />
      </SidebarContent>

      {/* <SidebarFooter className="px-3 py-3">
        <div className="rounded-xl border border-sidebar-border/40 bg-sidebar-accent/30 p-2 group-data-[collapsible=icon]:hidden">
          <UserMenu user={user} />
        </div>
        <div className="hidden justify-center rounded-xl border border-sidebar-border/40 bg-sidebar-accent/30 p-2 group-data-[collapsible=icon]:flex">
          <UserMenu user={user} onlyAvatar />
        </div>
      </SidebarFooter> */}
    </Sidebar>
  );
}

function MobileOverflowSheet({
  user,
  pathname,
  showMap,
  open,
  onOpenChange,
}: {
  user: User;
  pathname: string;
  showMap: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigation = useMemo(
    () => getAuthenticatedNavigationModel(user, showMap),
    [showMap, user],
  );

  const signOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/";
        },
      },
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[88dvh] overscroll-contain rounded-t-[2.5rem] border-x-0 border-b-0 border-t border-border/20 bg-gradient-to-b from-card to-background px-0 pb-10 shadow-2xl shadow-black/20"
      >
        {/* Handle indicator */}
        <div className="absolute left-1/2 top-3 h-1.5 w-12 -translate-x-1/2 rounded-full bg-border/60" />

        <SheetHeader className="px-6 pb-2 pt-6 text-left">
          <SheetTitle className="text-lg font-semibold tracking-tight">
            More Options
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-full px-5">
          <div className="space-y-4 pb-8 pt-2">
            {/* Section header card */}
            <div className="overflow-hidden rounded-2xl border border-border/30 bg-gradient-to-br from-indigo-500/5 via-cyan-500/5 to-purple-500/5 p-4">
              <h3 className="text-sm font-semibold text-foreground">Account</h3>
              <p className="text-xs text-muted-foreground">
                Access your personal settings and preferences
              </p>
            </div>

            {/* Navigation items */}
            <div className="grid gap-2">
              {navigation.mobileOverflow.map((item, index) => {
                const Icon = item.icon;
                const isActive = isSurfaceActive(pathname, item.href);

                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={() => onOpenChange(false)}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl border px-4 py-3.5 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]",
                      isActive
                        ? "border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 to-cyan-500/5 text-indigo-600 dark:text-indigo-400"
                        : "border-border/40 bg-card/80 hover:border-border/60 hover:bg-accent/30",
                    )}
                    style={{
                      animationDelay: `${index * 30}ms`,
                    }}
                  >
                    <div
                      className={cn(
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm transition-all duration-300",
                        isActive
                          ? "bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-indigo-500/25"
                          : "bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800",
                      )}
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "truncate font-medium",
                          isActive && "text-indigo-600 dark:text-indigo-400",
                        )}
                      >
                        {item.label}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    <svg
                      className={cn(
                        "h-4 w-4 shrink-0 text-muted-foreground/40 transition-all duration-300",
                        "group-hover:translate-x-0.5 group-hover:text-muted-foreground/60",
                      )}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                );
              })}
            </div>

            {/* Theme card */}
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-border/40 bg-card/80 p-4">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm transition-all duration-300",
                    "bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800",
                  )}
                >
                  <svg
                    className="h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Appearance</p>
                  <p className="text-xs text-muted-foreground">
                    Light or dark mode
                  </p>
                </div>
              </div>
              <ThemeToggle />
            </div>

            {/* Action buttons */}
            <div className="grid gap-2 pt-2">
              <Button
                asChild
                variant="outline"
                className="group h-12 justify-between rounded-xl border-border/40 bg-card/80 px-4 hover:border-border/60 hover:bg-accent/30"
              >
                <Link href="https://shop.galileyo.com/" target="_blank">
                  <span className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 shadow-sm">
                      <ExternalLink
                        className="h-4 w-4 text-white"
                        aria-hidden="true"
                      />
                    </span>
                    <span className="font-medium">Visit Shop</span>
                  </span>
                  <ExternalLink
                    className="h-4 w-4 text-muted-foreground/60"
                    aria-hidden="true"
                  />
                </Link>
              </Button>
              <Button
                variant="outline"
                className="group h-12 justify-between rounded-xl border-border/40 bg-card/80 px-4 text-destructive/80 hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                onClick={signOut}
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-rose-500 shadow-sm">
                    <LogOut className="h-4 w-4 text-white" aria-hidden="true" />
                  </span>
                  <span className="font-medium">Sign Out</span>
                </span>
                <LogOut
                  className="h-4 w-4 text-muted-foreground/60"
                  aria-hidden="true"
                />
              </Button>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function MobileTabBar({
  user,
  pathname,
  showMap,
}: {
  user: User;
  pathname: string;
  showMap: boolean;
}) {
  const navigation = useMemo(
    () => getAuthenticatedNavigationModel(user, showMap),
    [showMap, user],
  );
  const [overflowOpen, setOverflowOpen] = useState(false);

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-2 md:hidden">
        {/* Background blur layer */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-background/95 to-transparent" />

        <div className="mx-auto grid max-w-md grid-cols-5 gap-1.5 rounded-[2rem] border border-border/30 bg-card/80 p-2 shadow-2xl shadow-black/10 backdrop-blur-2xl">
          {navigation.mobileTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.href
              ? isSurfaceActive(pathname, tab.href)
              : false;

            if (tab.key === "other") {
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setOverflowOpen(true)}
                  className="relative touch-manipulation rounded-[1.3rem] px-1 py-2 text-[11px] font-medium text-muted-foreground/80 transition-all duration-300 hover:bg-accent/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95"
                  aria-label="Open more destinations"
                >
                  <div className="mx-auto mb-1 flex h-10 w-10 items-center justify-center rounded-[1.1rem] bg-gradient-to-br from-slate-200 to-slate-300 shadow-sm transition-all duration-300 dark:from-slate-700 dark:to-slate-800">
                    <MoreHorizontal
                      className="h-[18px] w-[18px]"
                      aria-hidden="true"
                    />
                  </div>
                  <span className="block text-center">{tab.label}</span>
                </button>
              );
            }

            return (
              <Link
                key={tab.key}
                href={tab.href ?? "/dashboard"}
                className={cn(
                  "relative touch-manipulation rounded-[1.3rem] px-1 py-2 text-[11px] font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95",
                  isActive
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-muted-foreground/80 hover:bg-accent/50 hover:text-foreground",
                )}
              >
                <div
                  className={cn(
                    "mx-auto mb-1 flex h-10 w-10 items-center justify-center rounded-[1.1rem] shadow-sm transition-all duration-300",
                    isActive
                      ? "bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-indigo-500/30"
                      : "bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800",
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                </div>
                <span className="block text-center">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <MobileOverflowSheet
        user={user}
        pathname={pathname}
        showMap={showMap}
        open={overflowOpen}
        onOpenChange={setOverflowOpen}
      />
    </>
  );
}

function PublicShell({
  children,
  user,
  showMap,
}: {
  children: React.ReactNode;
  user: User | undefined;
  showMap: boolean;
}) {
  return (
    <>
      <SiteHeader user={user} showMap={showMap} />
      <main id="main-content" className="flex flex-1 flex-col">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}

function AuthenticatedShellBody({
  children,
  user,
  showMap,
  pathname,
}: {
  children: React.ReactNode;
  user: User;
  showMap: boolean;
  pathname: string;
}) {
  const isMobile = useIsMobile();
  const layout = getAuthenticatedShellLayout(pathname, true, isMobile);

  return (
    <SidebarProvider
      defaultOpen={true}
      className="relative min-h-svh overflow-x-hidden [--desktop-utility-bar-height:4.5rem] [--sidebar-width-icon:4rem] [--sidebar-width:17.5rem] xl:[--sidebar-width:19.5rem]"
    >
      {/* Subtle background gradient */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-100/40 via-sky-50/30 to-transparent dark:from-indigo-950/30 dark:via-slate-950/50 dark:to-slate-950" />
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-transparent via-transparent to-slate-50/50 dark:to-slate-950/80" />

      <div className="flex min-h-svh w-full">
        {!isMobile ? (
          <DesktopSidebar user={user} showMap={showMap} pathname={pathname} />
        ) : null}

        <SidebarInset
          id="main-content"
          className={cn(
            "min-h-svh overflow-x-hidden bg-transparent md:h-svh md:overflow-y-auto",
            layout !== "auth-mobile-videos-immersive" &&
              "pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-0",
          )}
        >
          <div className="mx-auto flex min-h-svh w-full max-w-[1880px] flex-1 flex-col md:min-h-full">
            <DesktopUtilityBar user={user} showMap={showMap} />
            <div className="flex flex-1 flex-col overflow-x-hidden px-3 py-3 sm:px-4 lg:px-5 xl:px-6">
              {children}
            </div>
          </div>
        </SidebarInset>
      </div>

      {layout !== "auth-mobile-videos-immersive" ? (
        <MobileTabBar user={user} pathname={pathname} showMap={showMap} />
      ) : null}
    </SidebarProvider>
  );
}

export function AppLayoutShell({
  children,
  user,
  showMap,
}: {
  children: React.ReactNode;
  user: User | undefined;
  showMap: boolean;
}) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const layout = getAuthenticatedShellLayout(pathname, Boolean(user), isMobile);

  if (!user || layout === "public") {
    return (
      <PublicShell user={user} showMap={showMap}>
        {children}
      </PublicShell>
    );
  }

  return (
    <AuthenticatedShellBody user={user} showMap={showMap} pathname={pathname}>
      {children}
    </AuthenticatedShellBody>
  );
}
