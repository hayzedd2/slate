import type { PointerEvent } from "react";
import { ANNOTATION_TONES, annotationMetrics } from "@/lib/scene";
import type { Annotation, Doc } from "@/lib/types";

export function AnnotationCard({
  doc,
  annotation,
  idPrefix,
  onPointerDown,
}: {
  doc: Doc;
  annotation: Annotation;
  idPrefix: string;
  onPointerDown?: (event: PointerEvent<SVGGElement>) => void;
}) {
  if (!annotation.visible) return null;

  const m = annotationMetrics(doc, annotation);
  const tone = ANNOTATION_TONES[annotation.tone];
  const shadowId = `${idPrefix}-note-${annotation.id}`;
  const titleTop = m.y + m.pad;
  const bodyTop =
    titleTop + m.titleLines.length * m.titleLineHeight + m.gap;
  const arrowSize = m.base * 5;
  const arrowX = m.x + m.width - m.pad;
  const arrowY = m.y + m.height - m.pad - m.base * 1.2;

  return (
    <g
      onPointerDown={onPointerDown}
      style={{ cursor: onPointerDown ? "grab" : undefined }}
    >
      <defs>
        <filter
          id={shadowId}
          x="-40%"
          y="-40%"
          width="180%"
          height="190%"
          colorInterpolationFilters="sRGB"
        >
          <feDropShadow
            dx="0"
            dy={m.base * 6}
            stdDeviation={m.base * 10}
            floodColor={tone.shadow}
            floodOpacity={0.55}
          />
        </filter>
      </defs>

      <g filter={`url(#${shadowId})`}>
        <rect
          x={m.x}
          y={m.y}
          width={m.width}
          height={m.height}
          rx={m.radius}
          fill={tone.fill}
          stroke={tone.border}
          strokeWidth={Math.max(0.8, m.base * 0.8)}
        />
      </g>

      {m.titleLines.map((line, index) => (
        <text
          key={`title-${index}`}
          x={m.x + m.pad}
          y={titleTop + index * m.titleLineHeight}
          dominantBaseline="hanging"
          fontFamily="Inter, ui-sans-serif, system-ui, sans-serif"
          fontSize={m.titleSize}
          fontWeight={600}
          letterSpacing={-0.1 * m.base}
          fill={tone.text}
        >
          {line}
        </text>
      ))}

      {m.bodyLines.map((line, index) => (
        <text
          key={`body-${index}`}
          x={m.x + m.pad}
          y={bodyTop + index * m.bodyLineHeight}
          dominantBaseline="hanging"
          fontFamily="Inter, ui-sans-serif, system-ui, sans-serif"
          fontSize={m.bodySize}
          fontWeight={400}
          fill={tone.muted}
        >
          {line}
        </text>
      ))}

      {annotation.arrow ? (
        <path
          d={`M ${arrowX - arrowSize} ${arrowY} H ${arrowX} M ${
            arrowX - arrowSize * 0.4
          } ${arrowY - arrowSize * 0.4} L ${arrowX} ${arrowY} L ${
            arrowX - arrowSize * 0.4
          } ${arrowY + arrowSize * 0.4}`}
          fill="none"
          stroke={tone.text}
          strokeWidth={Math.max(1.1, m.base * 1.4)}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : null}
    </g>
  );
}
