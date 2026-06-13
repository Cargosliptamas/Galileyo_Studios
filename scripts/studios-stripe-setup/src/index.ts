import Stripe from "stripe";

import { sql } from "@galileyo/db";
import { db } from "@galileyo/db/client";
import { promocode, studiosSetting } from "@galileyo/db/schema";

/**
 * Idempotent Stripe setup for Galileyo Studios.
 *
 * Run with:
 *   pnpm -F @galileyo/studios-stripe-setup start
 *
 * Creates (or reuses) products, prices, and promotion codes keyed by
 * metadata.studiosKey, writes the resulting price IDs into the studios_setting
 * table, and mirrors the promo codes into the existing promocode table for
 * reporting. Safe to run repeatedly: nothing is duplicated.
 *
 * Runtime app code reads price IDs from studios_setting only, never from env
 * and never hardcoded.
 */

const secretKey = process.env.STRIPE_SECRET_KEY;
if (!secretKey) {
  console.error(
    "[studios-stripe-setup] STRIPE_SECRET_KEY is not set. Add it to the root .env and re-run.",
  );
  process.exit(1);
}

const stripe = new Stripe(secretKey);

interface ProductDef {
  key: string;
  name: string;
  amountCents: number;
  recurring: boolean;
}

const PRODUCTS: ProductDef[] = [
  {
    key: "episode_unlock",
    name: "Galileyo Studios Episode Unlock",
    amountCents: 700,
    recurring: false,
  },
  {
    key: "bronze_annual",
    name: "Galileyo Studios Bronze (Annual)",
    amountCents: 2400,
    recurring: true,
  },
  {
    key: "ad_free",
    name: "Galileyo Studios Ad-Free",
    amountCents: 799,
    recurring: false,
  },
  {
    key: "producer_associate",
    name: "Galileyo Studios Associate Producer",
    amountCents: 5000,
    recurring: false,
  },
  {
    key: "producer_contributing",
    name: "Galileyo Studios Contributing Producer",
    amountCents: 20000,
    recurring: false,
  },
  {
    key: "producer_game",
    name: "Galileyo Studios Game Producer",
    amountCents: 10000,
    recurring: false,
  },
];

async function findProductByKey(key: string): Promise<Stripe.Product | null> {
  const result = await stripe.products.search({
    query: `metadata['studiosKey']:'${key}'`,
  });
  return result.data[0] ?? null;
}

async function ensureProduct(def: ProductDef): Promise<Stripe.Product> {
  const existing = await findProductByKey(def.key);
  if (existing) return existing;
  return stripe.products.create({
    name: def.name,
    metadata: { studiosKey: def.key },
  });
}

async function ensurePrice(
  product: Stripe.Product,
  def: ProductDef,
): Promise<Stripe.Price> {
  const prices = await stripe.prices.list({
    product: product.id,
    active: true,
  });
  const match = prices.data.find(
    (price) =>
      price.unit_amount === def.amountCents &&
      price.currency === "usd" &&
      Boolean(price.recurring) === def.recurring,
  );
  if (match) return match;

  return stripe.prices.create({
    product: product.id,
    currency: "usd",
    unit_amount: def.amountCents,
    ...(def.recurring ? { recurring: { interval: "year" } } : {}),
    metadata: { studiosKey: def.key },
  });
}

async function setSetting(key: string, value: string): Promise<void> {
  await db
    .insert(studiosSetting)
    .values({ key, value })
    .onDuplicateKeyUpdate({
      set: { value, updatedAt: sql`CURRENT_TIMESTAMP` },
    });
}

async function ensureEpisodeCoupon(
  episodeProductId: string,
): Promise<Stripe.Coupon> {
  // DEFAULT, PENDING BRETT MILLER CONFIRMATION:
  // 100% off, restricted to the episode unlock product. Confirm or change the
  // discount and scope before going live. If this changes, update the coupon
  // here and re-run; the deterministic id keeps it idempotent.
  const couponId = "studios_100_off_episode";
  try {
    return await stripe.coupons.retrieve(couponId);
  } catch {
    return stripe.coupons.create({
      id: couponId,
      percent_off: 100,
      duration: "once",
      applies_to: { products: [episodeProductId] },
      metadata: { studiosKey: "promo_100_off_episode" },
    });
  }
}

async function ensurePromotionCode(
  code: string,
  couponId: string,
): Promise<Stripe.PromotionCode> {
  const existing = await stripe.promotionCodes.list({ code });
  const found = existing.data[0];
  if (found) return found;
  // NOTE: "one redemption per customer" is the stated default. Stripe promotion
  // codes do not enforce strict per-customer single use on their own; the
  // checkout route attaches a customer so redemptions can be reconciled.
  const params: Stripe.PromotionCodeCreateParams = {
    code,
    promotion: { type: "coupon", coupon: couponId },
    metadata: { studiosKey: `promo_${code}` },
  };
  return stripe.promotionCodes.create(params);
}

function nowSql(): string {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

async function mirrorPromocode(code: string): Promise<void> {
  // Mirror into the existing promocode table for reporting only. type 0 is a
  // neutral default; discount stored as percent. Idempotent on the unique text.
  await db
    .insert(promocode)
    .values({
      type: 0,
      text: code,
      discount: 100,
      isActive: 1,
      activeFrom: nowSql(),
      activeTo: "2099-12-31 23:59:59",
      showOnFrontend: 0,
      description: "Galileyo Studios launch promo (mirrored from Stripe)",
    })
    .onDuplicateKeyUpdate({ set: { text: sql`${promocode.text}` } });
}

async function main(): Promise<void> {
  let episodeProductId = "";

  for (const def of PRODUCTS) {
    const product = await ensureProduct(def);
    const price = await ensurePrice(product, def);
    await setSetting(`price.${def.key}`, price.id);
    if (def.key === "episode_unlock") episodeProductId = product.id;
    console.log(`[studios-stripe-setup] ${def.key}: ${price.id}`);
  }

  if (!episodeProductId) {
    throw new Error("episode_unlock product was not created");
  }

  const coupon = await ensureEpisodeCoupon(episodeProductId);
  for (const code of ["300DAYS", "BIVVY"]) {
    const promo = await ensurePromotionCode(code, coupon.id);
    await mirrorPromocode(code);
    console.log(`[studios-stripe-setup] promo ${code}: ${promo.id}`);
  }

  console.log(
    "[studios-stripe-setup] done. Price IDs written to studios_setting.",
  );
}

main()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error("[studios-stripe-setup] failed:", error);
    process.exit(1);
  });
