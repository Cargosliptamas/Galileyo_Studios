import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, isNull, like, or, sql } from "drizzle-orm";
import { z } from "zod/v4";

import type {
  CommandMenuGroupedResultsType,
  CommandMenuResultsResponseType,
  SearchResultType,
} from "@galileyo/validators/search";
import { db } from "@galileyo/db/client";
import { user, video } from "@galileyo/db/schema";
import {
  CommandMenuResultsInputSchema,
  CommandMenuSearchInputSchema,
} from "@galileyo/validators/search";

import { protectedProcedure } from "../trpc";

interface FeedSearchItem {
  id: number | null;
  title?: string | null;
  body?: string | null;
  created_at?: string | null;
}

interface FeedSearchResponse {
  status: "success" | "error";
  data?: {
    list?: FeedSearchItem[];
    count?: number;
    page?: number;
    page_size?: number;
  };
}

interface CommandMenuPostCandidate {
  id: number;
  title: string;
  bodyPreview: string;
  createdAt?: string | null;
  route: string;
}

interface CommandMenuVideoCandidate {
  id: number;
  caption?: string | null;
  thumbnailUrl?: string | null;
  creatorName: string;
  creatorImage?: string | null;
  createdAt?: string | null;
  route: string;
}

interface CommandMenuPersonCandidate {
  id: number;
  name: string;
  image?: string | null;
  address?: string | null;
  phone?: string | null;
  type: "user" | "influencer_page";
  route: string;
}

const normalizeText = (value: string | null | undefined): string =>
  value?.toLowerCase().trim() ?? "";

const stripHtml = (value: string): string =>
  value
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const toPreview = (
  value: string | null | undefined,
  maxLength = 120,
): string => {
  const normalized = stripHtml(value ?? "");
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength).trim()}...`;
};

const fuzzyIncludes = (query: string, text: string): boolean => {
  if (!query || !text) return false;
  let queryIndex = 0;
  for (const character of text) {
    if (character === query[queryIndex]) {
      queryIndex += 1;
      if (queryIndex === query.length) return true;
    }
  }
  return false;
};

const getRecencyBonus = (value: string | null | undefined): number => {
  if (!value) return 0;
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) return 0;

  const ageHours = (Date.now() - parsed) / (1000 * 60 * 60);
  if (ageHours <= 24) return 14;
  if (ageHours <= 24 * 7) return 9;
  if (ageHours <= 24 * 30) return 5;
  if (ageHours <= 24 * 90) return 2;

  return 0;
};

const scoreByText = (
  query: string,
  candidates: (string | null | undefined)[],
): number => {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return -1;

  let best = -1;

  for (const rawCandidate of candidates) {
    const candidate = normalizeText(rawCandidate);
    if (!candidate) continue;

    if (candidate.startsWith(normalizedQuery)) {
      best = Math.max(best, 120);
      continue;
    }

    const containsAt = candidate.indexOf(normalizedQuery);
    if (containsAt >= 0) {
      best = Math.max(best, 90 - Math.min(containsAt, 40) * 0.5);
      continue;
    }

    if (fuzzyIncludes(normalizedQuery, candidate)) {
      best = Math.max(best, 60);
    }
  }

  return best;
};

const rankItems = <T extends { id: number }>(
  items: T[],
  query: string,
  options: {
    textSelector: (item: T) => (string | null | undefined)[];
    dateSelector?: (item: T) => string | null | undefined;
  },
): T[] => {
  const rankedById = new Map<
    number,
    { item: T; score: number; date: number }
  >();

  for (const item of items) {
    const baseScore = scoreByText(query, options.textSelector(item));
    if (baseScore < 0) continue;

    const dateValue = options.dateSelector?.(item);
    const date = Date.parse(dateValue ?? "");
    const score = baseScore + getRecencyBonus(dateValue);

    const existing = rankedById.get(item.id);
    if (!existing || score > existing.score) {
      rankedById.set(item.id, {
        item,
        score,
        date: Number.isFinite(date) ? date : 0,
      });
    }
  }

  return [...rankedById.values()]
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.date - a.date;
    })
    .map((entry) => entry.item);
};

const rankAndSlice = <T extends { id: number }>(
  items: T[],
  query: string,
  options: {
    limit: number;
    textSelector: (item: T) => (string | null | undefined)[];
    dateSelector?: (item: T) => string | null | undefined;
  },
) => {
  const ranked = rankItems(items, query, {
    textSelector: options.textSelector,
    dateSelector: options.dateSelector,
  });

  return {
    total: ranked.length,
    items: ranked.slice(0, options.limit),
  };
};

const paginateRanked = <T>(items: T[], cursor: number, limit: number) => {
  const safeCursor = Math.max(0, cursor);
  const start = safeCursor;
  const end = safeCursor + limit;
  const hasMore = items.length > end;

  return {
    items: items.slice(start, end),
    hasMore,
    nextCursor: hasMore ? end : null,
    totalEstimate: items.length,
  };
};

const getAuthHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json" as const,
});

const fetchPeoplePage = async ({
  token,
  query,
  page,
  pageSize,
}: {
  token: string;
  query: string;
  page: number;
  pageSize: number;
}): Promise<{
  items: CommandMenuPersonCandidate[];
  total: number;
  page: number;
  pageSize: number;
}> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/search/with-influencer-pages`,
      {
        method: "POST",
        headers: getAuthHeaders(token),
        body: JSON.stringify({
          phrase: query,
          page,
          page_size: pageSize,
        }),
      },
    );

    const result = (await response.json()) as {
      status: "success" | "error";
      data?: SearchResultType;
    };

    if (result.status !== "success" || !result.data?.list) {
      return { items: [], total: 0, page, pageSize };
    }

    const people = result.data.list.map((entry) => ({
      ...entry,
      route:
        entry.type === "user"
          ? `/profile/${entry.id}`
          : `/profile/by-subscription/${entry.id}`,
    }));

    return {
      items: people,
      total: result.data.count,
      page,
      pageSize,
    };
  } catch {
    return { items: [], total: 0, page, pageSize };
  }
};

