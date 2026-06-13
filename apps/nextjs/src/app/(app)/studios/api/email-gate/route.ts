import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod/v4";

import { sql } from "@galileyo/db";
import { db } from "@galileyo/db/client";
import { studiosLead } from "@galileyo/db/schema";

import { env } from "~/env";
import { signUnlockToken, STUDIOS_UNLOCK_COOKIE } from "~/lib/studios/access";

export const runtime = "nodejs";

const BodySchema = z.object({
  email: z.string().email().max(320),
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
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  const { email, utmSource, utmMedium, utmCampaign } = parsed.data;

  // Persist the lead. This is the highest-priority asset, but it must never
  // block a viewer: if the write fails we log and still unlock the episode.
  try {
    await db
      .insert(studiosLead)
      .values({
        email,
        source: "email_gate",
        episodeSlug: "episode-1",
        utmSource,
        utmMedium,
        utmCampaign,
      })
      .onDuplicateKeyUpdate({ set: { email: sql`${studiosLead.email}` } });
  } catch (error) {
    console.error("[studios] Failed to persist email-gate lead:", error);
  }

  const token = signUnlockToken({
    email,
    episode: "episode-1",
    iat: Date.now(),
  });

  const cookieStore = await cookies();
  cookieStore.set(STUDIOS_UNLOCK_COOKIE, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  return NextResponse.json({ success: true });
}
