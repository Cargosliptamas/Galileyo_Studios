"use client";

import Image from "next/image";
import { useTheme } from "next-themes";

import { cn } from "@galileyo/ui";

// import { GalileyoIcon } from "./icons/galileyo-icon";

export function AppIcon({
  useDark = false,
  className,
}: {
  useDark?: boolean;
  className?: string;
}) {
  const { theme } = useTheme();

  if (useDark === false && theme === "light") {
    return (
      <Image
        src="/galileyo_new_logo_light.png"
        alt="Galileyo"
        className={cn("object-contain", className)}
        width={500}
        height={315}
        priority
      />
    );
  }

  return (
    <Image
      src="/galileyo_new_logo.png"
      alt="Galileyo"
      className={cn("object-contain", className)}
      width={500}
      height={315}
      priority
    />
  );

  // return <GalileyoIcon />;
}
