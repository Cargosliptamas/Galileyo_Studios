import { z } from "zod/v4";

import type { InfluencerFeedType, PrivateFeedType } from "./feed";

export const InfluencerFeedSchema = z.custom<InfluencerFeedType>();

export const InfluencerFeedListSchema = z.object({
  promocode: z.string(),
  has_promocode_service: z.boolean().default(false),
  affiliate_link: z.string(),
  sended_this_month: z.number(),
  sended_this_month_message: z.string(),
  list: z.array(InfluencerFeedSchema),
  count: z.number(),
  page: z.number(),
  page_size: z.number(),
});

export type InfluencerFeedListType = z.infer<typeof InfluencerFeedListSchema>;

export const CreateInfluencerFeedSchema = z.object({
  title: z.string().min(1).max(20),
  description: z.string().min(1).max(140),
  image: z.instanceof(File),
  alias: z.string().min(1).max(63),
  page_title: z.string().max(63).optional().nullable(),
  page_description: z.string().max(140).optional().nullable(),
});

export type CreateInfluencerFeedType = z.infer<
  typeof CreateInfluencerFeedSchema
>;

export const PrivateFeedSchema = z.custom<PrivateFeedType>();

export const PrivateFeedListSchema = z.object({
  list: z.array(PrivateFeedSchema),
  count: z.number(),
  page: z.number(),
  page_size: z.number(),
  private_feed_maximum: z.number(),
  private_feed_remainder: z.number(),
});

export type PrivateFeedListType = z.infer<typeof PrivateFeedListSchema>;

export const CreatePrivateFeedSchema = z.object({
  title: z.string().min(1).max(20),
  description: z.string().max(140).optional().nullable(),
  image: z.instanceof(File).optional().nullable(),
});

export type CreatePrivateFeedType = z.infer<typeof CreatePrivateFeedSchema>;
