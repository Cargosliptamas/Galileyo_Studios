import { and, eq, inArray, isNotNull } from "drizzle-orm";

import type { FeedItem, FeedItemVideoType } from "@galileyo/validators/feed";
import { db } from "@galileyo/db/client";
import { video } from "@galileyo/db/schema";

export function mapFeedItem(item: FeedItem): FeedItem {
  const itemMap = { ...item };

  if (Array.isArray(item.reactions)) {
    itemMap.reactions = item.reactions.map((reaction) => ({
      id: String(reaction.id),
      cnt: Number(reaction.cnt),
      selected: reaction.selected,
    }));
  }

  if (item.original_post) {
    itemMap.original_post = mapFeedItem(item.original_post);
  }

  return itemMap as FeedItem;
}

/**
 * Enriches a list of feed items with linked video data.
 * Looks up videos where video.idSmsPool matches the feed item ID.
 */
export async function enrichFeedItemsWithVideos(
  items: FeedItem[],
): Promise<FeedItem[]> {
  // Collect all feed item IDs (sms_pool IDs), including embedded original posts.
  const feedItemIdsSet = new Set<number>();
  const collectFeedIds = (item: FeedItem) => {
    if (item.id !== null) {
      feedItemIdsSet.add(item.id);
    }

    if (item.original_post) {
      collectFeedIds(item.original_post);
    }
  };

  items.forEach(collectFeedIds);
  const feedItemIds = [...feedItemIdsSet];

  if (feedItemIds.length === 0) return items;

  // Query videos linked to these feed items via idSmsPool
  const linkedVideos = await db
    .select({
      id: video.id,
      idSmsPool: video.idSmsPool,
      thumbnailUrl: video.thumbnailUrl,
      playbackId: video.playbackId,
      duration: video.duration,
      aspectRatio: video.aspectRatio,
      s3Url: video.s3Url,
    })
    .from(video)
    .where(
      and(
        inArray(video.idSmsPool, feedItemIds),
        isNotNull(video.idSmsPool),
        eq(video.publishStatus, "published"),
      ),
    );

  // Build a map from smsPoolId -> video data
  const videoByPoolId = new Map<number, FeedItemVideoType>();
  for (const v of linkedVideos) {
    if (v.idSmsPool !== null) {
      videoByPoolId.set(v.idSmsPool, {
        id: v.id,
        thumbnailUrl: v.thumbnailUrl ?? null,
        playbackId: v.playbackId ?? null,
        duration: v.duration ?? null,
        aspectRatio: v.aspectRatio ?? null,
        s3Url: v.s3Url ?? null,
      });
    }
  }

  const enrichItemWithVideo = (item: FeedItem): FeedItem => {
    const itemMap = { ...item };

    if (item.id !== null && videoByPoolId.has(item.id) && "video" in itemMap) {
      (
        itemMap as FeedItem & {
          video?: FeedItemVideoType | null;
        }
      ).video =
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        videoByPoolId.get(item.id)!;
    }

    if (item.original_post) {
      itemMap.original_post = enrichItemWithVideo(item.original_post);
    }

    return itemMap;
  };

  return items.map(enrichItemWithVideo);
}
