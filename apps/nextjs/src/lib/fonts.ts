import {
  Bebas_Neue as FontDisplay,
  Fraunces as FontEditorial,
  Geist_Mono as FontMono,
  Geist as FontSans,
  Inter,
} from "next/font/google";

import { cn } from "@galileyo/ui";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = FontMono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400"],
});

const fontInter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const fontDisplay = FontDisplay({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-display",
  display: "swap",
});

const fontEditorial = FontEditorial({
  subsets: ["latin"],
  variable: "--font-editorial",
  display: "swap",
});

export const fontVariables = cn(
  fontSans.variable,
  fontMono.variable,
  fontInter.variable,
  fontDisplay.variable,
  fontEditorial.variable,
);
