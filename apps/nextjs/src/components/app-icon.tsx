"use client";

import Image from "next/image";
import { useTheme } from "next-themes";

// import { GalileyoIcon } from "./icons/galileyo-icon";

export function AppIcon() {
  const { theme } = useTheme();

  if (theme === "light") {
    return (
      <Image
        src="/galileyo_new_logo_light.png"
        alt="Galileyo"
        className="object-contain"
        width={500}
        height={315}
      />
    );
  }

  return (
    <Image
      src="/galileyo_new_logo.png"
      alt="Galileyo"
      className="object-contain"
      width={500}
      height={315}
    />
  );

  // return <GalileyoIcon />;
}
