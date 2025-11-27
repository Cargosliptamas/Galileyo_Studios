import { BentoCache, bentostore } from "bentocache";
import { memoryDriver } from "bentocache/drivers/memory";
import { redisBusDriver, redisDriver } from "bentocache/drivers/redis";
import Redis from "ioredis";

export function createCache() {
  let defaultStore = bentostore().useL1Layer(memoryDriver({ maxSize: "10mb" }));

  if (process.env.REDIS_URL && process.env.REDIS_URL !== "") {
    const connection = new Redis(process.env.REDIS_URL);

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
}
