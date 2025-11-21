import type { FeedItem } from "@galileyo/validators/feed";

export function mapFeedItem(item: FeedItem): FeedItem {
  const itemMap = { ...item };

  if (Array.isArray(item.reactions)) {
    itemMap.reactions = item.reactions.map((reaction) => ({
      id: String(reaction.id),
      cnt: Number(reaction.cnt),
      selected: reaction.selected,
    }));
  }

  return itemMap as FeedItem;
}
