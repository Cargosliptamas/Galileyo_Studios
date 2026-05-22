import type { Metadata } from "next";

import { cn } from "@galileyo/ui";

import { getSession } from "~/auth/server";
import { StudiosFooter } from "~/components/studios/studios-footer";
import { StudiosNav } from "~/components/studios/studios-nav";

export const metadata: Metadata = {
  title: {
    template: "%s | Galileyo Studios",
    default: "Galileyo Studios",
  },
  description:
    "Original short-form films from the front lines of the new resistance.",
};

export default async function StudiosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Authed users hit the (app) shell, which wraps children in
  // `px-3 py-3 sm:px-4 lg:px-5 xl:px-6`. Negative margins cancel that for a
  // full-bleed cinematic feel. Unauthed visitors hit PublicShell, which has
  // no padding to cancel, so the same negative margins push content past the
  // viewport and create horizontal scroll. Apply the bleed only when there
  // is parent padding to cancel.
  const session = await getSession();
  const bleed = session?.user ? "-mx-3 -my-3 sm:-mx-4 lg:-mx-5 xl:-mx-6" : "";

  return (
    <div
      className={cn(
        "studios-theme font-editorial flex min-h-svh w-full max-w-full flex-col overflow-x-clip bg-[rgb(var(--studios-bg))] text-[rgb(var(--studios-text))]",
        bleed,
      )}
    >
      <StudiosNav />
      <main className="w-full flex-1 overflow-x-clip">{children}</main>
      <StudiosFooter />
    </div>
  );
}
