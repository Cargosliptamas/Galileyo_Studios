import type { Metadata, Viewport } from "next";

import { cn } from "@galileyo/ui";
import { Toaster } from "@galileyo/ui/toast";

import { Providers } from "~/components/providers";

import "~/app/globals.css";

import { env } from "~/env";
import { fontVariables } from "~/lib/fonts";

// import { ThemeToggle } from "@galileyo/ui/theme";

export const metadata: Metadata = {
  metadataBase: new URL(
    env.VERCEL_ENV === "production"
      ? "https://turbo.t3.gg"
      : "http://localhost:3000",
  ),
  title: "Galileyo",
  // description: "Simple monorepo with shared backend for web & mobile apps",
  // openGraph: {
  //   title: "Create T3 Turbo",
  //   description: "Simple monorepo with shared backend for web & mobile apps",
  //   url: "https://create-t3-turbo.vercel.app",
  //   siteName: "Create T3 Turbo",
  // },
  // twitter: {
  //   card: "summary_large_image",
  //   site: "@jullerino",
  //   creator: "@jullerino",
  // },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans text-foreground antialiased [--footer-height:calc(var(--spacing)*14)] [--header-height:calc(var(--spacing)*14)] xl:[--footer-height:calc(var(--spacing)*24)]",
          fontVariables,
        )}
      >
        <Providers>{props.children}</Providers>
        {/* <div className="sticky bottom-0 right-4 z-50">
          <ThemeToggle />
        </div> */}
        <Toaster />
      </body>
    </html>
  );
}
