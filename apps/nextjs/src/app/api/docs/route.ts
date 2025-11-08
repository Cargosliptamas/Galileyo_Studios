import { notFound } from "next/navigation";
import { ApiReference } from "@scalar/nextjs-api-reference";

import { env } from "~/env";

const config = {
  showToolbar: "localhost" as const,
  telemetry: false,
  hideClientButton: true,
  // url: '/openapi.json',
  sources: [
    {
      url: "/openapi.json",
      title: "Galileyo",
    },
    // {
    //   url: '/api/auth/open-api/generate-schema',
    //   title: 'Auth',
    // },
  ],
};

export const GET =
  env.NODE_ENV === "development" ? ApiReference(config) : () => notFound();
