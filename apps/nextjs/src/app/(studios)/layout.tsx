import type { Metadata } from "next";

import { StudiosFooter } from "~/components/studios/studios-footer";
import { StudiosNav } from "~/components/studios/studios-nav";
import { StudiosPartnershipCta } from "~/components/studios/studios-partnership-cta";
import { env } from "~/env/client";

const DEFAULT_DESCRIPTION =
  "Original short-form films from the front lines of the new resistance. Watch Episode 1 free, made with AI.";
const DEFAULT_SHARE_IMAGE = "/galileyo_new_logo.png";

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_API_URL),
  title: {
    template: "%s | Galileyo Studios",
    default: "Galileyo Studios",
  },
  description: DEFAULT_DESCRIPTION,
  openGraph: {
    title: "Galileyo Studios",
    description: DEFAULT_DESCRIPTION,
    siteName: "Galileyo Studios",
    type: "website",
    url: "/",
    images: [{ url: DEFAULT_SHARE_IMAGE }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Galileyo Studios",
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_SHARE_IMAGE],
  },
};

export default function StudiosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="studios-theme font-editorial flex min-h-svh w-full max-w-full flex-col overflow-x-clip bg-[rgb(var(--studios-bg))] text-[rgb(var(--studios-text))]">
      <StudiosNav />
      <main className="w-full flex-1 overflow-x-clip">{children}</main>
      <StudiosPartnershipCta />
      <StudiosFooter />
    </div>
  );
}
