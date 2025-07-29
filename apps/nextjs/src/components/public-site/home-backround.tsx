'use client'

import { useTheme } from "next-themes";
import { Particles } from "../particles";
import { ShootingStars } from "../shooting-stars";

export function HomeBackground() {
  const { resolvedTheme } = useTheme();
  const color = resolvedTheme === "dark" ? "#ffffff" : "#000000";

  return (
    <>
      <Particles
        className="absolute inset-0 z-0"
        quantity={100}
        ease={80}
        color={color}
        refresh
      />
      <ShootingStars />
    </>
  )
}