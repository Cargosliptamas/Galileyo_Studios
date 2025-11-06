import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { ThemeProvider } from "@galileyo/ui/theme";

import { TRPCReactProvider } from "~/trpc/react";
import { CallProvider } from "./chat/call-provider";
import { ChatProvider } from "./chat/chat-provider";
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
        <ReactQueryDevtools buttonPosition="bottom-left" />
        <NuqsAdapter>
          <CallProvider>
            <ChatProvider>
              <PushNotificationProvider>{children}</PushNotificationProvider>
            </ChatProvider>
          </CallProvider>
        </NuqsAdapter>
      </TRPCReactProvider>
    </ThemeProvider>
  );
}
