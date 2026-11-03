"use client";

import { Check, ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { backgroundCss, LOOKS } from "@/lib/looks";
import { useEditor } from "@/lib/store";
import { cn } from "@/lib/utils";
import { isLookActive, LookPreview } from "./LookPreview";

export function LookPicker() {
  const doc = useEditor((s) => s.doc);
  const update = useEditor((s) => s.update);
  const notify = useEditor((s) => s.notify);
  const active = LOOKS.find((look) => isLookActive(look, doc));
  const swatch = active
    ? backgroundCss(active.background)
    : backgroundCss(doc.background);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-7 items-center gap-2  border border-white/10 bg-white/4 px-2 text-[11px] font-medium text-white/80 transition-colors hover:bg-white/8 hover:text-white"
        >
          <span
            className="size-3.5 shrink-0  border border-white/15"
            style={{ background: swatch }}
          />
          <span className="max-w-18.5 truncate">
            {active?.name ?? "Custom"}
          </span>
          <ChevronDown size={12} className="text-white/40" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        sideOffset={10}
        className="w-82.5  border-white/10 bg-[#151517] p-3 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)]"
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-medium text-white/80">
            Pedestal look
          </span>
          <span className="text-[10px] text-white/35">
            {LOOKS.length} presets
          </span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {LOOKS.map((look) => {
            const selected = active?.id === look.id;
            return (
              <button
                key={look.id}
                type="button"
                onClick={() => {
                  update((draft) => {
                    draft.background = structuredClone(look.background);
                    draft.backgroundEnabled = true;
                    draft.decor = structuredClone(look.decor);
                    draft.shot.frameTheme = look.frameTheme;
                  });
                  notify(`${look.name} look applied`);
                }}
                className="group text-left"
              >
                <div
                  className={cn(
                    "relative transition-shadow",
                    selected
                      ? "ring-2 ring-[#3ddc97] ring-offset-2 ring-offset-[#151517]"
                      : "group-hover:ring-1 group-hover:ring-white/20 group-hover:ring-offset-2 group-hover:ring-offset-[#151517]",
                  )}
                >
                  <LookPreview look={look} />
                  {selected ? (
                    <span className="absolute right-1 top-1 grid size-3.5 place-items-center rounded-full bg-[#3ddc97] text-[#04140c]">
                      <Check size={9} strokeWidth={3} />
                    </span>
                  ) : null}
                </div>
                <span className="mt-1 block truncate text-[10px] font-medium text-white/75">
                  {look.name}
                </span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
