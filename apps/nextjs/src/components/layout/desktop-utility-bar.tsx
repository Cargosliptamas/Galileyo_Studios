"use client";

import type { User } from "~/auth/client";
import CommandMenu from "./command-menu";
import { NotificationCenter } from "./notification-center";
import { UserMenu } from "./user-menu";

export function DesktopUtilityBar({
  user,
  showMap,
}: {
  user: User;
  showMap: boolean;
}) {
  return (
    <header className="sticky top-0 z-20 min-h-[var(--desktop-utility-bar-height,4.5rem)] backdrop-blur-xl">
      <div className="flex items-center gap-4 px-3 py-3 sm:px-4 lg:px-5 xl:px-6">
        <div className="min-w-0 flex-1">
          <div className="max-w-2xl">
            <CommandMenu user={user} showMap={showMap} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-xl border border-border/70 bg-card/80 shadow-sm">
            <NotificationCenter />
          </div>

          <div className="hidden md:block">
            <UserMenu user={user} onlyAvatar={true} />
          </div>
        </div>
      </div>
    </header>
  );
}
