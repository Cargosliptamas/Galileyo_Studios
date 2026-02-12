import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import {
  getQueryParams,
  returnUnauthorizedError,
  returnValidationError,
  validate,
  validateUser,
} from "~/app/api/helper";
import { env } from "~/env";

const QueryParamsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(100).optional(),
  offset: z.coerce.number().int().min(0).default(0).optional(),
});

// const ValidationError = z.object({
//   code: z.string(),
//   error: z.array(
//     z.object({
//       expected: z.string().describe("The expected type of the value"),
//       code: z.string().describe("The error code"),
//       path: z
//         .array(z.string())
//         .describe("The path of the value that caused the error"),
//       message: z.string().describe("The error message"),
//     }),
//   ),
// });

const InfluencersResponse = z.object({
  data: z.array(
    z.object({
      id: z.number().int(),
      name: z.string(),
      first_name: z.string(),
      last_name: z.string(),
    }),
  ),
  count: z.number().int(),
  page: z.number().int(),
  page_size: z.number().int(),
});

/**
 * Get influencers list
 *
 * @description Get a list of all influencer users in the system
 * @params QueryParamsSchema
 * @response InfluencersResponse
 * @add 422:ValidationError
 * @auth bearer
 */
export const GET = async (req: NextRequest) => {
  const { valid, key } = await validateUser(req);

  if (!valid) {
    return returnUnauthorizedError();
  }

  const query = getQueryParams(req);
  const { result, error } = await validate(QueryParamsSchema, query);

  if (error) {
    return returnValidationError(error);
  }

  const { limit, offset } = result;

  const influencers = await fetch(
    `${env.NEXT_PUBLIC_API_URL}/customer/list-influencers?page_size=${limit}&page=${offset}`,
    {
      headers: {
        Authorization: `Bearer ${key}`,
      },
    },
  );

  const influencersJson = (await influencers.json()) as {
    status: "success" | "error";
    error: string;
    data: {
      list: {
        id: number;
        name: string;
        first_name: string;
        last_name: string;
      }[];
      count: number;
      page: number;
      page_size: number;
    };
  };

  if (influencersJson.status !== "success") {
    return NextResponse.json({ error: influencersJson.error }, { status: 500 });
  }

  const response = await InfluencersResponse.parseAsync({
    count: +influencersJson.data.count,
    page: +influencersJson.data.page,
    page_size: +influencersJson.data.page_size,
    data: influencersJson.data.list.map((influencer) => ({
      id: influencer.id,
      name: influencer.name,
      first_name: influencer.first_name,
      last_name: influencer.last_name,
    })),
  });

  return NextResponse.json(response);
};
