import "server-only";

import Stripe from "stripe";

import { eq, sql } from "@galileyo/db";
import { db } from "@galileyo/db/client";
import { studiosSetting } from "@galileyo/db/schema";

import { env } from "~/env/server";

/**
 * Studios Stripe runtime helpers.
 *
 * Price IDs are NEVER hardcoded or read from env. They are created by
 * scripts/studios-stripe-setup and read here from the studios_setting table.
 * If a price id is missing, the checkout route returns a clean 503 rather than
 * creating a broken session.
 */

export const STUDIOS_PRODUCT_KEYS = [
  "episode_unlock",
  "bronze_annual",
  "ad_free",
  "producer_associate",
  "producer_contributing",
  "producer_game",
] as const;

export type StudiosProductKey = (typeof STUDIOS_PRODUCT_KEYS)[number];

let cachedClient: Stripe | null = null;

/**
 * Returns a lazily-initialized Stripe client, or null when no secret key is
 * configured so callers can degrade gracefully.
 */
export function getStripe(): Stripe | null {
  if (!env.STRIPE_SECRET_KEY) return null;
  cachedClient ??= new Stripe(env.STRIPE_SECRET_KEY);
  return cachedClient;
}

export function isStripeConfigured(): boolean {
  return Boolean(env.STRIPE_SECRET_KEY);
}

export async function getStudiosSetting(key: string): Promise<string | null> {
  const [row] = await db
    .select()
    .from(studiosSetting)
    .where(eq(studiosSetting.key, key))
    .limit(1);
  return row?.value ?? null;
}

export async function setStudiosSetting(
  key: string,
  value: string,
): Promise<void> {
  await db
    .insert(studiosSetting)
    .values({ key, value })
    .onDuplicateKeyUpdate({
      set: { value, updatedAt: sql`CURRENT_TIMESTAMP` },
    });
}

/**
 * Reads the Stripe price id for a product key from settings. Returns null when
 * the setup script has not been run, so checkout can return a clean 503.
 */
export function getPriceId(key: StudiosProductKey): Promise<string | null> {
  return getStudiosSetting(`price.${key}`);
}
