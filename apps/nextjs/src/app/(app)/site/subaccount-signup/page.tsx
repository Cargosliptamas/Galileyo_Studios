import { redirect } from "next/navigation";

import { getSession } from "~/auth/server";
import SubaccountSignupPage from "~/components/members/subaccount-signup-page";
import { HydrateClient } from "~/trpc/server";

export default async function SubaccountSignupPageRoute({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getSession();
  const { mk } = await searchParams;

  // If already logged in, redirect to dashboard
  if (session) {
    return redirect("/dashboard");
  }

  // If no member key, redirect to pricing
  if (!mk || typeof mk !== "string") {
    return redirect("/pricing");
  }

  return (
    <HydrateClient>
      <SubaccountSignupPage memberKey={mk} />
    </HydrateClient>
  );
}
