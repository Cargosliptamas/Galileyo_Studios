import { NextResponse } from "next/server";

import { and, count, eq, gt, isNull, or, sql, sum } from "@galileyo/db";
import { db } from "@galileyo/db/client";
import {
  studiosEntitlement,
  studiosLead,
  studiosProducerCredit,
} from "@galileyo/db/schema";

import { verifyApiKey } from "~/lib/studios/solvent-auth";

export const runtime = "nodejs";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

interface Params {
  resource: string;
}

function nowDatetime(): string {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

function parseQuery(url: string) {
  const { searchParams } = new URL(url);
  const limit = Math.min(
    parseInt(searchParams.get("limit") ?? String(DEFAULT_LIMIT), 10),
    MAX_LIMIT,
  );
  const cursor = searchParams.get("cursor") ?? null;
  const email = searchParams.get("email") ?? null;
  return { limit: isNaN(limit) ? DEFAULT_LIMIT : limit, cursor, email };
}

async function getLeads(limit: number, cursor: string | null, email: string | null) {
  const cursorId = cursor ? parseInt(cursor, 10) : null;
  const rows = await db
    .select({
      id: studiosLead.id,
      email: studiosLead.email,
      name: studiosLead.name,
      source: studiosLead.source,
      episodeSlug: studiosLead.episodeSlug,
      utmSource: studiosLead.utmSource,
      createdAt: studiosLead.createdAt,
    })
    .from(studiosLead)
    .where(
      and(
        cursorId ? gt(studiosLead.id, cursorId) : undefined,
        email ? eq(studiosLead.email, email) : undefined,
      ),
    )
    .orderBy(studiosLead.id)
    .limit(limit + 1);

  const hasMore = rows.length > limit;
  const data = hasMore ? rows.slice(0, limit) : rows;
  return {
    data,
    nextCursor: hasMore ? String(data[data.length - 1]?.id) : null,
  };
}

async function getSubscribers(limit: number, cursor: string | null, email: string | null) {
  const cursorId = cursor ? parseInt(cursor, 10) : null;
  const now = nowDatetime();
  const rows = await db
    .select({
      id: studiosEntitlement.id,
      email: studiosEntitlement.email,
      stripeSessionId: studiosEntitlement.stripeSessionId,
      amountCents: studiosEntitlement.amountCents,
      expiresAt: studiosEntitlement.expiresAt,
      promoCode: studiosEntitlement.promoCode,
      createdAt: studiosEntitlement.createdAt,
    })
    .from(studiosEntitlement)
    .where(
      and(
        eq(studiosEntitlement.kind, "bronze"),
        or(isNull(studiosEntitlement.expiresAt), gt(studiosEntitlement.expiresAt, now)),
        cursorId ? gt(studiosEntitlement.id, cursorId) : undefined,
        email ? eq(studiosEntitlement.email, email) : undefined,
      ),
    )
    .orderBy(studiosEntitlement.id)
    .limit(limit + 1);

  const hasMore = rows.length > limit;
  const data = hasMore ? rows.slice(0, limit) : rows;
  return {
    data,
    nextCursor: hasMore ? String(data[data.length - 1]?.id) : null,
  };
}

async function getProducers(limit: number, cursor: string | null, email: string | null) {
  const cursorId = cursor ? parseInt(cursor, 10) : null;
  const rows = await db
    .select({
      id: studiosProducerCredit.id,
      email: studiosProducerCredit.email,
      displayName: studiosProducerCredit.displayName,
      tier: studiosProducerCredit.tier,
      amountCents: studiosProducerCredit.amountCents,
      createdAt: studiosProducerCredit.createdAt,
    })
    .from(studiosProducerCredit)
    .where(
      and(
        cursorId ? gt(studiosProducerCredit.id, cursorId) : undefined,
        email ? eq(studiosProducerCredit.email, email) : undefined,
      ),
    )
    .orderBy(studiosProducerCredit.id)
    .limit(limit + 1);

  const hasMore = rows.length > limit;
  const data = hasMore ? rows.slice(0, limit) : rows;
  return {
    data,
    nextCursor: hasMore ? String(data[data.length - 1]?.id) : null,
  };
}

async function getAccessGrants(limit: number, cursor: string | null, email: string | null) {
  const cursorId = cursor ? parseInt(cursor, 10) : null;
  const rows = await db
    .select()
    .from(studiosEntitlement)
    .where(
      and(
        cursorId ? gt(studiosEntitlement.id, cursorId) : undefined,
        email ? eq(studiosEntitlement.email, email) : undefined,
      ),
    )
    .orderBy(studiosEntitlement.id)
    .limit(limit + 1);

  const hasMore = rows.length > limit;
  const data = hasMore ? rows.slice(0, limit) : rows;
  return {
    data,
    nextCursor: hasMore ? String(data[data.length - 1]?.id) : null,
  };
}

async function getStats() {
  const now = nowDatetime();

  const [[leadRow], [subscriberRow], [producerRow], [revenueRow]] = await Promise.all([
    db.select({ total: count() }).from(studiosLead),
    db
      .select({ total: count() })
      .from(studiosEntitlement)
      .where(
        and(
          eq(studiosEntitlement.kind, "bronze"),
          or(isNull(studiosEntitlement.expiresAt), gt(studiosEntitlement.expiresAt, now)),
        ),
      ),
    db.select({ total: count() }).from(studiosProducerCredit),
    db
      .select({ total: sum(studiosEntitlement.amountCents) })
      .from(studiosEntitlement)
      .where(sql`${studiosEntitlement.amountCents} IS NOT NULL`),
  ]);

  return {
    total_leads: leadRow?.total ?? 0,
    active_subscribers: subscriberRow?.total ?? 0,
    total_producers: producerRow?.total ?? 0,
    total_revenue_cents: Number(revenueRow?.total ?? 0),
  };
}

export async function GET(
  req: Request,
  { params }: { params: Promise<Params> },
) {
  const auth = verifyApiKey(req);
  if (auth === "unconfigured") {
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }
  if (auth === "denied") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { resource } = await params;
  const { limit, cursor, email } = parseQuery(req.url);

  try {
    switch (resource) {
      case "leads":
        return NextResponse.json(await getLeads(limit, cursor, email));
      case "subscribers":
        return NextResponse.json(await getSubscribers(limit, cursor, email));
      case "producers":
        return NextResponse.json(await getProducers(limit, cursor, email));
      case "access-grants":
        return NextResponse.json(await getAccessGrants(limit, cursor, email));
      case "stats":
        return NextResponse.json(await getStats());
      default:
        return NextResponse.json({ error: "Unknown resource." }, { status: 404 });
    }
  } catch (error) {
    console.error(`[solvent-api] Error on resource "${resource}":`, error);
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}
