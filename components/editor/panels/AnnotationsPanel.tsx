"use client";

import {
  ArrowUpRight,
  Copy,
  Eye,
  EyeOff,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { selectedAnnotation, useEditor } from "@/lib/store";
import type { AnnotationTone } from "@/lib/types";
import { cn } from "@/lib/utils";
import { IconButton } from "../ui/IconButton";
import { Section } from "../ui/Section";
import { Segmented } from "../ui/Segmented";
import { Slider } from "../ui/Slider";
import { Toggle } from "../ui/Toggle";

export function AnnotationsPanel() {
  const doc = useEditor((s) => s.doc);
  const selected = useEditor((s) => s.selected);
  const note = useEditor(selectedAnnotation);
  const select = useEditor((s) => s.select);
  const addAnnotation = useEditor((s) => s.addAnnotation);
  const duplicateAnnotation = useEditor((s) => s.duplicateAnnotation);
  const removeAnnotation = useEditor((s) => s.removeAnnotation);
  const update = useEditor((s) => s.update);

  return (
    <div className="space-y-6">
      <Section
        title="Callouts"
        action={
          <Button
            variant="ghost"
            size="sm"
            className="text-white/55 hover:text-white"
            onClick={addAnnotation}
          >
            <Plus size={13} />
            Add
          </Button>
        }
      >
        {doc.annotations.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/15 bg-white/[0.02] px-4 py-7 text-center">
            <p className="text-[11px] font-medium text-white/70">
              No callouts yet
            </p>
            <p className="mx-auto mt-1 max-w-[220px] text-[10px] leading-relaxed text-white/35">
              Point at the detail people should notice, then drag it anywhere
              on the canvas.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/[0.08] hover:text-white"
              onClick={addAnnotation}
            >
              <Plus size={13} />
              Add callout
            </Button>
          </div>
        ) : (
          <div className="space-y-1">
            {doc.annotations.map((item, index) => {
              const active =
                selected?.kind === "annotation" && selected.id === item.id;
              return (
                <div
                  key={item.id}
                  className={cn(
                    "group flex items-center gap-1 rounded-md border px-1 py-1 transition-colors",
                    active
                      ? "border-[#2f6b43] bg-[#10231a]"
                      : "border-transparent hover:bg-white/[0.04]",
                  )}
                >
                  <button
                    type="button"
                    onClick={() =>
                      select({ kind: "annotation", id: item.id })
                    }
                    className="min-w-0 flex-1 px-1 py-0.5 text-left"
                  >
                    <span
                      className={cn(
                        "flex items-center gap-1.5 truncate text-[11px] font-medium",
                        item.visible ? "text-white/80" : "text-white/35",
                      )}
                    >
                      <span className="grid size-4 shrink-0 place-items-center rounded-[3px] border border-white/10 bg-white/[0.04] font-mono text-[9px] text-white/40">
                        {index + 1}
                      </span>
                      {item.title || `Callout ${index + 1}`}
                    </span>
                    <span className="mt-0.5 block truncate pl-[22px] text-[10px] text-white/30">
                      {item.body || "Empty note"}
                    </span>
                  </button>
                  <IconButton
                    size="sm"
                    title={item.visible ? "Hide callout" : "Show callout"}
                    onClick={() =>
                      update((draft) => {
                        const target = draft.annotations.find(
                          (entry) => entry.id === item.id,
                        );
                        if (target) target.visible = !target.visible;
                      })
                    }
                  >
                    {item.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                  </IconButton>
                  <IconButton
                    size="sm"
                    title="Delete callout"
                    onClick={() => removeAnnotation(item.id)}
                  >
                    <Trash2 size={13} />
                  </IconButton>
                </div>
              );
            })}
          </div>
        )}
      </Section>

      {note ? (
        <Section
          title="Selected callout"
          action={
            <span className="inline-flex items-center gap-1 text-[9.5px] text-white/30">
              <ArrowUpRight size={11} />
              drag on canvas
            </span>
          }
        >
          <label className="block space-y-1.5">
            <span className="text-[11px] font-medium text-white/65">
              Title
            </span>
            <Input
              value={note.title}
              placeholder="A short headline"
              onChange={(event) =>
                update(
                  (draft) => {
                    const target = draft.annotations.find(
                      (entry) => entry.id === note.id,
                    );
                    if (target) target.title = event.target.value;
                  },
                  { merge: `note-title-${note.id}` },
                )
              }
              className="h-8 rounded-md border-white/10 bg-white/[0.04] text-[11px] text-white/80"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-[11px] font-medium text-white/65">
              Text
            </span>
            <Textarea
              value={note.body}
              placeholder="Explain what makes this detail useful."
              onChange={(event) =>
                update(
                  (draft) => {
                    const target = draft.annotations.find(
                      (entry) => entry.id === note.id,
                    );
                    if (target) target.body = event.target.value;
                  },
                  { merge: `note-body-${note.id}` },
                )
              }
              className="min-h-[76px] resize-none rounded-md border-white/10 bg-white/[0.04] text-[11px] leading-relaxed text-white/80"
            />
          </label>

          <div className="space-y-1.5">
            <span className="text-[11px] font-medium text-white/65">
              Tone
            </span>
            <Segmented<AnnotationTone>
              value={note.tone}
              size="sm"
              options={[
                { value: "light", label: "Light" },
                { value: "dark", label: "Dark" },
                { value: "accent", label: "Accent" },
              ]}
              onChange={(value) =>
                update((draft) => {
                  const target = draft.annotations.find(
                    (entry) => entry.id === note.id,
                  );
                  if (target) target.tone = value;
                })
              }
            />
          </div>

          <Slider
            label="Card width"
            value={Math.round(note.width * 100)}
            min={14}
            max={44}
            onChange={(value) =>
              update(
                (draft) => {
                  const target = draft.annotations.find(
                    (entry) => entry.id === note.id,
                  );
                  if (target) target.width = value / 100;
                },
                { history: false },
              )
            }
            format={(value) => `${value}%`}
          />

          <Toggle
            label="Arrow mark"
            description="A small arrow in the bottom corner"
            checked={note.arrow}
            onChange={(checked) =>
              update((draft) => {
                const target = draft.annotations.find(
                  (entry) => entry.id === note.id,
                );
                if (target) target.arrow = checked;
              })
            }
          />

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/[0.08] hover:text-white"
              onClick={() => duplicateAnnotation(note.id)}
            >
              <Copy size={13} />
              Duplicate
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white/40 hover:text-[#f87171]"
              onClick={() => removeAnnotation(note.id)}
            >
              <Trash2 size={13} />
              Delete
            </Button>
          </div>
        </Section>
      ) : null}
    </div>
  );
}
