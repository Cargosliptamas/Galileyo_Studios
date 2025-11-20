import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import {
  returnUnauthorizedError,
  returnValidationError,
  validate,
  validateUser,
} from "~/app/api/helper";
import { env } from "~/env";

const PostRequest = z.object({
  influencer_id: z.number().int(),
  text: z.string().max(512),
  url: z.url().optional(),
});

const PostResponse = z.object({
  id: z.number().int(),
});

/**
 * Create a new influencer post
 *
 * @description Create a new influencer post
 * @body PostRequest
 * @response PostResponse
 * @add 422:ValidationError
 * @auth bearer
 */
export const POST = async (req: NextRequest) => {
  const { valid, key } = await validateUser(req);

  if (!valid) {
    return returnUnauthorizedError();
  }

  const body = (await req.json()) as z.infer<typeof PostRequest>;
  const { result: payload, error } = await validate(PostRequest, body);

  if (error) {
    return returnValidationError(error);
  }

  const post = await fetch(
    `${env.NEXT_PUBLIC_API_URL}/public-feed/create-as-influencer`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  const postJson = (await post.json()) as {
    status: "success" | "error";
    data: {
      id: number;
    };
    error: {
      message: string;
      code: number;
    };
  };

  if (postJson.status !== "success") {
    return NextResponse.json(
      {
        code: "INTERNAL_SERVER_ERROR",
        error: postJson.error.message,
      },
      { status: 500 },
    );
  }

  const response = await PostResponse.parseAsync({
    id: postJson.data.id,
  });

  return NextResponse.json(response);
};
