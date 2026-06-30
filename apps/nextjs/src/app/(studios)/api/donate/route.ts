import { NextResponse } from "next/server";
import { z } from "zod/v4";

import { sql } from "@galileyo/db";
import { db } from "@galileyo/db/client";
import { studiosLead } from "@galileyo/db/schema";

export const runtime = "nodejs";

// Phase 1 stub: capture the intent and email now, swap in Stripe Checkout in
// Phase 2. Amount is in whole dollars, validated min $1 max $50,000.
const BodySchema = z.object({
  email: z.string().email().max(320),
  amount: z.number().int().min(1).max(50000),
  utmSource: z.string().max(120).optional(),
  utmMedium: z.string().max(120).optional(),
  utmCampaign: z.string().max(120).optional(),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please enter a valid email and amount." },
      { status: 400 },
    );
  }

  const { email, utmSource, utmMedium, utmCampaign } = parsed.data;

  try {
    await db
      .insert(studiosLead)
      .values({
        email,
        source: "donation",
        utmSource,
        utmMedium,
        utmCampaign,
      })
      .onDuplicateKeyUpdate({ set: { email: sql`${studiosLead.email}` } });
  } catch (error) {
    console.error("[studios] Failed to persist donation lead:", error);
    return NextResponse.json(
      { error: "Something went wrong on our end. Please try again." },
      { status: 500 },
    );
  }

  // Phase 2 returns a real Stripe Checkout session URL here.
  return NextResponse.json({ checkoutUrl: null });
}
