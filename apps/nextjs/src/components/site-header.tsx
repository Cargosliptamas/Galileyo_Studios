"use client";

import type { User } from "~/auth/client";
import AuthNavbar from "./layout/auth-navbar";
import PublicNavbar from "./layout/public-navbar";

export function SiteHeader({
  user,
  showMap,
}: {
  user: User | undefined;
  showMap: boolean;
}) {
  return (
    <>
      {
        user ?
          <AuthNavbar user={user} showMap={showMap} /> :
          <PublicNavbar />
      }
    </>
  );
}
