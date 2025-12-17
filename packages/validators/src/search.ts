import { z } from "zod/v4";

export const SearchResultUserSchema = z.object({
  id: z.number(),
  name: z.string(),
  image: z.string().nullish().optional(),
  address: z.string().nullish().optional(),
  phone: z.string().nullish().optional(),
  type: z.enum(["user", "influencer_page"]),
});

export const SearchResultSchema = z.object({
  list: z.array(SearchResultUserSchema),
  count: z.number(),
});

export type SearchResultUserType = z.infer<typeof SearchResultUserSchema>;
export type SearchResultType = z.infer<typeof SearchResultSchema>;
