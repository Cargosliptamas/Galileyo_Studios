import type { FeedItem } from "@galileyo/api/schemas";

export function getUniqueId(item: FeedItem) {
  const idPart = item.id ?? crypto.randomUUID();
  const createdAtPart = item.created_at ?? "";

  return `${item.type}-${idPart}-${createdAtPart}`;
}
