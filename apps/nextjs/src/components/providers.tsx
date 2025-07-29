import { NuqsAdapter } from "nuqs/adapters/next/app";

import { ThemeProvider } from "@galileyo/ui/theme";

import { TRPCReactProvider } from "~/trpc/react";
import { PushNotificationProvider } from "./layout/push-notification-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey="galileyo-theme"
      disableTransitionOnChange
      enableColorScheme
    >
      <TRPCReactProvider>
        <NuqsAdapter>
          <PushNotificationProvider>{children}</PushNotificationProvider>
        </NuqsAdapter>
      </TRPCReactProvider>
    </ThemeProvider>
  );
}
