import type Stripe from "stripe";
import { NextResponse } from "next/server";
import { z } from "zod/v4";

import type { StudiosProductKey } from "~/lib/studios/stripe";
import { env } from "~/env";
import { getPriceId, getStripe } from "~/lib/studios/stripe";

export const runtime = "nodejs";

const KindSchema = z.enum([
  "episode",
  "bronze",
  "ad_free",
  "producer_associate",
  "producer_contributing",
  "producer_game",
  "donation",
]);

const BodySchema = z.object({
  kind: KindSchema,
  episodeSlug: z.string().max(80).optional(),
  amountCents: z.number().int().min(100).max(5_000_000).optional(),
  email: z.string().email().max(320).optional(),
  cancelPath: z.string().max(200).optional(),
  utmSource: z.string().max(120).optional(),
  utmMedium: z.string().max(120).optional(),
  utmCampaign: z.string().max(120).optional(),
});

type Kind = z.infer<typeof KindSchema>;

// Maps a checkout kind to the product key whose price id lives in settings.
const KIND_TO_PRODUCT: Record<Exclude<Kind, "donation">, StudiosProductKey> = {
  episode: "episode_unlock",
  bronze: "bronze_annual",
  ad_free: "ad_free",
  producer_associate: "producer_associate",
  producer_contributing: "producer_contributing",
  producer_game: "producer_game",
};

// Simple in-memory per-IP rate limit. Resets on redeploy; enough to blunt abuse
// of session creation without adding infrastructure.
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;
const hits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE_LIMIT;
}

function notConfigured() {
  return NextResponse.json(
    { error: "Payments are not configured yet." },
    { status: 503 },
  );
}

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const stripe = getStripe();
  if (!stripe) return notConfigured();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { kind, episodeSlug, amountCents, email, cancelPath } = parsed.data;
  const base = env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
  const cancelUrl = `${base}${cancelPath?.startsWith("/") ? cancelPath : "/studios"}`;
  const mode: Stripe.Checkout.SessionCreateParams.Mode =
    kind === "bronze" ? "subscription" : "payment";

  let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[];
  if (kind === "donation") {
    if (!amountCents) {
      return NextResponse.json(
        { error: "A donation amount is required." },
        { status: 400 },
      );
    }
    lineItems = [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: amountCents,
          product_data: { name: "Galileyo Studios Donation" },
        },
      },
    ];
  } else {
    const priceId = await getPriceId(KIND_TO_PRODUCT[kind]);
    if (!priceId) return notConfigured();
    lineItems = [{ price: priceId, quantity: 1 }];
  }

  const metadata: Record<string, string> = { studiosKind: kind };
  if (episodeSlug) metadata.episodeSlug = episodeSlug;
  if (parsed.data.utmSource) metadata.utmSource = parsed.data.utmSource;
  if (parsed.data.utmMedium) metadata.utmMedium = parsed.data.utmMedium;
  if (parsed.data.utmCampaign) metadata.utmCampaign = parsed.data.utmCampaign;

  try {
    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: lineItems,
      allow_promotion_codes: true,
      success_url: `${base}/studios/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      ...(email ? { customer_email: email } : {}),
      metadata,
    });
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[studios] Failed to create checkout session:", error);
    return NextResponse.json(
      { error: "Could not start checkout. Please try again." },
      { status: 500 },
    );
  }
}
