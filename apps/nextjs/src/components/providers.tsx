import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { ThemeProvider } from "@galileyo/ui/theme";

import { AbilityProvider } from "~/hooks/use-ability";
import { PlanSwitchProvider } from "~/hooks/use-plan-switch";
import { TRPCReactProvider } from "~/trpc/react";
import { CallProvider } from "./chat/call-provider";
import { ChatProvider } from "./chat/chat-provider";
import { PushNotificationProvider } from "./layout/push-notification-provider";

export function Providers({
  children,
  hasSession,
}: {
  children: React.ReactNode;
  hasSession: boolean;
}) {
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
          <AbilityProvider hasSession={hasSession}>
            <PlanSwitchProvider>
              <CallProvider>
                <ChatProvider>
                  <PushNotificationProvider>
                    {children}
                  </PushNotificationProvider>
                </ChatProvider>
              </CallProvider>
            </PlanSwitchProvider>
          </AbilityProvider>
        </NuqsAdapter>
      </TRPCReactProvider>
    </ThemeProvider>
  );
}