const fetchFeedPage = async ({
  token,
  endpoint,
  page,
  pageSize,
}: {
  token: string;
  endpoint: "/news/last" | "/news/by-discover";
  page: number;
  pageSize: number;
}): Promise<FeedSearchResponse["data"]> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`,
      {
        method: "POST",
        headers: getAuthHeaders(token),
        body: JSON.stringify({
          page,
          page_size: pageSize,
        }),
      },
    );

    const result = (await response.json()) as FeedSearchResponse;
    if (result.status !== "success") {
      return {
        list: [],
        count: 0,
        page,
        page_size: pageSize,
      };
    }

    return {
      list: result.data?.list ?? [],
      count: result.data?.count,
      page: result.data?.page ?? page,
      page_size: result.data?.page_size ?? pageSize,
    };
  } catch {
    return {
      list: [],
      count: 0,
      page,
      page_size: pageSize,
    };
  }
};

const mapFeedItemsToPostCandidates = (
  items: FeedSearchItem[],
): CommandMenuPostCandidate[] => {
  return items
    .filter((item): item is FeedSearchItem & { id: number } => {
      return Boolean(item.id && item.id > 0);
    })
    .map((item) => ({
      id: item.id,
      title: item.title?.trim() ?? "Untitled post",
      bodyPreview: toPreview(item.body),
      createdAt: item.created_at ?? null,
      route: `/dashboard/${item.id}`,
    }));
};

const fetchPostsPage = async ({
  token,
  page,
  pageSize,
}: {
  token: string;
  page: number;
  pageSize: number;
}) => {
  const [subscriptionsData, discoverData] = await Promise.all([
    fetchFeedPage({ token, endpoint: "/news/last", page, pageSize }),
    fetchFeedPage({ token, endpoint: "/news/by-discover", page, pageSize }),
  ]);

  const items = mapFeedItemsToPostCandidates([
    ...(subscriptionsData?.list ?? []),
    ...(discoverData?.list ?? []),
  ]);

  return {
    items,
    totalEstimate:
      (subscriptionsData?.count ?? 0) + (discoverData?.count ?? 0) || undefined,
  };
};

const fetchRankedPosts = async ({
  token,
  query,
  targetCount,
  maxPages,
  pageSize,
}: {
  token: string;
  query: string;
  targetCount: number;
  maxPages: number;
  pageSize: number;
}) => {
  const sourceItems: CommandMenuPostCandidate[] = [];

  for (let page = 1; page <= maxPages; page += 1) {
    const pageResult = await fetchPostsPage({
      token,
      page,
      pageSize,
    });

    if (pageResult.items.length === 0) {
      break;
    }

    sourceItems.push(...pageResult.items);

    const rankedCount = rankItems(sourceItems, query, {
      textSelector: (item) => [item.title, item.bodyPreview],
      dateSelector: (item) => item.createdAt,
    }).length;

    if (rankedCount >= targetCount) {
      break;
    }
  }

  return rankItems(sourceItems, query, {
    textSelector: (item) => [item.title, item.bodyPreview],
    dateSelector: (item) => item.createdAt,
  });
};

const fetchVideoCandidates = async ({
  query,
  limit,
}: {
  query: string;
  limit: number;
}): Promise<CommandMenuVideoCandidate[]> => {
  try {
    const likeQuery = `%${query}%`;

    const videos = await db
      .select({
        id: video.id,
        caption: video.caption,
        thumbnailUrl: video.thumbnailUrl,
        createdAt: video.createdAt,
        creatorName:
          sql<string>`TRIM(CONCAT(${user.firstName}, ' ', COALESCE(${user.lastName}, '')))`.as(
            "creatorName",
          ),
        creatorImage: user.image,
      })
      .from(video)
      .innerJoin(user, eq(video.idUser, user.id))
      .where(
        and(
          eq(video.transcodingStatus, "ready"),
          or(eq(video.publishStatus, "published"), isNull(video.publishStatus)),
          like(video.caption, likeQuery),
        ),
      )
      .orderBy(desc(video.createdAt))
      .limit(limit);

    return videos.map((entry) => ({
      id: entry.id,
      caption: entry.caption,
      thumbnailUrl: entry.thumbnailUrl,
      creatorName: entry.creatorName,
      creatorImage: entry.creatorImage,
      createdAt: entry.createdAt,
      route: `/videos/${entry.id}`,
    }));
  } catch {
    return [];
  }
};

export const searchRouter = {
  search: protectedProcedure
    .input(
      z.object({
        query: z.string().min(3),
        limit: z.number().optional().default(10),
        cursor: z.number().optional().default(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const feed = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/search/with-influencer-pages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ctx.session.session.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phrase: input.query,
            page: input.cursor,
            page_size: input.limit,
          }),
        },
      );

      const result = (await feed.json()) as {
        status: "success" | "error";
        data: SearchResultType;
      };

      if (result.status !== "success") {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }

      return result.data;
    }),
  commandMenu: protectedProcedure
    .input(CommandMenuSearchInputSchema)
    .query(async ({ ctx, input }) => {
      const query = input.query.trim();
      const pageSize = Math.max(input.limitPerGroup * 4, 24);

      const [peoplePage, rankedPosts, videoCandidates] = await Promise.all([
        fetchPeoplePage({
          token: ctx.session.session.token,
          query,
          page: 1,
          pageSize,
        }),
        fetchRankedPosts({
          token: ctx.session.session.token,
          query,
          targetCount: input.limitPerGroup + 1,
          maxPages: 2,
          pageSize,
        }),
        fetchVideoCandidates({
          query,
          limit: pageSize,
        }),
      ]);

      const rankedPeople = rankAndSlice(peoplePage.items, query, {
        limit: input.limitPerGroup,
        textSelector: (item) => [item.name, item.address, item.phone],
      });
      const rankedPostsSlice = {
        total: rankedPosts.length,
        items: rankedPosts.slice(0, input.limitPerGroup),
      };
      const rankedVideos = rankAndSlice(videoCandidates, query, {
        limit: input.limitPerGroup,
        textSelector: (item) => [item.caption, item.creatorName],
        dateSelector: (item) => item.createdAt,
      });

      const response: CommandMenuGroupedResultsType = {
        people: rankedPeople,
        posts: rankedPostsSlice,
        videos: rankedVideos,
      };

      return response;
    }),
  commandMenuResults: protectedProcedure
    .input(CommandMenuResultsInputSchema)
    .query(async ({ ctx, input }) => {
      const query = input.query.trim();
      const limit = input.limit;
      const cursor = input.cursor;

      switch (input.category) {
        case "people": {
          const pageCursor = Math.max(0, cursor);
          const apiPage = pageCursor + 1;
          const pageSize = Math.max(limit * 2, limit);

          const peoplePage = await fetchPeoplePage({
            token: ctx.session.session.token,
            query,
            page: apiPage,
            pageSize,
          });

          const ranked = rankItems(peoplePage.items, query, {
            textSelector: (item) => [item.name, item.address, item.phone],
          });

          const hasMore = apiPage * peoplePage.pageSize < peoplePage.total;

          const response: CommandMenuResultsResponseType = {
            items: ranked.slice(0, limit),
            hasMore,
            nextCursor: hasMore ? pageCursor + 1 : null,
            totalEstimate: peoplePage.total,
          };

          return response;
        }

        case "posts": {
          const offset = Math.max(0, cursor);
          const targetCount = offset + limit + 1;

          const rankedPosts = await fetchRankedPosts({
            token: ctx.session.session.token,
            query,
            targetCount,
            maxPages: 4,
            pageSize: Math.max(limit * 3, 24),
          });

          const paginated = paginateRanked(rankedPosts, offset, limit);
          const response: CommandMenuResultsResponseType = {
            items: paginated.items,
            hasMore: paginated.hasMore,
            nextCursor: paginated.nextCursor,
            totalEstimate: paginated.totalEstimate,
          };

          return response;
        }

        case "videos": {
          const offset = Math.max(0, cursor);
          const targetCount = offset + limit + 1;
          const candidateLimit = Math.min(Math.max(targetCount * 3, 30), 180);

          const videoCandidates = await fetchVideoCandidates({
            query,
            limit: candidateLimit,
          });

          const ranked = rankItems(videoCandidates, query, {
            textSelector: (item) => [item.caption, item.creatorName],
            dateSelector: (item) => item.createdAt,
          });

          const paginated = paginateRanked(ranked, offset, limit);
          const response: CommandMenuResultsResponseType = {
            items: paginated.items,
            hasMore: paginated.hasMore,
            nextCursor: paginated.nextCursor,
            totalEstimate: paginated.totalEstimate,
          };

          return response;
        }
      }
    }),
} satisfies TRPCRouterRecord;
