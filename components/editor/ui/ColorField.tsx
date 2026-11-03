"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
};

export function ColorField({ value, onChange, label, className }: Props) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="relative h-8 w-8 shrink-0 overflow-hidden  border border-white/10">
        <span className="absolute inset-0" style={{ background: value }} />
        <input
          type="color"
          aria-label={label ?? "Color"}
          className="slate-color-input"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </span>
      <div className="relative flex h-8 min-w-0 flex-1 items-center  border border-white/10 bg-white/4 px-2.5">
        <span className="mr-1 text-[10px] text-white/30">#</span>
        <Input
          value={value.replace("#", "").toUpperCase()}
          onChange={(event) => {
            const next = event.target.value
              .replace(/[^0-9a-f]/gi, "")
              .slice(0, 6);
            if (next.length === 6) onChange(`#${next.toLowerCase()}`);
          }}
          className="h-full border-0 bg-transparent px-0 font-mono pl-2 text-[10.5px] uppercase tracking-wide text-white/75 shadow-none hover:border-0 focus-visible:border-0 focus-visible:ring-0"
          spellCheck={false}
        />
      </div>
    </div>
  );
}
