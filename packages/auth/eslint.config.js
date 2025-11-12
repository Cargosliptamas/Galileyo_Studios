import baseConfig, { restrictEnvAccess } from "@galileyo/eslint-config/base";

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: ["scripts/auth-cli.ts"],
  },
  ...baseConfig,
  ...restrictEnvAccess,
];
