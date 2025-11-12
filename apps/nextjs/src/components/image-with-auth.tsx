"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Skeleton } from "@galileyo/ui/skeleton";

import { useTRPC } from "~/trpc/react";

export interface ImageWithAuthProps {
  className?: HTMLElement["className"];
  skeletonClassName?: HTMLElement["className"];
  alt?: string;
  url: string;
}

export default function ImageWithAuth({
  url,
  className,
  skeletonClassName,
  alt,
}: ImageWithAuthProps) {
  const trpc = useTRPC();
  const [imageVisible, setImageVisible] = useState(true);

  const {
    data: imageData,
    isLoading: isImageLoading,
    error: imageError,
  } = useQuery(trpc.feed.getPostImage.queryOptions({ url }));

  if (imageError || !imageVisible) {
    return (
      <div className={"flex h-64 w-64 items-center justify-center bg-gray-100"}>
        <svg
          className="h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.75 9.75a1.5 1.5 0 103 0 1.5 1.5 0 00-3 0zm.563 4.313l-3.188 3.187m0 0l2.625-2.625a1.125 1.125 0 011.594 0l.844.844c.439.439 1.15.439 1.588 0l3.375-3.375m-7.906 5.156V6.75A2.25 2.25 0 017.125 4.5h9.75a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25H7.125a2.25 2.25 0 01-2.25-2.25z"
          />
        </svg>
        <span className="ml-2 text-sm text-gray-400">Image not found</span>
      </div>
    );
  }

  return (
    <>
      {isImageLoading ? (
        <Skeleton className={skeletonClassName ?? "h-64 w-64"} />
      ) : (
        <img
          className={className ?? "max-h-full"}
          src={imageData}
          onError={() => setImageVisible(false)}
          onLoad={() => setImageVisible(true)}
          alt={alt}
        />
      )}
    </>
  );
}
