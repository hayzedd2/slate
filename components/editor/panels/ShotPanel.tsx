"use client";

import { ImagePlus, RotateCcw, Trash2, Upload } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEditor } from "@/lib/store";
import type { FrameStyle, FrameTheme } from "@/lib/types";
import { Section } from "../ui/Section";
import { Segmented } from "../ui/Segmented";
import { Slider } from "../ui/Slider";
import { useShotUpload } from "../useShotUpload";

export function ShotPanel() {
  const doc = useEditor((s) => s.doc);
  const update = useEditor((s) => s.update);
  const select = useEditor((s) => s.select);
  const notify = useEditor((s) => s.notify);
  const upload = useShotUpload();
  const fileRef = useRef<HTMLInputElement>(null);
  const shot = doc.shot;

  return (
    <div className="space-y-6">
      <Section title="Screenshot">
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="hidden"
          onChange={(event) => {
            void upload(event.target.files?.[0]);
            event.target.value = "";
          }}
        />

        {shot.src ? (
          <div className="flex items-stretch gap-2">
            <div className="slate-checker flex h-18 w-27 shrink-0 items-center justify-center overflow-hidden  border border-white/10">
              <div
                className="h-full w-full bg-contain bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${shot.src})` }}
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start border-white/10 bg-white/4 text-white/70 hover:bg-white/8 hover:text-white"
                onClick={() => fileRef.current?.click()}
              >
                <Upload size={13} />
                Replace image
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-white/35 hover:text-white/70"
                onClick={() => {
                  update((draft) => {
                    draft.shot.src = null;
                  });
                  select(null);
                  notify("Screenshot removed");
                }}
              >
                <Trash2 size={13} />
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex h-24 w-full flex-col items-center justify-center gap-1.5  border border-dashed border-white/15 bg-white/2 text-white/40 transition-colors hover:border-white/25 hover:bg-white/5 hover:text-white/70"
          >
            <ImagePlus size={18} />
            <span className="text-[11px] font-medium">Add a screenshot</span>
            <span className="text-[10px]">PNG, JPG or WebP</span>
          </button>
        )}
      </Section>

      {shot.src ? (
        <>
          <Section title="Frame">
            <Segmented<FrameStyle>
              value={shot.frame}
              options={[
                { value: "none", label: "None" },
                { value: "browser", label: "Browser" },
                { value: "window", label: "Window" },
              ]}
              onChange={(value) =>
                update((draft) => {
                  draft.shot.frame = value;
                })
              }
            />

            {shot.frame !== "none" ? (
              <>
                <div className="space-y-1.5">
                  <span className="text-[11px] font-medium text-white/65">
                    Frame theme
                  </span>
                  <Segmented<FrameTheme>
                    value={shot.frameTheme}
                    size="sm"
                    options={[
                      { value: "light", label: "Light" },
                      { value: "dark", label: "Dark" },
                    ]}
                    onChange={(value) =>
                      update((draft) => {
                        draft.shot.frameTheme = value;
                      })
                    }
                  />
                </div>

                {shot.frame === "browser" ? (
                  <label className="block space-y-1.5">
                    <span className="text-[11px] font-medium text-white/65">
                      Address
                    </span>
                    <Input
                      value={shot.url}
                      placeholder="yourproject.com"
                      onChange={(event) =>
                        update(
                          (draft) => {
                            draft.shot.url = event.target.value;
                          },
                          { merge: "shot-url" },
                        )
                      }
                      className="h-8  border-white/10 bg-white/4 text-[11px] text-white/80"
                    />
                  </label>
                ) : null}
              </>
            ) : null}
          </Section>

          <Section title="Placement">
            <Slider
              label="Scale"
              value={Math.round(shot.scale * 100)}
              min={55}
              max={100}
              onChange={(value) =>
                update(
                  (draft) => {
                    draft.shot.scale = value / 100;
                  },
                  { history: false },
                )
              }
              format={(value) => `${value}%`}
            />
            <Slider
              label="Tilt"
              value={shot.rotate}
              min={-8}
              max={8}
              step={0.5}
              onChange={(value) =>
                update(
                  (draft) => {
                    draft.shot.rotate = value;
                  },
                  { history: false },
                )
              }
              format={(value) => `${value}°`}
            />
            <Slider
              label="Corner radius"
              value={shot.radius}
              min={0}
              max={40}
              onChange={(value) =>
                update(
                  (draft) => {
                    draft.shot.radius = value;
                  },
                  { history: false },
                )
              }
              format={(value) => `${value}px`}
            />
            <Slider
              label="Shadow"
              value={shot.shadow}
              min={0}
              max={100}
              onChange={(value) =>
                update(
                  (draft) => {
                    draft.shot.shadow = value;
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
                  draft.shot.x = 0.5;
                  draft.shot.y = 0.5;
                  draft.shot.scale = 0.94;
                  draft.shot.rotate = 0;
                })
              }
            >
              <RotateCcw size={13} />
              Center & fit
            </Button>
          </Section>
        </>
      ) : null}
    </div>
  );
}
