import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getSession } from "~/auth/server";
import { env } from "~/env";

export async function GET(request: Request) {
  const session = await getSession();
  if (session) {
    redirect("/");
  }

  const { searchParams } = new URL(request.url);
  const affiliateToken = searchParams.get("a");

  const cookieStore = await cookies();
  if (affiliateToken) {
    cookieStore.set("affiliate_token", affiliateToken, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 10, // 10 days
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
    });
  }

  return redirect("/");
}
