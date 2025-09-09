"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, useMotionValueEvent, useScroll } from "motion/react";

import { cn } from "@galileyo/ui";
import { Button, buttonVariants } from "@galileyo/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@galileyo/ui/navigation-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@galileyo/ui/popover";

import { AppIcon } from "../app-icon";
import { navigationLinks } from "./navigation-items";
import { usePathname } from "next/navigation";

export default function PublicNavbar() {
  const { scrollY } = useScroll();
  const pathname = usePathname();

  const isHome = useMemo(() => pathname === "/" || pathname === "/home", [pathname]);
  
  const [isAnimationActive, setIsAnimationActive] = useState(() => isHome ? false : true);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (!isHome) {
      setIsAnimationActive(true);
      return;
    }

    if (latest > 100) {
      setIsAnimationActive(true);
    } else {
      setIsAnimationActive(false);
    }
  });

  useEffect(() => {
    if (isHome) {
      setIsAnimationActive(false);
    } else {
      setIsAnimationActive(true);
    }
  }, [isHome]);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-slate-900 px-4 backdrop-blur-sm transition-colors dark:border-slate-800 dark:bg-slate-950/95 md:px-6">
      <div className="lg:px-8* mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 py-8 sm:px-6">
        {/* Left side */}
        <div className="flex items-center gap-3">
          {/* Mobile menu trigger */}
          <Popover>
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
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild className="py-1.5">
                      <Link href="/login">Sign In</Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </PopoverContent>
          </Popover>
          {/* Main nav */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex w-20" suppressHydrationWarning>
              <AppIcon useDark={true} />
            </Link>
          </div>
        </div>
        {/* Center side */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-6">
            {/* Navigation menu */}
            <NavigationMenu className="max-md:hidden">
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
          </div>
        </div>
        {/* Right side */}
        <div className="flex items-center gap-3">
          <motion.div
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1 },
            }}
            initial={isHome ? "hidden" : "visible"}
            // transition={{
            //   delay: 0.5,
            // }}
            animate={isAnimationActive ? "visible" : "hidden"}
          >
            <Link
              className={cn(
                buttonVariants({ variant: "primary" }),
                isAnimationActive ? "" : "cursor-default",
              )}
              href="/sign-up"
            >
              Get Started
            </Link>
          </motion.div>

          <Button asChild variant="ghost" className="text-white">
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
