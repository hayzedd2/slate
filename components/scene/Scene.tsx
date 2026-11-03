"use client";

import { useId, type PointerEvent, type Ref } from "react";
import type { Doc } from "@/lib/types";
import { AnnotationCard } from "./AnnotationCard";
import { Backdrop, Decor } from "./Backdrop";
import { ShotLayer } from "./ShotLayer";

type Props = {
  doc: Doc;
  svgRef?: Ref<SVGSVGElement>;
  interactive?: boolean;
  onShotPointerDown?: (event: PointerEvent<SVGGElement>) => void;
  onAnnotationPointerDown?: (
    event: PointerEvent<SVGGElement>,
    id: string,
  ) => void;
  onCanvasPointerDown?: (event: PointerEvent<SVGSVGElement>) => void;
  onPointerMove?: (event: PointerEvent<SVGSVGElement>) => void;
  onPointerUp?: (event: PointerEvent<SVGSVGElement>) => void;
  onPointerCancel?: (event: PointerEvent<SVGSVGElement>) => void;
  className?: string;
};

export function Scene({
  doc,
  svgRef,
  interactive = false,
  onShotPointerDown,
  onAnnotationPointerDown,
  onCanvasPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  className,
}: Props) {
  const rawId = useId();
  const idPrefix = `slate${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const { canvas } = doc;
  const clipId = `${idPrefix}-canvas-clip`;

  return (
    <svg
      ref={svgRef}
      width={canvas.width}
      height={canvas.height}
      viewBox={`0 0 ${canvas.width} ${canvas.height}`}
      className={className}
      onPointerDown={onCanvasPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        touchAction: "none",
      }}
      role="img"
      aria-label={`${doc.name} showcase`}
      data-slate-canvas
    >
      <defs>
        <clipPath id={clipId}>
          <rect
            width={canvas.width}
            height={canvas.height}
            rx={canvas.radius}
            ry={canvas.radius}
          />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        {doc.backgroundEnabled ? (
          <>
            <Backdrop doc={doc} idPrefix={idPrefix} />
            <Decor doc={doc} idPrefix={idPrefix} />
          </>
        ) : null}
        <ShotLayer
          doc={doc}
          idPrefix={idPrefix}
          onPointerDown={interactive ? onShotPointerDown : undefined}
        />
        {doc.annotations.map((annotation) => (
          <AnnotationCard
            key={annotation.id}
            doc={doc}
            annotation={annotation}
            idPrefix={idPrefix}
            onPointerDown={
              interactive
                ? (event) => onAnnotationPointerDown?.(event, annotation.id)
                : undefined
            }
          />
        ))}
      </g>
    </svg>
  );
}
