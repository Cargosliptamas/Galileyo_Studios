"use client";

import { usePathname } from "next/navigation";

import type { User } from "~/auth/client";
import AuthNavbar from "./layout/auth-navbar";
import PublicNavbar from "./layout/public-navbar";

const DISABLED_PATHS = ["/feature-showcase", "/studios"];

export function SiteHeader({
  user,
  showMap,
}: {
  user: User | undefined;
  showMap: boolean;
}) {
  const pathname = usePathname();
  const isDisabled = DISABLED_PATHS.some((path) => pathname.includes(path));

  if (isDisabled) {
    return null;
  }

  return (
    <>
      {user ? <AuthNavbar user={user} showMap={showMap} /> : <PublicNavbar />}
    </>
  );
}
