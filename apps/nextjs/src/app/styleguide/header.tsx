"use client";

import { ThemeToggle } from "@galileyo/ui/theme";

interface HeaderProps {
  children: React.ReactNode;
}

export function StyleguideHeader({ children }: HeaderProps) {
  return (
    <header>
      <div className="flex items-start justify-between">
        <div>{children}</div>
        <ThemeToggle />
      </div>
    </header>
  );
}
