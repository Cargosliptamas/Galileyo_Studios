import baseConfig, { restrictEnvAccess } from "@galileyo/eslint-config/base";

/** @type {import('typescript-eslint').Config} */
export default [...baseConfig, ...restrictEnvAccess];
