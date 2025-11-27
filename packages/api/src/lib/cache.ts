import { createCache } from "@galileyo/utils";

type CacheType = ReturnType<typeof createCache>;

let cache: CacheType | null = null;

export function getCache() {
  cache ??= createCache();

  return cache;
}
