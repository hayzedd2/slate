"use client";

import { Shuffle } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  GRADIENT_PRESETS,
  gradientCss,
  isGradientPresetActive,
  MESH_PRESETS,
  meshCss,
  stopsFromPreset,
} from "@/lib/backgrounds";
import { CANVAS_PRESETS, SOLID_SWATCHES } from "@/lib/defaults";
import { useEditor } from "@/lib/store";
import type { DecorType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ColorField } from "../ui/ColorField";
import { Section } from "../ui/Section";
import { Segmented } from "../ui/Segmented";
import { Select } from "../ui/Select";
import { Slider } from "../ui/Slider";
import { SwatchGrid } from "../ui/SwatchGrid";
import { Toggle } from "../ui/Toggle";

type BackdropTab = "color" | "gradient" | "mesh";

const DECOR_OPTIONS: { value: DecorType; label: string }[] = [
  { value: "none", label: "None" },
  { value: "arcs", label: "Dashed arcs" },
  { value: "grid", label: "Fine grid" },
  { value: "dots", label: "Dot grid" },
  { value: "frame", label: "Dotted frame" },
];

function DimensionInput({
  label,
  value,
  onCommit,
}: {
  label: string;
  value: number;
  onCommit: (value: number) => void;
}) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const commit = () => {
    const parsed = Math.round(Number(draft));
    if (!Number.isFinite(parsed)) {
      setDraft(String(value));
      return;
    }
    const clamped = Math.max(400, Math.min(4000, parsed));
    setDraft(String(clamped));
    if (clamped !== value) onCommit(clamped);
  };

  return (
    <label className="flex h-8 items-center gap-2  border border-white/10 bg-white/4 px-2.5">
      <span className="text-[9px] font-medium uppercase tracking-wider text-white/30">
        {label}
      </span>
      <Input
        value={draft}
        onChange={(event) =>
          setDraft(event.target.value.replace(/[^0-9]/g, ""))
        }
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
        }}
        inputMode="numeric"
        className="h-full border-0 bg-transparent px-0 text-right font-mono text-[10.5px] tabular-nums text-white/75 shadow-none hover:border-0 focus-visible:border-0 focus-visible:ring-0 pr-2"
      />
      <span className="text-[9px] text-white/25">px</span>
    </label>
  );
}

function PresetThumb({
  css,
  name,
  active,
  onClick,
}: {
  css: string;
  name: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={name}
      onClick={onClick}
      className={cn(
        "relative aspect-square w-full  border transition-[opacity,box-shadow] hover:opacity-90",
        active
          ? "border-[#3ddc97] shadow-[0_0_0_1px_#3ddc97]"
          : "border-white/10",
      )}
      style={{ background: css }}
    />
  );
}

