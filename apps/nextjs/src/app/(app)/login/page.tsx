import { redirect } from "next/navigation";

import { getSession } from "~/auth/server";
import { LoginForm } from "~/components/auth/login-form";

function normalizeCallbackURL(callbackURL?: string): string {
  if (!callbackURL) {
    return "/dashboard";
  }

  if (!callbackURL.startsWith("/") || callbackURL.startsWith("//")) {
    return "/dashboard";
  }

  return callbackURL;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackURL?: string }>;
}) {
  const { callbackURL } = await searchParams;
  const normalizedCallbackURL = normalizeCallbackURL(callbackURL);
  const session = await getSession();

  if (session) {
    redirect(normalizedCallbackURL);
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm callbackURL={normalizedCallbackURL} />
      </div>
    </div>
  );
}
