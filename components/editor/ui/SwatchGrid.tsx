"use client";

type Props = {
  colors: string[];
  value?: string;
  onChange: (color: string) => void;
  columns?: number;
};

export function SwatchGrid({ colors, value, onChange, columns = 6 }: Props) {
  return (
    <div
      className="grid gap-1.5"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {colors.map((color) => {
        const active = value?.toLowerCase() === color.toLowerCase();
        return (
          <button
            key={color}
            type="button"
            title={color}
            onClick={() => onChange(color)}
            className={`relative aspect-square w-full  border transition-[opacity,box-shadow] hover:opacity-90 ${
              active
                ? "border-[#3ddc97] shadow-[0_0_0_1px_#3ddc97]"
                : "border-white/10"
            }`}
            style={{ background: color }}
          />
        );
      })}
    </div>
  );
}
