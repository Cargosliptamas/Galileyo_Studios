"use client";

import Link from "next/link";
import { RiVerifiedBadgeFill } from "@remixicon/react";

import { Avatar, AvatarFallback, AvatarImage } from "@galileyo/ui/avatar";

function NavigationComponent({
  children,
  href,
}: {
  children: React.ReactNode;
  href?: string;
}) {
  return href &&
    href !== "" &&
    !href.includes("undefined") &&
    !href.includes("null") ? (
    <Link href={href}>
      <div className="relative">{children}</div>
    </Link>
  ) : (
    <>{children}</>
  );
}

export function UserAvatar({
  name,
  image,
  isVerified,
  isInfluencer,
  children,
  href,
}: {
  name: string;
  image: string | null;
  isVerified: boolean;
  isInfluencer: boolean;
  children?: React.ReactNode;
  href?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <NavigationComponent href={href}>
        <div className="relative">
          <Avatar className="h-12 w-12">
            <AvatarImage src={image ?? ""} alt={name} />
            <AvatarFallback className="select-none bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-white">
              {name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          {isVerified && (
            <span className="absolute right-0 top-0">
              <span className="sr-only">Verified</span>
              <RiVerifiedBadgeFill className="h-4 w-4 text-cyan-500 dark:text-cyan-400" />
            </span>
          )}
        </div>
      </NavigationComponent>
      <div className="flex-1">
        <div className="mb-1 flex items-center gap-2">
          <NavigationComponent href={href}>
            <h3 className="font-semibold text-slate-900 dark:text-white">
              {name}
            </h3>
          </NavigationComponent>
          {isInfluencer && (
            <span className="rounded bg-purple-500/20 px-2 py-0.5 text-xs font-medium text-purple-400">
              Influencer
            </span>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
