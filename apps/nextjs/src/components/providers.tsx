import { ThemeProvider } from "@galileyo/ui/theme";

import { TRPCReactProvider } from "~/trpc/react";

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
      <TRPCReactProvider>{children}</TRPCReactProvider>
    </ThemeProvider>
  );
}