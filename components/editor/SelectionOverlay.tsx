"use client";

import { annotationMetrics, shotGeometry } from "@/lib/scene";
import type { Doc, Selection } from "@/lib/types";

type Props = {
  doc: Doc;
  selected: Selection;
  scale: number;
  guides: { vertical: boolean; horizontal: boolean };
};

function SelectionLabel({
  x,
  y,
  text,
  unit,
}: {
  x: number;
  y: number;
  text: string;
  unit: number;
}) {
  const height = 17 * unit;
  const fontSize = 10.5 * unit;
  const width = text.length * fontSize * 0.62 + 12 * unit;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={width} height={height} fill="#16a34a" />
      <text
        x={6 * unit}
        y={height / 2}
        dominantBaseline="central"
        fontFamily="Inter, ui-sans-serif, system-ui, sans-serif"
        fontSize={fontSize}
        fontWeight={600}
        fill="#ffffff"
      >
        {text}
      </text>
    </g>
  );
}

export function SelectionOverlay({ doc, selected, scale, guides }: Props) {
  const { canvas } = doc;
  const unit = 1 / Math.max(scale, 0.01);
  const stroke = 1.4 * unit;
  const dash = `${4.5 * unit} ${4 * unit}`;

  const shot = doc.shot.src ? shotGeometry(doc) : null;
  const annotation =
    selected?.kind === "annotation"
      ? doc.annotations.find((item) => item.id === selected.id)
      : null;
  const note =
    annotation?.visible ? annotationMetrics(doc, annotation) : null;

  return (
    <svg
      viewBox={`0 0 ${canvas.width} ${canvas.height}`}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden
    >
      {guides.vertical ? (
        <line
          x1={canvas.width / 2}
          y1={0}
          x2={canvas.width / 2}
          y2={canvas.height}
          stroke="#16a34a"
          strokeWidth={unit}
          strokeDasharray={dash}
          opacity={0.85}
        />
      ) : null}
      {guides.horizontal ? (
        <line
          x1={0}
          y1={canvas.height / 2}
          x2={canvas.width}
          y2={canvas.height / 2}
          stroke="#16a34a"
          strokeWidth={unit}
          strokeDasharray={dash}
          opacity={0.85}
        />
      ) : null}

      {selected?.kind === "shot" && shot ? (
        <g transform={`rotate(${doc.shot.rotate} ${shot.cx} ${shot.cy})`}>
          <rect
            x={shot.x}
            y={shot.y}
            width={shot.totalW}
            height={shot.totalH}
            rx={shot.outerRadius}
            fill="none"
            stroke="#16a34a"
            strokeWidth={stroke}
            strokeDasharray={dash}
          />
          <SelectionLabel
            x={shot.x}
            y={Math.max(2 * unit, shot.y - 21 * unit)}
            text="Screenshot"
            unit={unit}
          />
        </g>
      ) : null}

      {note ? (
        <>
          <rect
            x={note.x}
            y={note.y}
            width={note.width}
            height={note.height}
            rx={note.radius}
            fill="none"
            stroke="#16a34a"
            strokeWidth={stroke}
            strokeDasharray={dash}
          />
          <SelectionLabel
            x={note.x}
            y={Math.max(2 * unit, note.y - 21 * unit)}
            text="Callout"
            unit={unit}
          />
        </>
      ) : null}
    </svg>
  );
}
