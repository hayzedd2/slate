"use client";

import {
  Select as BaseSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Option = { value: string; label: string };

type Props = {
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  label?: string;
  className?: string;
  triggerClassName?: string;
  size?: "sm" | "default";
};

export function Select({
  value,
  options,
  onChange,
  label,
  className,
  triggerClassName,
  size,
}: Props) {
  return (
    <div className={className}>
      {label ? (
        <span className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.12em] text-white/35">
          {label}
        </span>
      ) : null}
      <BaseSelect value={value} onValueChange={onChange}>
        <SelectTrigger
          size={size}
          className={cn(
            "h-8 w-full  border-white/10 bg-white/4 px-2.5 text-[11px] font-medium text-white/80 hover:bg-white/[0.07]",
            triggerClassName,
          )}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className=" border-white/10">
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </BaseSelect>
    </div>
  );
}
