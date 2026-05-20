import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod/v4";

import { signUnlockToken, STUDIOS_UNLOCK_COOKIE } from "~/lib/studios/access";

export const runtime = "nodejs";

const BodySchema = z.object({
  email: z.string().email().max(320),
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

  const { email } = parsed.data;

  const token = signUnlockToken({
    email,
    episode: "episode-1",
    iat: Date.now(),
  });

  const cookieStore = await cookies();
  cookieStore.set(STUDIOS_UNLOCK_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  return NextResponse.json({ success: true });
}
