"use client";

import type { QueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import {
  createTRPCClient,
  createWSClient,
  httpBatchStreamLink,
  httpLink,
  isNonJsonSerializable,
  loggerLink,
  splitLink,
  wsLink,
} from "@trpc/client";
import { createTRPCContext } from "@trpc/tanstack-react-query";
import SuperJSON from "superjson";

// import { createWSClient, wsLink } from "@trpc/client";

import type { AppRouter } from "@galileyo/api";

import { env } from "~/env";
import { createQueryClient } from "./query-client";

let clientQueryClientSingleton: QueryClient | undefined = undefined;
const getQueryClient = () => {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return createQueryClient();
  } else {
    // Browser: use singleton pattern to keep the same query client
    return (clientQueryClientSingleton ??= createQueryClient());
  }
};

export const { useTRPC, TRPCProvider } = createTRPCContext<AppRouter>();

const getWsUrl = () => {
  if (env.NEXT_PUBLIC_WS_FULL_URL) {
    return env.NEXT_PUBLIC_WS_FULL_URL;
  }

  if (typeof window !== "undefined") {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const host = window.location.hostname;
    const port = env.NEXT_PUBLIC_WS_PORT;
    return `${protocol}://${host}:${port}`;
  }

  const baseHost = env.VERCEL_URL ?? `localhost:${env.NEXT_PUBLIC_WS_PORT}`;
  const protocol = env.VERCEL_URL ? "wss" : "ws";

  return `${protocol}://${baseHost}`;
};

const wsClient = createWSClient({ url: getWsUrl() });

export function TRPCReactProvider(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        loggerLink({
          enabled: (op) =>
            env.NODE_ENV === "development" ||
            (op.direction === "down" && op.result instanceof Error),
        }),
        splitLink({
          condition: (op) => op.type === "subscription",
          true: wsLink({
            client: wsClient,
            transformer: SuperJSON,
          }),
          false: splitLink({
            condition: (op) => isNonJsonSerializable(op.input),
            true: httpLink({
              url: getBaseUrl() + "/api/trpc",
              transformer: {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                serialize: (data) => data,
                // response - convert the tRPC response before using it in client
                deserialize: SuperJSON.deserialize,
              },
              headers() {
                const headers = new Headers();
                headers.set("x-trpc-source", "nextjs-react");
                return headers;
              },
            }),
            false: httpBatchStreamLink({
              transformer: SuperJSON,
              url: getBaseUrl() + "/api/trpc",
              headers() {
                const headers = new Headers();
                headers.set("x-trpc-source", "nextjs-react");
                return headers;
              },
            }),
          }),
        }),
      ],
    }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {props.children}
      </TRPCProvider>
    </QueryClientProvider>
  );
}

const getBaseUrl = () => {
  if (typeof window !== "undefined") return window.location.origin;
  if (env.VERCEL_URL) return `https://${env.VERCEL_URL}`;
  // eslint-disable-next-line no-restricted-properties
  return `http://localhost:${process.env.PORT ?? 3000}`;
};
