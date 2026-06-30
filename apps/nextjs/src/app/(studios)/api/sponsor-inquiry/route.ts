import { NextResponse } from "next/server";
import { z } from "zod/v4";

import { sql } from "@galileyo/db";
import { db } from "@galileyo/db/client";
import { studiosLead, studiosSponsorInquiry } from "@galileyo/db/schema";
import { sendEmail } from "@galileyo/emails";

import { env } from "~/env";

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

interface SponsorInquiryNotification {
  interest: string;
  company?: string;
  contactName: string;
  email: string;
  phone?: string;
  budgetRange?: string;
  notes?: string;
}

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

  await sendSponsorInquiryNotification({
    interest: interestValue,
    company,
    contactName,
    email,
    phone,
    budgetRange,
    notes,
  });

  return NextResponse.json({ success: true });
}

async function sendSponsorInquiryNotification(
  inquiry: SponsorInquiryNotification,
) {
  const recipients = parseEmailList(env.STUDIOS_SPONSOR_INQUIRY_TO);

  if (recipients.length === 0 || !env.RESEND_API_KEY) {
    return;
  }

  try {
    await sendEmail({
      to: recipients,
      subject: `Galileyo Studios inquiry: ${inquiry.interest}`,
      html: renderSponsorInquiryEmail(inquiry),
      replyTo: inquiry.email,
      transport: "resend",
    });
  } catch (error) {
    console.error("[studios] Failed to send sponsor inquiry email:", error);
  }
}

function parseEmailList(value: string) {
  return value
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
}

function renderSponsorInquiryEmail(inquiry: SponsorInquiryNotification) {
  const rows: [string, string | undefined][] = [
    ["Interest", inquiry.interest],
    ["Company", inquiry.company],
    ["Contact", inquiry.contactName],
    ["Email", inquiry.email],
    ["Phone", inquiry.phone],
    ["Budget range", inquiry.budgetRange],
    ["Notes", inquiry.notes],
  ];

  const rowsHtml = rows
    .filter(([, value]) => value && value.trim().length > 0)
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-weight:600;color:#111827;vertical-align:top;">${escapeHtml(label)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#374151;vertical-align:top;">${formatEmailValue(value ?? "")}</td>
        </tr>`,
    )
    .join("");

  return `
    <div style="font-family:Arial,sans-serif;color:#111827;line-height:1.5;">
      <h1 style="font-size:20px;margin:0 0 16px;">New Galileyo Studios inquiry</h1>
      <table style="border-collapse:collapse;width:100%;max-width:640px;border:1px solid #e5e7eb;">
        <tbody>${rowsHtml}</tbody>
      </table>
    </div>`;
}

function formatEmailValue(value: string) {
  return escapeHtml(value).replace(/\n/g, "<br>");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
