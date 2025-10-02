import { z } from "zod/v4";

import type { FeedItem } from "./feed";

export const BookmarkSchema = z.object({
  id: z.number(),
  created_at: z.string(),
  updated_at: z.string().nullish(),
  post_id: z.number(),
  post: z.custom<FeedItem>(),
});

export type BookmarkType = z.infer<typeof BookmarkSchema>;

export const BookmarkListSchema = z.object({
  list: z.array(BookmarkSchema),
  count: z.number(),
  page: z.number(),
  page_size: z.number(),
});

export type BookmarkListType = z.infer<typeof BookmarkListSchema>;

export const BookmarkListWithOptionalPostSchema = BookmarkListSchema.extend({
  list: z.array(
    BookmarkSchema.extend({
      post: z.custom<FeedItem>().optional(),
    }),
  ),
});

export type BookmarkListTypeWithOptionalPost = z.infer<
  typeof BookmarkListWithOptionalPostSchema
>;

export const CreateBookmarkSchema = z.object({
  post_id: z.number(),
});

export type CreateBookmarkType = z.infer<typeof CreateBookmarkSchema>;
