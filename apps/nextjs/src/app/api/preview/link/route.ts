import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import type { LinkPreviewData } from "~/lib/types/preview";
import { returnValidationError, validate } from "~/app/api/helper";
import { auth } from "~/auth/server";
import { bento } from "~/cache/server";
import { env } from "~/env";
import { xxh64 } from "~/lib/server/hash";

export const maxDuration = 20;

const LinkPreviewRequest = z.object({
  url: z.url(),
});

export const POST = async (req: NextRequest) => {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as z.infer<typeof LinkPreviewRequest>;
  const { result: payload, error } = await validate(LinkPreviewRequest, body);

  if (error) {
    return returnValidationError(error);
  }

  const hash = await xxh64(payload.url);
  const key = `preview:link:${hash}`;

  let previewData: LinkPreviewData | null = null;

  try {
    const result = await bento().getOrSet({
      key,
      factory: async () => {
        const response = await fetch(`${env.PREVIEW_SERVER_URL}/link`, {
          method: "POST",
          body: JSON.stringify({ url: payload.url }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = (await response.json()) as LinkPreviewData;

        return data;
      },
      ttl: "1h",
      grace: "5h",
      graceBackoff: "5m",
    });

    previewData = result;
  } catch (error) {
    console.error(error);
  }

  return NextResponse.json(previewData);
};
