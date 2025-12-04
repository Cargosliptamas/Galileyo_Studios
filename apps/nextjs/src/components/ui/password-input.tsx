"use client";

import type { ComponentProps } from "react";
import { useId, useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";

import { cn } from "@galileyo/ui";
import { Input } from "@galileyo/ui/input";
import { Label } from "@galileyo/ui/label";

export type PasswordInputProps = Omit<
  ComponentProps<"input">,
  "id" | "type"
> & {
  containerClassName?: string;
  label?: string;
  showLabel?: boolean;
};

export function PasswordInput({
  label,
  placeholder,
  containerClassName,
  showLabel = true,
  ...props
}: PasswordInputProps) {
  const id = useId();
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const toggleVisibility = () => setIsVisible((prevState) => !prevState);

  return (
    <div className={cn("*:not-first:mt-2", containerClassName)}>
      {showLabel && <Label htmlFor={id}>{label ?? "Password"}</Label>}
      <div className="relative">
        <Input
          id={id}
          className="pe-9"
          placeholder={placeholder ?? "Password"}
          type={isVisible ? "text" : "password"}
          {...props}
        />
        <button
          tabIndex={-1}
          className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md text-muted-foreground/80 outline-none transition-[color,box-shadow] hover:text-foreground focus:z-10 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
          onClick={toggleVisibility}
          aria-label={isVisible ? "Hide password" : "Show password"}
          aria-pressed={isVisible}
          aria-controls="password"
        >
          {isVisible ? (
            <EyeOffIcon size={16} aria-hidden="true" />
          ) : (
            <EyeIcon size={16} aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  );
}
