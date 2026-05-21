import { NextResponse } from "next/server";
import { z } from "zod/v4";

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

  // TODO(phase3): persist via tRPC studiosRouter.submitSponsorInquiry into the
  // Bolt Database (studios_inquiry table) and forward to email transport.
  console.log("[studios] Sponsor inquiry:", parsed.data);

  return NextResponse.json({ success: true });
}
