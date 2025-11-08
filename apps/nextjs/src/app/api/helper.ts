import type { NextRequest } from "next/server";
import type { z, ZodError } from "zod";
import { NextResponse } from "next/server";

import { eq } from "@galileyo/db";
import { db } from "@galileyo/db/client";
import { api_key } from "@galileyo/db/schema";

import { auth } from "~/auth/server";

export function getQueryParams(req: NextRequest) {
  const query = Object.fromEntries(req.nextUrl.searchParams);
  return query;
}

type ValidationResult<T extends z.ZodSchema> =
  | { result: z.infer<T>; error: null }
  | { result: null; error: ZodError };

export async function validate<T extends z.ZodSchema>(
  schema: T,
  data: unknown,
): Promise<ValidationResult<T>> {
  try {
    const result = await schema.parseAsync(data);
    return { result, error: null };
  } catch (err) {
    return { result: null, error: err as ZodError };
  }
}

export function returnValidationError(error: ZodError) {
  return NextResponse.json(
    {
      code: "UNPROCESSABLE_ENTITY",
      error: error.issues,
    },
    { status: 422 },
  );
}

export function returnUnauthorizedError() {
  return NextResponse.json(
    {
      code: "UNAUTHORIZED",
      error: "Unauthorized",
    },
    { status: 401 },
  );
}

type UserValidationResult =
  | { valid: true; key: string }
  | { valid: false; key: null };

export async function validateUser(
  req: NextRequest,
): Promise<UserValidationResult> {
  const key = req.headers.get("Authorization")?.split(" ")[1] ?? "";

  const { valid } = await auth.api.verifyApiKey({
    body: {
      key,
    },
  });

  if (!valid) {
    return { valid: false, key: null };
  }

  const session = await auth.api.getSession({
    headers: new Headers({
      "x-api-key": key,
    }),
  });

  if (!session) {
    return { valid: false, key: null };
  }

  const apiKey = await db.query.api_key.findFirst({
    where: eq(api_key.id, Number(session.session.id)),
  });

  if (!apiKey) {
    return { valid: false, key: null };
  }

  return { valid, key: apiKey.key };
}
