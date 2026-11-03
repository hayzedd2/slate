"use client";

import { Slider as BaseSlider } from "@/components/ui/slider";
import { useEditor } from "@/lib/store";

type Props = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  format?: (value: number) => string;
  disabled?: boolean;
};

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  format,
  disabled = false,
}: Props) {
  const beginGesture = useEditor((s) => s.beginGesture);
  const endGesture = useEditor((s) => s.endGesture);

  return (
    <div className={`space-y-1.5 ${disabled ? "opacity-40" : ""}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-medium text-white/65">{label}</span>
        <span className="min-w-9  border border-white/10 bg-white/4 px-1.5 py-0.5 text-right font-mono text-[9.5px] tabular-nums text-white/55">
          {format ? format(value) : value}
        </span>
      </div>
      <BaseSlider
        value={[value]}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onPointerDown={() => beginGesture()}
        onKeyDown={() => beginGesture()}
        onKeyUp={() => endGesture()}
        onValueChange={(next) => onChange(next[0] ?? value)}
        onValueCommit={() => endGesture()}
        className="[&_[data-slot=slider-range]]:bg-[#3ddc97] [&_[data-slot=slider-thumb]]:border-[#3ddc97] [&_[data-slot=slider-thumb]]:bg-[#0b0b0d] [&_[data-slot=slider-track]]:bg-white/10"
      />
    </div>
  );
}
