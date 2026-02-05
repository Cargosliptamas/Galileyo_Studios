import crypto from "node:crypto";
import { isAfter } from "date-fns";

import type { Job, JobConfig } from "@galileyo/queue";
import { eq } from "@galileyo/db";
import { db } from "@galileyo/db/client";
import { scrapedArticles } from "@galileyo/db/schema";

import type { Influencer } from "../influencers.js";
import { env } from "../env.js";
import { logger } from "../logger.js";

const MAX_ARTICLES = 10;
const ONLY_AFTER_DATE = new Date("2025-12-20");

type ProcessInfluencerJob = Job<Influencer>;

interface ZyteArticle {
  url?: string;
  headline?: string;
  articleBody?: string;
  datePublished?: string;
  inLanguage?: string;
  metadata: {
    probability: number;
  };
}

type ZyteArticleWithUrl = Omit<ZyteArticle, "url"> & { url: string };

interface ZyteRawResponse<T = undefined> {
  httpResponseBody: string;
  articleList?: {
    articles?: ZyteArticle[];
  };
  customAttributes?: T extends undefined
    ? never
    : {
        values: Partial<T>;
        metadata: {
          inputTokens: number;
          outputTokens: number;
          textInputTokens: number;
          maxInputTokens: number;
          excludedPIIAttributes: string[];
        };
      };
}

function generateArticleId(article: ZyteArticleWithUrl) {
  return crypto.createHash("sha256").update(article.url).digest("hex");
}

async function processInfluencer(job: ProcessInfluencerJob) {
  logger.info("Processing influencer");
  logger.info(job);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const body: Record<string, any> = {
    url: job.urls[0],
  };

  if (job.config?.useBrowser) {
    body.browserHtml = true;
    body.articleList = true;
    body.articleListOptions = { extractFrom: "browserHtml" };
  } else {
    body.httpResponseBody = true;
    body.articleList = true;
    body.articleListOptions = { extractFrom: "httpResponseBody" };
    body.followRedirect = true;
  }

  const response = await fetch("https://api.zyte.com/v1/extract", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${env.ZYTE_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    logger.error(
      `Failed to fetch the URL for influencer ${job.id}: ${response.statusText}`,
    );
    logger.error(await response.text());
    return;
  }

  const data = (await response.json()) as ZyteRawResponse;
  // const { httpResponseBody, ...rest } = data;

  // return {
  //   httpResponseBody: Buffer.from(httpResponseBody, "base64"),
  //   ...rest,
  // };
  const articles = data.articleList?.articles ?? [];

  let processedArticles = 0;

  for (const article of articles) {
    if (article.metadata.probability < 0.5) {
      continue;
    }

    if (!article.url) {
      continue;
    }

    if (job.skipUrls?.some((skipUrl) => article.url === skipUrl)) {
      continue;
    }

    try {
      if (
        article.datePublished &&
        !isAfter(article.datePublished, ONLY_AFTER_DATE)
      ) {
        continue;
      }
    } catch (error) {
      logger.error(error);
      continue;
    }

    const articleId = generateArticleId(article as ZyteArticleWithUrl);

    const existingArticle = await db.query.scrapedArticles.findFirst({
      where: eq(scrapedArticles.hash, articleId),
    });

    if (existingArticle) {
      continue;
    }

    const response = await fetch(
      `${env.NEXT_PUBLIC_API_URL}/public-feed/create-as-influencer`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.INFLUENCER_IMPERSONATION_API_KEY}`,
        },
        body: JSON.stringify({
          influencer_id: job.id,
          text: `${article.headline ?? ""} \n\n ${article.articleBody ?? ""}`,
          url: article.url,
        }),
      },
    );

    if (!response.ok) {
      logger.error(
        `Failed to scrape the article ${article.url}: ${response.statusText}`,
      );
      logger.error(await response.text());
      continue;
    }

    await db.insert(scrapedArticles).values({
      hash: articleId,
      url: article.url,
      headline: article.headline ?? "",
      articleBody: article.articleBody ?? "",
    });

    processedArticles++;

    if (processedArticles >= MAX_ARTICLES) {
      break;
    }
  }
}

export default {
  options: {
    // scheduleTime: "*/10 * * * *",
    // startup: true,
  },
  process: processInfluencer,
} satisfies JobConfig<ProcessInfluencerJob>;
