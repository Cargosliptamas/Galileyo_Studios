import { redirect } from "next/navigation";

function buildAuthUrl(request: Request): string {
  const requestUrl = new URL(request.url);
  const authUrl = new URL("/api/auth/sign-in/super-login", requestUrl.origin);

  requestUrl.searchParams.forEach((value, key) => {
    authUrl.searchParams.append(key, value);
  });

  return authUrl.toString();
}

export function GET(request: Request) {
  return redirect(buildAuthUrl(request));
}
