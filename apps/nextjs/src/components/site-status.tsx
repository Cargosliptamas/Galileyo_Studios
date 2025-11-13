"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@galileyo/ui/button";

export function SiteStatus() {
  const { data: status } = useQuery({
    queryKey: ["site-status"],
    queryFn: async () => {
      let result: {
        name: string;
        url: string;
        status: "UP" | "HASISSUES" | "UNDERMAINTENANCE";
      } | null = null;

      try {
        const response = await fetch(
          "https://galileyo.instatus.com/summary.json",
          {
            next: {
              revalidate: 60 * 5, // 5 minutes
            },
          },
        );

        const data = (await response.json()) as {
          page: {
            name: string;
            url: string;
            status: "UP" | "HASISSUES" | "UNDERMAINTENANCE";
          };
        };

        result = data.page;
      } catch (error) {
        console.error(error);
      }

      return result ?? null;
    },
    staleTime: 60 * 30 * 1000,
    refetchOnWindowFocus: false,
  });

  if (!status) {
    return null;
  }

  return (
    <Button variant="ghost" className="flex items-center gap-1" asChild>
      <Link href={status.url} target="_blank">
        <div
          className={`h-2 w-2 animate-pulse rounded-full ${status.status === "UP" ? "bg-green-400" : status.status === "HASISSUES" ? "bg-yellow-400" : "bg-red-400"}`}
        ></div>
        <span className="text-sm text-green-400">
          {status.status === "UP"
            ? "All systems operational"
            : status.status === "HASISSUES"
              ? "Some systems are experiencing issues"
              : "Some systems are under maintenance"}
        </span>
      </Link>
    </Button>
  );
}
