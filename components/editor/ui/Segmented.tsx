"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Option<T extends string> = {
  value: T;
  label?: string;
  icon?: ReactNode;
  title?: string;
};

type Props<T extends string> = {
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
  size?: "sm" | "md";
  fullWidth?: boolean;
  className?: string;
};

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  size = "md",
  fullWidth = true,
  className,
}: Props<T>) {
  return (
    <div
      className={cn(
        "flex items-center gap-0.5  border border-white/10 bg-white/3 p-0.5",
        size === "sm" ? "h-7" : "h-8",
        fullWidth && "w-full",
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            title={option.title}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex h-full flex-1 items-center justify-center gap-1.5  px-2 text-[11px] font-medium transition-colors",
              active
                ? "bg-white/12 text-white shadow-[0_1px_0_rgba(255,255,255,0.06)_inset]"
                : "text-white/45 hover:bg-white/5 hover:text-white/80",
            )}
          >
            {option.icon}
            {option.label ? <span>{option.label}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
