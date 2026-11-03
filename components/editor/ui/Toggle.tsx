"use client";

import { Switch } from "@/components/ui/switch";

type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
};

export function Toggle({ checked, onChange, label, description }: Props) {
  return (
    <div className="flex w-full items-center justify-between gap-3 text-left">
      <span className="min-w-0">
        {label ? (
          <span className="block text-[11px] font-medium text-white/70">
            {label}
          </span>
        ) : null}
        {description ? (
          <span className="mt-0.5 block text-[10px] leading-snug text-white/35">
            {description}
          </span>
        ) : null}
      </span>
      <Switch checked={checked} size="sm" onCheckedChange={onChange} />
    </div>
  );
}
