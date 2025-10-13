import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { z } from "zod/v4";

import type { Article, FetchedArticle } from "../types/scraping";
// import { desc, eq } from "@galileyo/db";
// import { CreatePostSchema, Post } from "@galileyo/db/schema";

import {
  protectedProcedure,
  // publicProcedure
} from "../trpc";

const JS_FETCH_URLS: string[] = [];

async function getArticleList(
  url: string,
  isRequiredJSFetch: boolean,
): Promise<FetchedArticle[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const body: Record<string, any> = {
    url,
    articleList: true,
    geolocation: "DE",
  };

  if (isRequiredJSFetch) {
    body.javascript = true;
    body.browserHtml = true;
    body.articleListOptions = { extractFrom: "browserHtml" };
  } else {
    body.httpResponseBody = true;
    body.articleListOptions = { extractFrom: "httpResponseBody" };
    body.followRedirect = true;
  }

  const request = await fetch("https://api.zyte.com/v1/extract", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${process.env.ZYTE_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  const response = (await request.json()) as {
    articleList?: {
      articles?: Article[];
      url: string;
    };
  };

  return (
    response.articleList?.articles?.map((article) => ({
      ...article,
      id: nanoid(),
    })) ?? []
  );
}

async function getArticleContent(
  id: string,
  url: string,
  isRequiredJSFetch: boolean,
): Promise<FetchedArticle | undefined> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const body: Record<string, any> = {
    url,
    article: true,
    geolocation: "DE",
  };

  if (isRequiredJSFetch) {
    body.javascript = true;
    body.browserHtml = true;
    body.articleOptions = { extractFrom: "browserHtml" };
  } else {
    body.httpResponseBody = true;
    body.articleOptions = { extractFrom: "httpResponseBody" };
    body.followRedirect = true;
  }

  const request = await fetch("https://api.zyte.com/v1/extract", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${process.env.ZYTE_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  const response = (await request.json()) as {
    article?: Article;
  };

  return response.article ? { ...response.article, id } : undefined;
}

export const scraperRouter = {
  scrape: protectedProcedure
    .input(
      z.object({
        url: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const isSocialMedia =
        input.url.includes("twitter.com") ||
        input.url.includes("x.com") ||
        input.url.includes("instagram.com") ||
        input.url.includes("facebook.com") ||
        input.url.includes("linkedin.com");

      const isRequiredJSFetch =
        isSocialMedia || JS_FETCH_URLS.some((url) => input.url.includes(url));

      let articles = await getArticleList(input.url, isRequiredJSFetch);

      if (articles.length === 0) {
        // retry 3 times
        for (let i = 0; i < 3; i++) {
          articles = await getArticleList(input.url, isRequiredJSFetch);
          if (articles.length > 0) {
            break;
          }
        }

        if (articles.length === 0) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to scrape the URL",
          });
        }
      }

      const lastArticles = articles
        .filter((item) => item.headline)
        .slice(0, 10);

      if (lastArticles.length === 0) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to scrape the URL",
        });
      }

      const lastArticleContents: FetchedArticle[] = [];

      for (const article of lastArticles) {
        if (isSocialMedia) {
          lastArticleContents.push(article);
        } else {
          const articleContent = await getArticleContent(
            article.id,
            article.url,
            isRequiredJSFetch,
          );
          if (!articleContent) {
            continue;
          }
          lastArticleContents.push(articleContent);
        }
      }

      return lastArticleContents;
    }),
} satisfies TRPCRouterRecord;
