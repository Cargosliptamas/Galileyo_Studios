"use client";

import Link from "next/link";
import { MapIcon } from "lucide-react";

import type { User } from "~/auth/client";
import { AppIcon } from "../app-icon";
import CommandMenu from "./command-menu";
import { NotificationCenter } from "./notification-center";
import { UserMenu } from "./user-menu";

export default function AuthNavbar({
  user,
  showMap,
}: {
  user: User;
  showMap: boolean;
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 px-4 backdrop-blur-sm transition-colors dark:border-slate-800 dark:bg-slate-950/95 md:px-6">
      <div className="lg:px-8* mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 py-8 sm:px-6">
        {/* Left side */}
        <div className="flex flex-1 items-center gap-2">
          {/* Mobile menu trigger */}
          {/* <Popover>
            <PopoverTrigger asChild>
              <Button
                className="group size-8 md:hidden"
                variant="ghost"
                size="icon"
              >
                <svg
                  className="pointer-events-none"
                  width={16}
                  height={16}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 12L20 12"
                    className="ease-[cubic-bezier(.5,.85,.25,1.1)] origin-center -translate-y-[7px] transition-all duration-300 group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[315deg]"
                  />
                  <path
                    d="M4 12H20"
                    className="ease-[cubic-bezier(.5,.85,.25,1.8)] origin-center transition-all duration-300 group-aria-expanded:rotate-45"
                  />
                  <path
                    d="M4 12H20"
                    className="ease-[cubic-bezier(.5,.85,.25,1.1)] origin-center translate-y-[7px] transition-all duration-300 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[135deg]"
                  />
                </svg>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-36 p-1 md:hidden">
              <NavigationMenu className="max-w-none *:w-full">
                <NavigationMenuList className="flex-col items-start gap-0 md:gap-2">
                  {navigationLinks.map((link, index) => (
                    <NavigationMenuItem key={index} className="w-full">
                      <NavigationMenuLink
                        asChild
                        className="py-1.5"
                        // active={link.active}
                      >
                        <Link href={link.href}>{link.label}</Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            </PopoverContent>
          </Popover> */}
          {/* Logo */}
          <div className="flex items-center">
            <Link
              href="/dashboard"
              className="w-20 text-primary hover:text-primary/90"
              suppressHydrationWarning
            >
              <AppIcon />
            </Link>
          </div>
        </div>
        {/* Middle area */}
        <div className="grow">
          <div className="relative mx-auto w-full max-w-xs">
            <CommandMenu />
          </div>
        </div>
        {/* Right side */}
        <div className="flex flex-1 items-center justify-end gap-2">
          {/* Notification */}
          <NotificationCenter />
          {showMap && (
            <Link href="/alerts-map" className="icon-button">
              <MapIcon className="h-5 w-5" />
            </Link>
          )}
          {/* <ThemeToggle /> */}
          {/* <Button
            size="icon"
            onClick={openCreatePost}
          >
            <PlusIcon
              size={16}
              aria-hidden="true"
            />
            <span className="sr-only">Post</span>
          </Button> */}
          <UserMenu user={user} onlyAvatar={true} />
        </div>
      </div>
      {/* Bottom navigation */}
      {/* <div className="border-t py-2 max-md:hidden">
        <NavigationMenu>
          <NavigationMenuList className="gap-2">
            {navigationLinks.map((link, index) => (
              <NavigationMenuItem key={index}>
                <NavigationMenuLink
                  asChild
                  // active={link.active}
                  className="py-1.5 font-medium text-muted-foreground hover:text-primary"
                >
                  <Link href={link.href}>{link.label}</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </div> */}

      {/* <CreatePostModal isOpen={isCreatePostOpen} onClose={closeCreatePost} /> */}
    </header>
  );
}
