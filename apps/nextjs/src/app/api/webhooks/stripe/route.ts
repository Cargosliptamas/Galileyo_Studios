import type Stripe from "stripe";
import { NextResponse } from "next/server";

import { and, eq, sql } from "@galileyo/db";
import { db } from "@galileyo/db/client";
import {
  studiosEntitlement,
  studiosLead,
  studiosProducerCredit,
} from "@galileyo/db/schema";

import { env } from "~/env";
import { getStripe } from "~/lib/studios/stripe";
import posthogServer from "~/posthog/server";

export const runtime = "nodejs";

function datetime(date: Date): string {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

function oneYearFromNow(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return datetime(d);
}

function isProducerKind(kind: string): boolean {
  return kind.startsWith("producer_");
}

async function resolvePromoCode(
  stripe: Stripe,
  session: Stripe.Checkout.Session,
): Promise<string | null> {
  const discount = session.discounts?.[0];
  const promo = discount?.promotion_code;
  if (!promo) return null;
  if (typeof promo !== "string") return promo.code;
  try {
    const resolved = await stripe.promotionCodes.retrieve(promo);
    return resolved.code;
  } catch {
    return null;
  }
}

async function handleCheckoutCompleted(
  stripe: Stripe,
  session: Stripe.Checkout.Session,
): Promise<void> {
  const kind = session.metadata?.studiosKind ?? "donation";
  const episodeSlug = session.metadata?.episodeSlug ?? null;
  const email =
    session.customer_details?.email ?? session.customer_email ?? null;
  const amountCents = session.amount_total;
  const promoCode = await resolvePromoCode(stripe, session);

  if (!email) {
    console.warn("[studios] checkout.session.completed without an email");
    return;
  }

  const expiresAt = kind === "bronze" ? oneYearFromNow() : null;

  // Idempotent on the unique stripe_session_id: a replayed event is a no-op.
  await db
    .insert(studiosEntitlement)
    .values({
      email,
      kind,
      episodeSlug,
      stripeSessionId: session.id,
      amountCents,
      promoCode,
      expiresAt,
    })
    .onDuplicateKeyUpdate({
      set: { stripeSessionId: sql`${studiosEntitlement.stripeSessionId}` },
    });

  await db
    .insert(studiosLead)
    .values({
      email,
      source: kind === "donation" ? "donation" : "checkout",
      episodeSlug,
      promoCode,
      utmSource: session.metadata?.utmSource ?? null,
      utmMedium: session.metadata?.utmMedium ?? null,
      utmCampaign: session.metadata?.utmCampaign ?? null,
    })
    .onDuplicateKeyUpdate({ set: { email: sql`${studiosLead.email}` } });

  if (isProducerKind(kind)) {
    await db.insert(studiosProducerCredit).values({
      email,
      tier: kind,
      amountCents,
    });
  }

  const ph = posthogServer();
  if (ph) {
    ph.capture({
      distinctId: email,
      event: "studios_checkout_completed",
      properties: { kind, amountCents },
    });
    await ph.shutdown();
  }
}

async function handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
  const email = invoice.customer_email;
  if (!email) return;
  // Extend bronze access one year on each successful renewal.
  await db
    .update(studiosEntitlement)
    .set({ expiresAt: oneYearFromNow() })
    .where(
      and(
        eq(studiosEntitlement.email, email),
        eq(studiosEntitlement.kind, "bronze"),
      ),
    );
}

export async function POST(req: Request) {
  const stripe = getStripe();
  if (!stripe || !env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    console.error("[studios] Stripe signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(stripe, event.data.object);
        break;
      case "invoice.paid":
        await handleInvoicePaid(event.data.object);
        break;
      case "checkout.session.async_payment_failed":
        console.warn(
          "[studios] async payment failed for session",
          event.data.object.id,
        );
        break;
      default:
        // Acknowledge unhandled events so Stripe does not retry them.
        break;
    }
  } catch (error) {
    // Never throw out of the webhook. Log and acknowledge so Stripe does not
    // hammer the endpoint; replays are safe because inserts are idempotent.
    console.error(`[studios] Error handling ${event.type}:`, error);
  }

  return NextResponse.json({ received: true });
}
