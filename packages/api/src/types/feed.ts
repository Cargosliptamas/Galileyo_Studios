import { z } from "zod/v4";

export interface ReactionType {
  id: string;
  cnt: number;
  selected: boolean;
}

export interface FeedItemImageType {
  id: number;
  sizes: {
    type: "normal" | "origin" | "thumbnail";
    url: string;
    width: number;
    height: number;
    name: string;
  }[];
}

export interface BaseFeedItem {
  type: string;
  id: number | null;
  id_subscription: number | null;
  emergency_level: string | null;
  created_at: string | null;
  location: string | null;
  // TODO: remove this
  is_liked: boolean | null;
  is_bookmarked: boolean | null;
  is_subscribed: boolean | undefined;
  is_owner: boolean | undefined;
  show_reactions: boolean | undefined;
  show_comments: boolean | undefined;
  id_user: number | null;
}

export interface FollowerListItem extends BaseFeedItem {
  image: string | null;
  id_follower_list: number | null;
  title: string;
  body: string;
  url: string | null;
  reactions: ReactionType[];
  images: FeedItemImageType[];
  comment_quantity: number;
}

export interface NotSendedYetItem extends BaseFeedItem {
  title: string;
  subtitle: string;
  body: string;
  url: string | null;
  id_subscription: number | null;
  image: string | null;
  reactions: ReactionType[];
  images: FeedItemImageType[];
  comment_quantity: number;
}

export interface FinancialItem extends BaseFeedItem {
  title: string;
  body: string;
  percent: number;
  price: number;
  url: string | null;
  ticker?: string | null;
  id_subscription: number | null;
  reactions: ReactionType[];
  images: FeedItemImageType[];
  comment_quantity: number;
}

export interface FinancialItemBackend extends BaseFeedItem {
  title: string;
  body: string;
  percent: string;
  price: string;
  url: string | null;
  ticker: string | null;
  id_subscription: number | null;
  reactions: ReactionType[];
  images: FeedItemImageType[];
  comment_quantity: number;
}

export interface InfluencerItem extends BaseFeedItem {
  image: string | null;
  title: string;
  subtitle: string;
  body: string;
  url: string | null;
  id_subscription: number | null;
  reactions: ReactionType[];
  images: FeedItemImageType[];
  comment_quantity: number;
}

export type FeedItem =
  | NotSendedYetItem
  | FollowerListItem
  | FinancialItemBackend
  | InfluencerItem;

export interface Comment {
  id: number;
  id_user: number | null;
  message: string;
  created_at: string;
  user: {
    id: number;
    email: string;
    full_name: string;
    first_name: string;
    last_name: string;
    photo: string | null;
    country: string | null;
    state: string | null;
    zip: string | null;
    full_state: string | null;
    friend_status: string;
    about: string | null;
    is_phone_visible: boolean;
    is_address_visible: boolean;
    is_deleted: boolean;
  };
  replies: number;
  can_reply: boolean;
  id_parent: number | null;
  is_deleted: boolean;
}

export interface PrivateFeedType {
  id: number;
  title: string;
  description: string | null;
  image: string | null;
}

export interface InfluencerFeedType {
  id: number;
  title: string;
  description: string | null;
  public_code: string | null;
  image: string | null;
  alias: string | null;
  page_title: string | null;
  page_description: string | null;
  public_link: string;
}

export const GetLatestNewsParams = z.object({
  limit: z.number().optional().default(10),
  cursor: z.number().optional().default(1),
  onlyInfluencers: z.boolean().optional().default(false),
  type: z.enum(["subscriptions", "discover"]),
});

export const GetBySubscriptionParams = z.object({
  id: z.number(),
  type: z.enum(["subscription", "followerList"]),
  limit: z.number().optional().default(10),
  cursor: z.number().optional().default(1),
});

export type GetLatestNewsParamTypes = z.infer<typeof GetLatestNewsParams>;
export type GetBySubscriptionParamTypes = z.infer<
  typeof GetBySubscriptionParams
>;

export interface SubscribeableFeedItemType {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  checked: boolean;
  need_zip: boolean;
  subscribers: number;
  is_custom: boolean;
  can_change_checked: boolean;
  is_public: boolean;
  image: string | null;
  zip?: string | null;
}

export interface SubscribeableFeedChildType {
  id: string;
  title: string;
  is_customer_marketstack_indx: boolean;
  is_customer_marketstack_ticker: boolean;
  feeds?: SubscribeableFeedItemType[];
}

export type SubscribeableFeedType = Omit<
  SubscribeableFeedChildType,
  "feeds"
> & {
  childs?: SubscribeableFeedChildType[];
  feeds?: SubscribeableFeedItemType[];
};
