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

export const CommandMenuSearchInputSchema = z.object({
  query: z.string().min(2),
  limitPerGroup: z.number().min(1).max(12).default(8),
});

export const CommandMenuPersonSchema = SearchResultUserSchema.extend({
  route: z.string(),
});

export const CommandMenuPostSchema = z.object({
  id: z.number(),
  title: z.string(),
  bodyPreview: z.string(),
  createdAt: z.string().nullish().optional(),
  route: z.string(),
});

export const CommandMenuVideoSchema = z.object({
  id: z.number(),
  caption: z.string().nullish().optional(),
  thumbnailUrl: z.string().nullish().optional(),
  creatorName: z.string(),
  creatorImage: z.string().nullish().optional(),
  createdAt: z.string().nullish().optional(),
  route: z.string(),
});

export const CommandMenuGroupedResultsSchema = z.object({
  people: z.object({
    items: z.array(CommandMenuPersonSchema),
    total: z.number(),
  }),
  posts: z.object({
    items: z.array(CommandMenuPostSchema),
    total: z.number(),
  }),
  videos: z.object({
    items: z.array(CommandMenuVideoSchema),
    total: z.number(),
  }),
});

export const CommandMenuResultCategorySchema = z.enum([
  "people",
  "posts",
  "videos",
]);

export const CommandMenuResultsInputSchema = z.object({
  query: z.string().min(2),
  category: CommandMenuResultCategorySchema,
  limit: z.number().min(1).max(24).default(12),
  cursor: z.number().int().min(0).optional().default(0),
});

export const CommandMenuResultItemSchema = z.union([
  CommandMenuPersonSchema,
  CommandMenuPostSchema,
  CommandMenuVideoSchema,
]);

export const CommandMenuResultsResponseSchema = z.object({
  items: z.array(CommandMenuResultItemSchema),
  nextCursor: z.number().int().nullish().optional(),
  hasMore: z.boolean(),
  totalEstimate: z.number().int().nullish().optional(),
});

export type SearchResultUserType = z.infer<typeof SearchResultUserSchema>;
export type SearchResultType = z.infer<typeof SearchResultSchema>;
export type CommandMenuSearchInput = z.infer<
  typeof CommandMenuSearchInputSchema
>;
export type CommandMenuPersonType = z.infer<typeof CommandMenuPersonSchema>;
export type CommandMenuPostType = z.infer<typeof CommandMenuPostSchema>;
export type CommandMenuVideoType = z.infer<typeof CommandMenuVideoSchema>;
export type CommandMenuGroupedResultsType = z.infer<
  typeof CommandMenuGroupedResultsSchema
>;
export type CommandMenuResultCategoryType = z.infer<
  typeof CommandMenuResultCategorySchema
>;
export type CommandMenuResultsInput = z.infer<
  typeof CommandMenuResultsInputSchema
>;
export type CommandMenuResultItemType = z.infer<
  typeof CommandMenuResultItemSchema
>;
export type CommandMenuResultsResponseType = z.infer<
  typeof CommandMenuResultsResponseSchema
>;
