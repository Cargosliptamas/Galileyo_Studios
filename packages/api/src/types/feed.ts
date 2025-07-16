export interface FeedItemImageType {
  id: number;
  sizes: {
    type: "normal" | "origin" | "thumbnail";
    url: string;
    width: number;
    height: number;
    name: string;
  }[];
};

export interface BaseFeedItem {
  type: string;
  id: number | null;
  emergency_level: string | null;
  created_at: string | null;
  location: string | null;
  is_liked: boolean | null;
  is_bookmarked: boolean | null;
};

export interface FollowerListItem extends BaseFeedItem {
  image: string | null;
  id_follower_list: number | null;
  title: string;
  body: string;
  url: string | null;
  reactions: unknown[];
  images: FeedItemImageType[];
  comment_quantity: number;
};

export interface NotSendedYetItem extends BaseFeedItem {
  title: string;
  subtitle: string;
  body: string;
  url: string | null;
  id_subscription: number | null;
  image: string | null;
  reactions: unknown[];
  images: FeedItemImageType[];
  comment_quantity: number;
};

export interface FinancialItem extends BaseFeedItem {
  title: string;
  body: string;
  percent: string;
  price: string;
  url: string | null;
  id_subscription: number | null;
  reactions: unknown[];
  images: FeedItemImageType[];
  comment_quantity: number;
};

export interface InfluencerItem extends BaseFeedItem {
  image: string | null;
  title: string;
  subtitle: string;
  body: string;
  url: string | null;
  id_subscription: number | null;
  reactions: unknown[];
  images: FeedItemImageType[];
  comment_quantity: number;
};

export type FeedItem = NotSendedYetItem | FollowerListItem | FinancialItem | InfluencerItem;
