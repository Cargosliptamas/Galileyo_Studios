import { QueueModule } from "@galileyo/queue";

import { QUEUE_NAME, QUEUE_PREFIX } from "./constants.js";
import { env } from "./env.js";

function createWorker() {
  const queue = new QueueModule({
    enabled: true,
    startWorker: true,
    redisOptions: {
      name: QUEUE_NAME,
      prefix: QUEUE_PREFIX,
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      username: env.REDIS_USERNAME,
      password: env.REDIS_PASSWORD,
    },
  });

  return queue;
}

const globalForWorker = globalThis as unknown as {
  worker: ReturnType<typeof createWorker> | undefined;
};

export const worker = globalForWorker.worker ?? createWorker();

if (env.NODE_ENV !== "production") globalForWorker.worker = worker;
