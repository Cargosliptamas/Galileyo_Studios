import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

import baseConfig from "@galileyo/tailwind-config/web";

export default {
  // We need to append the path to the UI package to the content array so that
  // those classes are included correctly.
  content: [...baseConfig.content, "../../packages/ui/src/*.{ts,tsx}"],
  presets: [baseConfig],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
        mono: ["var(--font-mono)", ...fontFamily.mono],
        inter: ["var(--font-inter)", ...fontFamily.sans],
        display: ["var(--font-display)", "ui-sans-serif", "system-ui"],
        editorial: ["var(--font-editorial)", "ui-serif", "Georgia"],
      },
    },
  },
} satisfies Config;
