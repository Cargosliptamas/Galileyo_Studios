// import { createServer } from "node:http";
import { applyWSSHandler } from "@trpc/server/adapters/ws";
import { WebSocketServer } from "ws";

import { appRouter, createTRPCContext } from "@galileyo/api";

import { auth } from "~/auth/server";
import { env } from "~/env";

const port = Number(env.NEXT_PUBLIC_WS_PORT);

function main() {
  // const server = createServer();
  const wss = new WebSocketServer({
    // server,
    port,
  });

  const handler = applyWSSHandler({
    wss,
    router: appRouter,
    createContext: async (opts) => {
      return createTRPCContext({
        headers: opts.req.headers as unknown as Headers,
        auth,
        // getSession: () => getSession(),
      });
    },
  });

  // server.listen(port);

  console.log(`tRPC WebSocket server listening on ws://localhost:${port}`);

  process.on("SIGTERM", () => {
    handler.broadcastReconnectNotification();
    wss.close();
    // server.close();
  });
}

main();
