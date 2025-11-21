"use client";

import { CopyIcon } from "lucide-react";

import type { ButtonProps } from "@galileyo/ui/button";
import { Button } from "@galileyo/ui/button";
import { toast } from "@galileyo/ui/toast";

export function CopyButton({
  text,
  title = "Copy to clipboard",
  children,
  ...props
}: {
  text: string;
} & Omit<ButtonProps, "onClick">) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch (error) {
      console.error(error);
      toast.error("Failed to copy text to clipboard");
    }
  };

  return (
    <Button
      variant="ghost"
      size={props.size ?? "icon"}
      onClick={handleCopy}
      title={title}
      {...props}
    >
      {children ?? <CopyIcon className="h-4 w-4" />}
    </Button>
  );
}
