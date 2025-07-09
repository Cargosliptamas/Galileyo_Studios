"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "~/trpc/react";

export function Debug() {
  const trpc = useTRPC();
  const { data: posts } = useSuspenseQuery(trpc.post.all.queryOptions());

  return <pre>{JSON.stringify(posts, null, 2)}</pre>;
}