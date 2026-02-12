import { createJiti } from "jiti";

const jiti = createJiti(import.meta.url);

// Import env files to validate at build time. Use jiti so we can load .ts files in here.
await jiti.import("./src/env");

/** @type {import("next").NextConfig} */
const config = {
  serverExternalPackages: ["esbuild", "@esbuild/linux-x64"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
          // Required for FFmpeg.wasm SharedArrayBuffer support
          // {
          //   key: "Cross-Origin-Opener-Policy",
          //   value: "same-origin",
          // },
          // {
          //   key: "Cross-Origin-Embedder-Policy",
          //   value: "require-corp",
          // },
        ],
      },
    ];
  },
  /** Enables hot reloading for local packages without a build step */
  transpilePackages: [
    "@galileyo/api",
    "@galileyo/auth",
    "@galileyo/db",
    "@galileyo/emails",
    "@galileyo/ui",
    "@galileyo/utils",
    "@galileyo/validators",
  ],

  async redirects() {
    return [
      {
        source: "/terms-of-use",
        destination: "/terms-of-service",
        permanent: true,
      },
    ];
  },

  /** We already do linting and typechecking as separate tasks in CI */
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

export default config;

// You may want to use a more robust revision to cache
// files more efficiently.
// A viable option is `git rev-parse HEAD`.
// const revision = crypto.randomUUID();

// const withSerwist = (await import("@serwist/next")).default({
//   // cacheOnNavigation: true,
//   swSrc: "src/app/sw.ts",
//   swDest: "public/sw.js",
//   // additionalPrecacheEntries: [{ url: "/~offline", revision }],
// });

// export default withSerwist(config);

// import withSerwistInit from "@serwist/next";

// const withSerwist = withSerwistInit({
//   // Note: This is only an example. If you use Pages Router,
//   // use something else that works, such as "service-worker/index.ts".
//   swSrc: "src/app/sw.ts",
//   swDest: "public/sw.js",
// });

// export default withSerwist(config);
