import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod/v4";

import { env } from "~/env";
import { signViewerToken, STUDIOS_VIEWER_COOKIE } from "~/lib/studios/access";
import { getStripe } from "~/lib/studios/stripe";

export const runtime = "nodejs";

const BodySchema = z.object({
  sessionId: z.string().min(1).max(120),
});

/**
 * Sets the signed studios_viewer cookie after a verified purchase. Webhooks
 * cannot set cookies, so the thank-you page calls this once the Checkout
 * Session is confirmed paid. The email is read from Stripe, never trusted from
 * the client.
 */
export async function POST(req: Request) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

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

  let email: string | null = null;
  try {
    const session = await stripe.checkout.sessions.retrieve(
      parsed.data.sessionId,
    );
    const paid =
      session.payment_status === "paid" || session.status === "complete";
    if (!paid) {
      return NextResponse.json({ ok: false, paid: false });
    }
    email = session.customer_details?.email ?? session.customer_email ?? null;
  } catch (error) {
    console.error("[studios] Failed to retrieve checkout session:", error);
    return NextResponse.json({ error: "Lookup failed." }, { status: 502 });
  }

  if (!email) {
    return NextResponse.json({ ok: false, paid: true });
  }

  const token = signViewerToken({ email, iat: Date.now() });
  const cookieStore = await cookies();
  cookieStore.set(STUDIOS_VIEWER_COOKIE, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  return NextResponse.json({ ok: true, paid: true });
}