export function CanvasPanel() {
  const doc = useEditor((s) => s.doc);
  const update = useEditor((s) => s.update);
  const setCanvasSize = useEditor((s) => s.setCanvasSize);
  const minSide = Math.min(doc.canvas.width, doc.canvas.height);
  const matched = CANVAS_PRESETS.find(
    (preset) =>
      preset.width === doc.canvas.width &&
      preset.height === doc.canvas.height,
  );
  const [tab, setTab] = useState<BackdropTab>(
    doc.background.type === "gradient"
      ? "gradient"
      : doc.background.type === "mesh"
        ? "mesh"
        : "color",
  );

  const background = doc.background;
  const color = background.type === "solid" ? background.color : "#efe9df";
  const decor = doc.decor;

  return (
    <div className="space-y-6">
      <Section title="Format">
        <Select
          value={matched?.id ?? "custom"}
          options={[
            ...CANVAS_PRESETS.map((preset) => ({
              value: preset.id,
              label: preset.label,
            })),
            { value: "custom", label: "Custom size" },
          ]}
          onChange={(value) => {
            const preset = CANVAS_PRESETS.find((item) => item.id === value);
            if (preset) setCanvasSize(preset.width, preset.height);
          }}
        />
        <div className="grid grid-cols-2 gap-2">
          <DimensionInput
            label="W"
            value={doc.canvas.width}
            onCommit={(width) => setCanvasSize(width, doc.canvas.height)}
          />
          <DimensionInput
            label="H"
            value={doc.canvas.height}
            onCommit={(height) => setCanvasSize(doc.canvas.width, height)}
          />
        </div>
      </Section>

      <Section title="Backdrop">
        <Toggle
          
          label="Show background"
          description="Off exports a transparent image"
          checked={doc.backgroundEnabled}
          onChange={(checked) =>
            update((draft) => {
              draft.backgroundEnabled = checked;
            })
          }
        />

        <Tabs
          value={tab}
          onValueChange={(value) => setTab(value as BackdropTab)}
          className={cn(!doc.backgroundEnabled && "opacity-50")}
        >
          <TabsList className="h-8 w-full gap-0.5 r border border-white/10 bg-white/3 p-0.5">
            <TabsTrigger
              value="color"
              className="h-full  text-[11px] data-active:bg-white/12 data-active:text-white"
            >
              Color
            </TabsTrigger>
            <TabsTrigger
              value="gradient"
              className="h-full  text-[11px] data-active:bg-white/12 data-active:text-white"
            >
              Gradient
            </TabsTrigger>
            <TabsTrigger
              value="mesh"
              className="h-full  text-[11px] data-active:bg-white/12 data-active:text-white"
            >
              Mesh
            </TabsTrigger>
          </TabsList>

          <TabsContent value="color" className="space-y-3 pt-1">
            <SwatchGrid
              colors={SOLID_SWATCHES}
              value={color}
              onChange={(value) =>
                update(
                  (draft) => {
                    draft.background = { type: "solid", color: value };
                    draft.backgroundEnabled = true;
                  },
                  { merge: "backdrop-color" },
                )
              }
            />
            <ColorField
              value={color}
              onChange={(value) =>
                update(
                  (draft) => {
                    draft.background = { type: "solid", color: value };
                    draft.backgroundEnabled = true;
                  },
                  { merge: "backdrop-color" },
                )
              }
            />
          </TabsContent>

          <TabsContent value="gradient" className="space-y-3 pt-1">
            <div className="grid grid-cols-5 gap-1.5">
              {GRADIENT_PRESETS.map((preset) => (
                <PresetThumb
                  key={preset.id}
                  css={gradientCss(preset)}
                  name={preset.name}
                  active={
                    background.type === "gradient" &&
                    isGradientPresetActive(
                      preset,
                      background.stops,
                      background.kind,
                    )
                  }
                  onClick={() =>
                    update((draft) => {
                      draft.background = {
                        type: "gradient",
                        kind: preset.kind,
                        angle: preset.angle,
                        stops: stopsFromPreset(preset),
                      };
                      draft.backgroundEnabled = true;
                    })
                  }
                />
              ))}
            </div>

            {background.type === "gradient" ? (
              <>
                <Segmented<"linear" | "radial">
                  value={background.kind}
                  onChange={(value) =>
                    update((draft) => {
                      if (draft.background.type === "gradient") {
                        draft.background.kind = value;
                      }
                    })
                  }
                  options={[
                    { value: "linear", label: "Linear" },
                    { value: "radial", label: "Radial" },
                  ]}
                />
                {background.kind === "linear" ? (
                  <Slider
                    label="Angle"
                    value={background.angle}
                    min={0}
                    max={360}
                    onChange={(value) =>
                      update(
                        (draft) => {
                          if (draft.background.type === "gradient") {
                            draft.background.angle = value;
                          }
                        },
                        { history: false },
                      )
                    }
                    format={(value) => `${value}°`}
                  />
                ) : null}
              </>
            ) : null}
          </TabsContent>

          <TabsContent value="mesh" className="space-y-3 pt-1">
            <div className="grid grid-cols-6 gap-1.5">
              {MESH_PRESETS.map((preset) => (
                <PresetThumb
                  key={preset.id}
                  css={meshCss(preset)}
                  name={preset.name}
                  active={
                    background.type === "mesh" &&
                    background.colors.every(
                      (item, index) => item === preset.colors[index],
                    )
                  }
                  onClick={() =>
                    update((draft) => {
                      draft.background = {
                        type: "mesh",
                        colors: [...preset.colors],
                        base: preset.base,
                        intensity: preset.intensity,
                        seed:
                          draft.background.type === "mesh"
                            ? draft.background.seed
                            : Math.floor(Math.random() * 10000),
                      };
                      draft.backgroundEnabled = true;
                    })
                  }
                />
              ))}
            </div>

            {background.type === "mesh" ? (
              <>
                <Slider
                  label="Intensity"
                  value={background.intensity}
                  min={0}
                  max={100}
                  onChange={(value) =>
                    update(
                      (draft) => {
                        if (draft.background.type === "mesh") {
                          draft.background.intensity = value;
                        }
                      },
                      { history: false },
                    )
                  }
                  format={(value) => `${value}%`}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/[0.08] hover:text-white"
                  onClick={() =>
                    update((draft) => {
                      if (draft.background.type === "mesh") {
                        draft.background.seed = Math.floor(
                          Math.random() * 100000,
                        );
                      }
                    })
                  }
                >
                  <Shuffle size={13} />
                  Shuffle blobs
                </Button>
              </>
            ) : null}
          </TabsContent>
        </Tabs>
      </Section>

      <Section title="Texture">
        <Select
          value={decor.type}
          options={DECOR_OPTIONS}
          onChange={(value) =>
            update((draft) => {
              draft.decor.type = value as DecorType;
            })
          }
        />
        {decor.type !== "none" ? (
          <>
            <ColorField
              value={decor.color}
              label="Texture color"
              onChange={(value) =>
                update(
                  (draft) => {
                    draft.decor.color = value;
                  },
                  { merge: "decor-color" },
                )
              }
            />
            <Slider
              label="Opacity"
              value={Math.round(decor.opacity * 100)}
              min={0}
              max={100}
              onChange={(value) =>
                update(
                  (draft) => {
                    draft.decor.opacity = value / 100;
                  },
                  { history: false },
                )
              }
              format={(value) => `${value}%`}
            />
            <Slider
              label="Scale"
              value={Math.round(decor.scale * 100)}
              min={50}
              max={180}
              onChange={(value) =>
                update(
                  (draft) => {
                    draft.decor.scale = value / 100;
                  },
                  { history: false },
                )
              }
              format={(value) => `${value}%`}
            />
          </>
        ) : null}
      </Section>

      <Section title="Edges">
        <Slider
          label="Padding"
          value={Math.round(doc.canvas.padding * minSide)}
          min={0}
          max={Math.round(minSide * 0.18)}
          onChange={(value) =>
            update(
              (draft) => {
                draft.canvas.padding = value / minSide;
              },
              { history: false },
            )
          }
          format={(value) => `${value}px`}
        />
        <Slider
          label="Corner radius"
          value={doc.canvas.radius}
          min={0}
          max={Math.round(minSide * 0.08)}
          onChange={(value) =>
            update(
              (draft) => {
                draft.canvas.radius = value;
              },
              { history: false },
            )
          }
          format={(value) => `${value}px`}
        />
      </Section>
    </div>
  );
}
