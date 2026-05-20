import { cn } from "@galileyo/ui";

interface StudiosBrandProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function StudiosBrand({ className, size = "md" }: StudiosBrandProps) {
  return (
    <span
      className={cn(
        "font-display inline-flex items-baseline gap-2 leading-none tracking-[0.18em]",
        size === "sm" && "text-base",
        size === "md" && "text-xl",
        size === "lg" && "text-3xl",
        className,
      )}
    >
      <span className="text-[rgb(var(--studios-text))]">GALILEYO</span>
      <span className="text-[rgb(var(--studios-accent))]">STUDIOS</span>
    </span>
  );
}
