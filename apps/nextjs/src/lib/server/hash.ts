"use server";

import type { XXHashAPI } from "xxhash-wasm";
import xxhash from "xxhash-wasm";

let hasher: XXHashAPI | null = null;

async function getHasher() {
  return hasher ?? (hasher = await xxhash());
}

export async function xxh64(input: string) {
  const hasherInstance = await getHasher();
  return hasherInstance.h64(input);
}
