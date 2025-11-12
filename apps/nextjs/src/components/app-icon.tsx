"use client";

import Image from "next/image";
import { useTheme } from "next-themes";

// import { GalileyoIcon } from "./icons/galileyo-icon";

export function AppIcon({ useDark }: { useDark?: boolean }) {
  const { theme } = useTheme();

  if (theme === "light" || useDark === false) {
    return (
      <Image
        src="/galileyo_new_logo_light.png"
        alt="Galileyo"
        className="object-contain"
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
      className="object-contain"
      width={500}
      height={315}
      priority
    />
  );

  // return <GalileyoIcon />;
}
