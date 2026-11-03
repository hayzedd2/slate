"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  size?: "sm" | "md";
  tone?: "ghost" | "soft";
};

export function IconButton({
  children,
  size = "md",
  tone = "ghost",
  className = "",
  ...props
}: Props) {
  return (
    <Button
      type="button"
      variant={tone === "soft" ? "secondary" : "ghost"}
      size={size === "sm" ? "icon-sm" : "icon"}
      className={cn("text-muted-foreground", className)}
      {...props}
    >
      {children}
    </Button>
  );
}
