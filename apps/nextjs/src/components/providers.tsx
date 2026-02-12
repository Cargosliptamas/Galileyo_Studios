import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { ThemeProvider } from "@galileyo/ui/theme";

import { AbilityProvider } from "~/hooks/use-ability";
import { PlanSwitchProvider } from "~/hooks/use-plan-switch";
import { TRPCReactProvider } from "~/trpc/react";
import { AnalyticsProvider } from "./analytics-provider";
import { CallProvider } from "./chat/call-provider";
import { ChatProvider } from "./chat/chat-provider";
import { NativeBridgeProvider } from "./layout/native-app-bridge";
import { PushNotificationProvider } from "./layout/push-notification-provider";

export function Providers({
  children,
  userId,
  isTestAccount,
  isNativeUA,
}: {
  children: React.ReactNode;
  userId?: string | null;
  isTestAccount: boolean;
  isNativeUA: boolean;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      storageKey="galileyo-theme"
      disableTransitionOnChange
      enableColorScheme
    >
      <TRPCReactProvider>
        <ReactQueryDevtools buttonPosition="bottom-left" />

        <NuqsAdapter>
          <NativeBridgeProvider userId={userId} isNativeUA={isNativeUA}>
            <AbilityProvider hasSession={!!userId}>
              <PlanSwitchProvider isTestAccount={isTestAccount}>
                <CallProvider>
                  <ChatProvider>
                    <PushNotificationProvider>
                      <AnalyticsProvider>{children}</AnalyticsProvider>
                    </PushNotificationProvider>
                  </ChatProvider>
                </CallProvider>
              </PlanSwitchProvider>
            </AbilityProvider>
          </NativeBridgeProvider>
        </NuqsAdapter>
      </TRPCReactProvider>
    </ThemeProvider>
  );
}
