"use client";

import { ImagePlus, Upload } from "lucide-react";
import type { DragEvent, PointerEvent } from "react";
import { useRef, useState } from "react";
import { Scene } from "@/components/scene/Scene";
import { Button } from "@/components/ui/button";
import { useEditor } from "@/lib/store";
import type { Selection } from "@/lib/types";
import { SelectionOverlay } from "./SelectionOverlay";
import { useShotUpload } from "./useShotUpload";

type Props = {
  scale: number;
};

type DragState = {
  selection: Exclude<Selection, null>;
  pointerId: number;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
  started: boolean;
};

export function SceneCanvas({ scale }: Props) {
  const doc = useEditor((s) => s.doc);
  const selected = useEditor((s) => s.selected);
  const select = useEditor((s) => s.select);
  const update = useEditor((s) => s.update);
  const beginGesture = useEditor((s) => s.beginGesture);
  const endGesture = useEditor((s) => s.endGesture);
  const upload = useShotUpload();
  const svgRef = useRef<SVGSVGElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const [dragging, setDragging] = useState(false);
  const [fileOver, setFileOver] = useState(false);
  const [guides, setGuides] = useState({ vertical: false, horizontal: false });

  const width = doc.canvas.width * scale;
  const height = doc.canvas.height * scale;
  const minSide = Math.min(doc.canvas.width, doc.canvas.height);
  const snapThreshold = 12 / Math.max(1, minSide * scale);

  const startDrag = (
    event: PointerEvent<SVGGElement>,
    selection: Exclude<Selection, null>,
  ) => {
    event.stopPropagation();
    event.preventDefault();

    let originX = 0;
    let originY = 0;
    if (selection.kind === "shot") {
      originX = doc.shot.x;
      originY = doc.shot.y;
    } else {
      const annotation = doc.annotations.find(
        (item) => item.id === selection.id,
      );
      if (!annotation) return;
      originX = annotation.x;
      originY = annotation.y;
    }

    select(selection);
    dragRef.current = {
      selection,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX,
      originY,
      started: false,
    };
    svgRef.current?.setPointerCapture(event.pointerId);
    setDragging(true);
  };

  const onPointerMove = (event: PointerEvent<SVGSVGElement>) => {
    const drag = dragRef.current;
    if (!drag || event.pointerId !== drag.pointerId) return;
    const dx = (event.clientX - drag.startX) / Math.max(1, width);
    const dy = (event.clientY - drag.startY) / Math.max(1, height);
    if (!drag.started) {
      if (Math.abs(dx) < 0.0015 && Math.abs(dy) < 0.0015) return;
      drag.started = true;
      beginGesture();
    }

    let nextX = Math.min(0.98, Math.max(0.02, drag.originX + dx));
    let nextY = Math.min(0.98, Math.max(0.02, drag.originY + dy));
    const snapX = Math.abs(nextX - 0.5) < snapThreshold;
    const snapY = Math.abs(nextY - 0.5) < snapThreshold;
    if (snapX) nextX = 0.5;
    if (snapY) nextY = 0.5;
    setGuides({ vertical: snapX, horizontal: snapY });

    if (drag.selection.kind === "shot") {
      update(
        (draft) => {
          draft.shot.x = nextX;
          draft.shot.y = nextY;
        },
        { history: false },
      );
    } else {
      const id = drag.selection.id;
      update(
        (draft) => {
          const annotation = draft.annotations.find((item) => item.id === id);
          if (!annotation) return;
          annotation.x = nextX;
          annotation.y = nextY;
        },
        { history: false },
      );
    }
  };

  const finishDrag = (event: PointerEvent<SVGSVGElement>) => {
    const drag = dragRef.current;
    if (!drag || event.pointerId !== drag.pointerId) return;
    if (drag.started) endGesture();
    dragRef.current = null;
    setDragging(false);
    setGuides({ vertical: false, horizontal: false });
    if (svgRef.current?.hasPointerCapture(event.pointerId)) {
      svgRef.current.releasePointerCapture(event.pointerId);
    }
  };

  const onDragOver = (event: DragEvent<HTMLDivElement>) => {
    if (!event.dataTransfer.types.includes("Files")) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setFileOver(true);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setFileOver(false);
    void upload(event.dataTransfer.files?.[0]);
  };

  return (
    <div
      className={`relative select-none overflow-hidden shadow-[0_40px_90px_-30px_rgba(0,0,0,0.75),0_12px_28px_-18px_rgba(0,0,0,0.5)] ${
        doc.backgroundEnabled ? "" : "slate-checker"
      }`}
      style={{
        width,
        height,
        borderRadius: doc.canvas.radius * scale,
      }}
      onDragOver={onDragOver}
      onDragLeave={() => setFileOver(false)}
      onDrop={onDrop}
    >
      <Scene
        doc={doc}
        svgRef={svgRef}
        interactive
        onShotPointerDown={(event) =>
          startDrag(event, { kind: "shot" })
        }
        onAnnotationPointerDown={(event, id) =>
          startDrag(event, { kind: "annotation", id })
        }
        onCanvasPointerDown={() => select(null)}
        onPointerMove={onPointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        className={dragging ? "cursor-grabbing" : ""}
      />

      {!doc.shot.src ? (
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <div
            className={`flex w-full max-w-[430px] flex-col items-center gap-3.5 rounded-xl border border-dashed px-6 py-9 text-center backdrop-blur-md transition-colors ${
              fileOver
                ? "border-[#3ddc97] bg-[#0f241a]/95"
                : "border-white/15 bg-[#141416]/80"
            }`}
          >
            <span className="grid size-10 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-[#6ee7b7]">
              <ImagePlus size={18} />
            </span>
            <div>
              <p className="text-sm font-semibold text-white">
                Drop your screenshot here
              </p>
              <p className="mt-1 text-xs text-white/45">
                PNG, JPG or WebP · paste with ⌘V
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileRef.current?.click()}
              className="border-white/15 bg-white/[0.04] text-white/80 hover:bg-white/[0.08] hover:text-white"
            >
              <Upload size={13} />
              Choose image
            </Button>
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
          </div>
        </div>
      ) : null}

      <SelectionOverlay
        doc={doc}
        selected={selected}
        scale={scale}
        guides={guides}
      />
    </div>
  );
}
