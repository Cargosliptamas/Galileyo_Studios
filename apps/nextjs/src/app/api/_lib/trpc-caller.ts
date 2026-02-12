import { NextResponse } from "next/server";
import { TRPCError } from "@trpc/server";

import { appRouter, createTRPCContext } from "@galileyo/api";

import { auth } from "~/auth/server";

export async function createApiCaller(request: Request) {
  const headers = new Headers(request.headers);
  headers.set("x-trpc-source", "nextjs-api");

  const ctx = await createTRPCContext({
    headers,
    auth,
  });

  return appRouter.createCaller(ctx);
}

export function mapTRPCError(error: unknown): NextResponse | null {
  if (!(error instanceof TRPCError)) {
    return null;
  }

  switch (error.code) {
    case "UNAUTHORIZED":
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    case "FORBIDDEN":
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    case "NOT_FOUND":
      return NextResponse.json({ error: error.message }, { status: 404 });
    case "BAD_REQUEST":
      return NextResponse.json({ error: error.message }, { status: 400 });
    default:
      return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
