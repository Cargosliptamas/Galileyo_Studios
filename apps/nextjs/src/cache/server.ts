import "server-only";

import { cache } from "react";
import { BentoCache, bentostore } from "bentocache";
import { memoryDriver } from "bentocache/drivers/memory";
import { redisBusDriver, redisDriver } from "bentocache/drivers/redis";
import Redis from "ioredis";

import { env } from "~/env";

export const bento = cache(() => {
  // const connection = new Redis(env.REDIS_URL);

  let defaultStore = bentostore().useL1Layer(memoryDriver({ maxSize: "10mb" }));

  if (env.REDIS_URL && env.REDIS_URL !== "") {
    const connection = new Redis(env.REDIS_URL);

    defaultStore = defaultStore
      .useL2Layer(
        redisDriver({
          connection,
        }),
      )
      .useBus(
        redisBusDriver({
          connection: {
            host: connection.options.host,
            port: connection.options.port,
            password: connection.options.password,
            username: connection.options.username,
            db: connection.options.db,
          },
        }),
      );
  }

  const bento = new BentoCache({
    default: "cache",

    stores: {
      cache: defaultStore,
    },
  });

  return bento;
});
