"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { cn } from "@galileyo/ui";
import { Avatar, AvatarFallback, AvatarImage } from "@galileyo/ui/avatar";
import { Button } from "@galileyo/ui/button";

import { STUDIOS_EASE } from "./motion";
import { StudiosBrand } from "./studios-brand";

const NAV_LINKS = [
  { href: "/studios/episodes", label: "Episodes" },
  { href: "/studios/producers", label: "Producers" },
  { href: "/studios/membership", label: "Bronze" },
  { href: "/studios/sponsors", label: "Sponsors" },
  { href: "/studios/affiliates", label: "Affiliates" },
  { href: "/studios/donate", label: "Donate" },
  { href: "/studios/about", label: "About" },
] as const;

interface NavUser {
  name: string;
  email: string;
  image: string | null;
}

interface StudiosNavContentProps {
  user: NavUser | null;
}

function isLinkActive(pathname: string, href: string) {
  if (href === "/studios") return pathname === "/studios";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function StudiosNavContent({ user }: StudiosNavContentProps) {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Solidify and tighten the bar once the page scrolls, the way a film-site
  // chrome settles after the hero.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 backdrop-blur-xl transition-[background-color,border-color] duration-300",
        scrolled
          ? "border-b border-[rgb(var(--studios-border))]/70 bg-[rgb(var(--studios-bg))]/95"
          : "border-b border-[rgb(var(--studios-border))]/40 bg-[rgb(var(--studios-bg))]/70",
      )}
    >
      <div
        className={cn(
          "mx-auto flex w-full max-w-7xl items-center justify-between px-5 transition-[height] duration-300 md:px-8",
          scrolled ? "h-14 md:h-16" : "h-16 md:h-20",
        )}
      >
        <Link
          href="/studios"
          className="shrink-0"
          aria-label="Galileyo Studios"
        >
          <StudiosBrand size="md" />
        </Link>

        <nav className="hidden items-center gap-4 lg:flex lg:gap-7">
          {NAV_LINKS.map((link) => {
            const active = isLinkActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "font-display group relative text-[13px] tracking-[0.22em] transition-colors duration-200 lg:text-sm",
                  active
                    ? "text-[rgb(var(--studios-accent-hi))]"
                    : "text-[rgb(var(--studios-text-muted))] hover:text-[rgb(var(--studios-text))]",
                )}
              >
                {link.label.toUpperCase()}
                <span
                  aria-hidden
                  className={cn(
                    "absolute -bottom-1.5 left-0 h-px w-full origin-left bg-[rgb(var(--studios-accent))] transition-transform duration-200 ease-out",
                    active
                      ? "scale-x-100"
                      : "scale-x-0 group-hover:scale-x-100",
                  )}
                />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <Link
              href="/profile"
              className="hidden items-center gap-2 rounded-full border border-[rgb(var(--studios-border))]/70 bg-[rgb(var(--studios-surface))]/60 px-3 py-1.5 text-xs text-[rgb(var(--studios-text-muted))] transition-colors hover:border-[rgb(var(--studios-accent))]/60 hover:text-[rgb(var(--studios-text))] lg:inline-flex"
            >
              <Avatar className="size-6">
                {user.image ? (
                  <AvatarImage src={user.image} alt={user.name} />
                ) : null}
                <AvatarFallback className="bg-[rgb(var(--studios-surface-hi))] text-[10px] text-[rgb(var(--studios-text))]">
                  {user.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="max-w-[10rem] truncate">{user.name}</span>
            </Link>
          ) : (
            <Button
              asChild
              size="sm"
              variant="outline"
              className="hidden border-[rgb(var(--studios-accent))]/60 bg-transparent text-xs uppercase tracking-[0.2em] text-[rgb(var(--studios-text))] hover:bg-[rgb(var(--studios-accent))]/10 hover:text-[rgb(var(--studios-accent-hi))] lg:inline-flex"
            >
              <Link href="/login">Sign in</Link>
            </Button>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="inline-flex size-10 items-center justify-center rounded-full border border-[rgb(var(--studios-border))]/70 text-[rgb(var(--studios-text))] lg:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            className="border-t border-[rgb(var(--studios-border))]/60 bg-[rgb(var(--studios-bg))] lg:hidden"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: STUDIOS_EASE }}
          >
            <nav className="mx-auto flex w-full max-w-7xl flex-col gap-1 px-5 py-4">
              {NAV_LINKS.map((link) => {
                const active = isLinkActive(pathname, link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "font-display rounded-md px-3 py-3 text-sm tracking-[0.22em]",
                      active
                        ? "bg-[rgb(var(--studios-surface))] text-[rgb(var(--studios-accent-hi))]"
                        : "text-[rgb(var(--studios-text-muted))] hover:bg-[rgb(var(--studios-surface))]/60 hover:text-[rgb(var(--studios-text))]",
                    )}
                  >
                    {link.label.toUpperCase()}
                  </Link>
                );
              })}
              <div className="mt-3 border-t border-[rgb(var(--studios-border))]/60 pt-3">
                {user ? (
                  <Link
                    href="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-md px-3 py-3 text-sm text-[rgb(var(--studios-text-muted))]"
                  >
                    <Avatar className="size-7">
                      {user.image ? (
                        <AvatarImage src={user.image} alt={user.name} />
                      ) : null}
                      <AvatarFallback className="bg-[rgb(var(--studios-surface-hi))] text-[10px] text-[rgb(var(--studios-text))]">
                        {user.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate">{user.name}</span>
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="font-display block rounded-md px-3 py-3 text-sm uppercase tracking-[0.22em] text-[rgb(var(--studios-accent-hi))]"
                  >
                    Sign in
                  </Link>
                )}
              </div>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
