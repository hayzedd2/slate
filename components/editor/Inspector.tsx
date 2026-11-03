"use client";

import { Frame, Image, MessageSquareText, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEditor } from "@/lib/store";
import type { PanelId } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AnnotationsPanel } from "./panels/AnnotationsPanel";
import { CanvasPanel } from "./panels/CanvasPanel";
import { ShotPanel } from "./panels/ShotPanel";

const TABS: { id: PanelId; label: string; icon: LucideIcon }[] = [
  { id: "canvas", label: "Canvas", icon: Frame },
  { id: "shot", label: "Screenshot", icon: Image },
  { id: "annotations", label: "Callouts", icon: MessageSquareText },
];

export function Inspector() {
  const open = useEditor((s) => s.inspectorOpen);
  const panel = useEditor((s) => s.panel);
  const setPanel = useEditor((s) => s.setPanel);
  const close = useEditor((s) => s.closeInspector);

  return (
    <aside
      aria-hidden={!open}
      className={cn(
        "absolute inset-y-0 right-0 z-30 flex w-90 max-w-[calc(100vw-1rem)] flex-col border-l border-white/10 bg-[#101012] shadow-[-24px_0_70px_-30px_rgba(0,0,0,0.95)] transition-transform duration-200 ease-out",
        open ? "translate-x-0" : "pointer-events-none translate-x-full",
      )}
    >
      <div className="flex h-11 shrink-0 items-center gap-1 border-b border-white/10 px-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = panel === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setPanel(tab.id)}
              className={cn(
                "flex h-7 items-center gap-1.5  px-2 text-[11px] font-medium transition-colors",
                active
                  ? "bg-white/10 text-white"
                  : "text-white/40 hover:bg-white/4 hover:text-white/75",
              )}
            >
              <Icon size={13} />
              {tab.label}
            </button>
          );
        })}
        <button
          type="button"
          onClick={close}
          aria-label="Close inspector"
          className="ml-auto grid size-7 place-items-center  text-white/40 transition-colors hover:bg-white/6 hover:text-white"
        >
          <X size={14} />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
        <div className="w-full px-5 py-5">
          {panel === "canvas" ? <CanvasPanel /> : null}
          {panel === "shot" ? <ShotPanel /> : null}
          {panel === "annotations" ? <AnnotationsPanel /> : null}
          <div className="h-8" />
        </div>
      </div>
    </aside>
  );
}
