import type { Metadata, Viewport } from "next";

import { cn } from "@galileyo/ui";
import { Toaster } from "@galileyo/ui/toast";

import { Providers } from "~/components/providers";

import "~/app/globals.css";

import { getSession } from "~/auth/server";
import { env } from "~/env";
import { fontVariables } from "~/lib/fonts";
import { isNativeUserAgent } from "~/lib/server/headers";

// import { ThemeToggle } from "@galileyo/ui/theme";

export const metadata: Metadata = {
  metadataBase: new URL(
    env.VERCEL_ENV === "production"
      ? "https://galileyo.com"
      : "http://localhost:3000",
  ),
  title: "Galileyo | Speak Freely — Unleash Your Voice",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Galileyo | Speak Freely — Unleash Your Voice",
  },
  formatDetection: {
    telephone: false,
  },
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

export default async function RootLayout(props: { children: React.ReactNode }) {
  const isNativeUA = await isNativeUserAgent();

  const session = await getSession();
  const isTestAccount =
    session?.user.email.trim().toLowerCase() === "test@galileyo.com";

  return (
    <html lang="en" suppressHydrationWarning>
      <meta name="apple-mobile-web-app-title" content="Galileyo" />
      <body
        className={cn(
          "min-h-screen bg-background font-sans text-foreground antialiased [--footer-height:calc(var(--spacing)*14)] [--header-height:calc(var(--spacing)*14)] dark:bg-slate-900 xl:[--footer-height:calc(var(--spacing)*24)]",
          fontVariables,
        )}
      >
        <Providers
          userId={session?.user.id ?? null}
          isNativeUA={isNativeUA}
          isTestAccount={isTestAccount}
        >
          {props.children}
        </Providers>

        <Toaster />
      </body>
    </html>
  );
}
