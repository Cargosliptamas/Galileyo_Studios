"use client";

import type { ThirdPartyContentProps } from "./types";

export default function OtherContent({ link }: ThirdPartyContentProps) {
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-500 hover:text-blue-600"
    >
      {link}
    </a>
  );
}
