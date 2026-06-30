import { NextResponse } from "next/server";
import { z } from "zod/v4";

import { sql } from "@galileyo/db";
import { db } from "@galileyo/db/client";
import { studiosLead, studiosSponsorInquiry } from "@galileyo/db/schema";

export const runtime = "nodejs";

const InterestSchema = z.enum([
  "sponsor",
  "executive-producer",
  "affiliate",
  "product-placement",
  "end-card",
  "banner",
  "podcast",
]);

const BodySchema = z.object({
  interest: z.union([InterestSchema, z.array(InterestSchema).min(1)]),
  company: z.string().max(200).optional(),
  contactName: z.string().min(1).max(200),
  email: z.string().email().max(320),
  phone: z.string().max(50).optional(),
  budgetRange: z.string().max(50).optional(),
  notes: z.string().max(4000).optional(),
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
      { error: "Please double-check the form and try again." },
      { status: 400 },
    );
  }

  const { interest, company, contactName, email, phone, budgetRange, notes } =
    parsed.data;

  // Normalize the single-or-array interest field to a comma-joined string.
  const interestValue = (Array.isArray(interest) ? interest : [interest]).join(
    ",",
  );

  try {
    await db.insert(studiosSponsorInquiry).values({
      interest: interestValue,
      company,
      contactName,
      email,
      phone,
      budgetRange,
      notes,
    });

    await db
      .insert(studiosLead)
      .values({ email, source: "sponsor_inquiry" })
      .onDuplicateKeyUpdate({ set: { email: sql`${studiosLead.email}` } });
  } catch (error) {
    console.error("[studios] Failed to persist sponsor inquiry:", error);
    return NextResponse.json(
      { error: "Something went wrong on our end. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
