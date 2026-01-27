import { z } from "zod/v4";

export const FriendSchema = z.object({
  id: z.number(),
  full_name: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  email: z.string(),
  photo: z.string(),
  country: z.string(),
  state: z.string(),
  zip: z.string(),
  is_phone_visible: z.boolean(),
  is_address_visible: z.boolean(),
  is_deleted: z.boolean(),
});

export const FriendListSchema = z.object({
  search: z.string().nullish(),
  list: z.array(FriendSchema),
  count: z.number(),
  page: z.number(),
  page_size: z.number(),
});

export type FriendListType = z.infer<typeof FriendListSchema>;
