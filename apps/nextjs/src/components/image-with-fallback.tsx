"use client";

import { useEffect, useState } from "react";

import { Skeleton } from "@galileyo/ui/skeleton";

export function ImageWithFallback({
  src,
  fallback,
  className = "h-64 w-64",
  ...props
}: {
  src: string | null | undefined;
  fallback?: React.ReactNode;
  className?: string;
  props?: Omit<React.HTMLAttributes<HTMLImageElement>, "src" | "className">;
}) {
  const [state, setState] = useState("loading");

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setState("success");
    img.onerror = () => setState("error");
    img.src = src ?? "";
  }, [src]);

  return (
    <>
      {state === "loading" && <Skeleton className={className} />}
      {state === "error" && (fallback ?? <Skeleton className={className} />)}
      {state === "success" && (
        <img
          src={src ?? ""}
          className={className}
          {...props}
          crossOrigin="anonymous"
        />
      )}
    </>
  );
}
