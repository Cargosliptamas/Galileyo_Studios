import baseConfig, { restrictEnvAccess } from "@galileyo/eslint-config/base";
import nextjsConfig from "@galileyo/eslint-config/nextjs";
import reactConfig from "@galileyo/eslint-config/react";

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: [".next/**"],
  },
  ...baseConfig,
  ...reactConfig,
  ...nextjsConfig,
  ...restrictEnvAccess,
];
