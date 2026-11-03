"use client";

import {
  AppWindow,
  MessageSquareText,
  PanelTop,
  SlidersHorizontal,
  Square,
} from "lucide-react";
import type { ReactNode } from "react";
import { Switch } from "@/components/ui/switch";
import { useEditor } from "@/lib/store";
import type { FrameStyle } from "@/lib/types";
import { cn } from "@/lib/utils";
import { LookPicker } from "./LookPicker";

const PADDING_PRESETS = [16, 32, 64, 128] as const;

const FRAME_OPTIONS: {
  value: FrameStyle;
  label: string;
  icon: typeof Square;
}[] = [
  { value: "none", label: "None", icon: Square },
  { value: "browser", label: "Browser", icon: AppWindow },
  { value: "window", label: "Window", icon: PanelTop },
];

function DockControl({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-[9px] font-medium uppercase tracking-[0.16em] text-white/35">
        {label}
      </span>
      <div className="flex h-7 items-center">{children}</div>
    </div>
  );
}

function DockSegmented<T extends string | number>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: ReactNode; title?: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex h-7 items-center gap-0.5  border border-white/10 bg-white/3 p-0.5">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={String(option.value)}
            type="button"
            title={option.title}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex h-full min-w-7 text-sm items-center justify-center gap-1  px-1.5  font-medium transition-colors",
              active
                ? "bg-white/12 text-white shadow-[0_1px_0_rgba(255,255,255,0.06)_inset]"
                : "text-white/45 hover:bg-white/6 hover:text-white/80",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function ControlDock() {
  const doc = useEditor((s) => s.doc);
  const update = useEditor((s) => s.update);
  const openInspector = useEditor((s) => s.openInspector);
  const addAnnotation = useEditor((s) => s.addAnnotation);

  const minSide = Math.min(doc.canvas.width, doc.canvas.height);
  const padding = Math.round(doc.canvas.padding * minSide);
  const callouts = doc.annotations.length;

  return (
    <div className="slate-dock flex max-w-[min(940px,calc(100vw-2rem))] flex-wrap items-end justify-center gap-x-5 gap-y-3  border border-white/10 px-4 py-2.5 shadow-[0_30px_80px_-24px_rgba(0,0,0,0.95)]">
      <DockControl label="Look">
        <LookPicker />
      </DockControl>

      <DockControl label="Background">
        <Switch
          size="sm"
          checked={doc.backgroundEnabled}
          onCheckedChange={(checked) =>
            update((draft) => {
              draft.backgroundEnabled = checked;
            })
          }
          aria-label="Toggle background"
        />
      </DockControl>

      <DockControl label="Frame theme">
        <Switch
          size="sm"
          checked={doc.shot.frameTheme === "dark"}
          disabled={doc.shot.frame === "none"}
          onCheckedChange={(checked) =>
            update((draft) => {
              draft.shot.frameTheme = checked ? "dark" : "light";
            })
          }
          aria-label="Toggle dark frame"
          className={doc.shot.frame === "none" ? "opacity-40" : undefined}
        />
      </DockControl>

      <DockControl label="Padding">
        <DockSegmented
          value={padding}
          options={PADDING_PRESETS.map((preset) => ({
            value: preset,
            label: preset,
            title: `${preset}px padding`,
          }))}
          onChange={(value) =>
            update((draft) => {
              draft.canvas.padding = value / minSide;
            })
          }
        />
      </DockControl>

      <DockControl label="Frame">
        <DockSegmented
          value={doc.shot.frame}
          options={FRAME_OPTIONS.map((option) => {
            const Icon = option.icon;
            return {
              value: option.value,
              title: option.label,
              label: <Icon size={13} strokeWidth={1.8} />,
            };
          })}
          onChange={(value) =>
            update((draft) => {
              draft.shot.frame = value;
            })
          }
        />
      </DockControl>

      <span className="mb-1 hidden h-8 w-px self-end bg-white/10 sm:block" />

      <DockControl label="Studio">
        <button
          type="button"
          onClick={() => openInspector("canvas")}
          className="flex h-7 items-center gap-1.5  border border-white/10 bg-white/4 px-2.5 text-[11px] font-medium text-white/75 transition-colors hover:bg-white/8 hover:text-white"
        >
          <SlidersHorizontal size={13} />
          Customize
        </button>
      </DockControl>

      <DockControl label="Callouts">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => openInspector("annotations")}
            className="flex h-7 items-center gap-1.5  border border-white/10 bg-white/4 px-2.5 text-[11px] font-medium text-white/75 transition-colors hover:bg-white/8 hover:text-white"
          >
            <MessageSquareText size={13} />
            Notes
            {callouts > 0 ? (
              <span className="grid size-4 place-items-center rounded-full bg-[#3ddc97] text-[9px] font-semibold text-[#04140c]">
                {callouts}
              </span>
            ) : null}
          </button>
          <button
            type="button"
            title="Add a callout"
            aria-label="Add a callout"
            onClick={addAnnotation}
            className="grid size-7 place-items-center rounded-md border border-dashed border-white/15 text-white/45 transition-colors hover:border-[#3ddc97]/60 hover:text-[#3ddc97]"
          >
            +
          </button>
        </div>
      </DockControl>
    </div>
  );
}
