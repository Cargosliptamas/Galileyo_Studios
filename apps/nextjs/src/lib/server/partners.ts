"use server";

import { z } from "zod/v4";

import type { Partner } from "~/lib/server/types";
import { env } from "~/env";

const partnerSchema = z.object({
  id: z.coerce.number().int(),
  name: z.string(),
  image: z.string().nullable().optional(),
  description: z.string(),
  link: z.string(),
});

const partnerListResponseSchema = z.object({
  status: z.literal("success"),
  data: z.object({
    list: z.array(partnerSchema),
    count: z.coerce.number().int(),
    page: z.coerce.number().int(),
    page_size: z.coerce.number().int(),
  }),
});

interface GetPartnersParams {
  page?: number;
  pageSize?: number;
  revalidate?: number;
}

interface PartnerListResult {
  list: Partner[];
  count: number;
  page: number;
  pageSize: number;
}

const EMPTY_RESULT: PartnerListResult = {
  list: [],
  count: 0,
  page: 1,
  pageSize: 100,
};

export async function getPartners(
  params: GetPartnersParams = {},
): Promise<PartnerListResult> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.max(1, params.pageSize ?? 100);

  try {
    const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/partner/list`, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: JSON.stringify({
        page: page,
        page_size: pageSize,
      }),
    });

    if (!response.ok) {
      console.error("Failed to load partners");
      return { ...EMPTY_RESULT, page, pageSize };
    }

    const raw = (await response.json()) as unknown;
    const parsed = partnerListResponseSchema.safeParse(raw);

    if (!parsed.success) {
      console.error("Invalid partners response format");
      return { ...EMPTY_RESULT, page, pageSize };
    }

    return {
      list: parsed.data.data.list.map((partner) => ({
        id: partner.id,
        name: partner.name,
        image: partner.image ?? null,
        description: partner.description,
        link: partner.link,
      })),
      count: parsed.data.data.count,
      page: parsed.data.data.page,
      pageSize: parsed.data.data.page_size,
    };
  } catch (error) {
    console.error("Failed to fetch partners", error);
    return { ...EMPTY_RESULT, page, pageSize };
  }
}

export async function getFeaturedPartners(limit = 4): Promise<Partner[]> {
  const safeLimit = Math.max(1, limit);
  const result = await getPartners({
    page: 1,
    pageSize: safeLimit,
    revalidate: 300,
  });

  return result.list.slice(0, safeLimit);
}
