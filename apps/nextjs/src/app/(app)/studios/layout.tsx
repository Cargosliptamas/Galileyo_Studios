import type { Metadata } from "next";

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

export default function StudiosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="studios-theme font-editorial -mx-3 -my-3 flex min-h-svh flex-col bg-[rgb(var(--studios-bg))] text-[rgb(var(--studios-text))] sm:-mx-4 lg:-mx-5 xl:-mx-6">
      <StudiosNav />
      <main className="flex-1">{children}</main>
      <StudiosFooter />
    </div>
  );
}
