"use client";

import { useQuery, useSuspenseQuery } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/react";

export function Debug() {
  const trpc = useTRPC();
  const { data: posts } = useSuspenseQuery(trpc.post.all.queryOptions());

  const { data: profile } = useQuery(trpc.profile.getProfile.queryOptions());

  return (
    <div>
      <pre>{JSON.stringify(profile, null, 2)}</pre>
      <pre>{JSON.stringify(posts, null, 2)}</pre>
    </div>
  );
}
