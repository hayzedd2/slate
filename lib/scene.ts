import type { Annotation, AnnotationTone, Doc } from "./types";

export const SCENE_FONT =
  "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif";

export const ANNOTATION_TONES: Record<
  AnnotationTone,
  {
    fill: string;
    text: string;
    muted: string;
    border: string;
    shadow: string;
  }
> = {
  light: {
    fill: "#ffffff",
    text: "#1b1b18",
    muted: "#6f6f68",
    border: "rgba(0,0,0,0.08)",
    shadow: "rgba(24,20,12,0.18)",
  },
  dark: {
    fill: "#17171a",
    text: "#f5f5f4",
    muted: "#a1a1aa",
    border: "rgba(255,255,255,0.12)",
    shadow: "rgba(0,0,0,0.42)",
  },
  accent: {
    fill: "#dcfce7",
    text: "#14532d",
    muted: "#3f6b4d",
    border: "rgba(22,163,74,0.28)",
    shadow: "rgba(20,83,45,0.16)",
  },
};

let canvasContext: CanvasRenderingContext2D | null | undefined;

function getContext(): CanvasRenderingContext2D | null {
  if (canvasContext !== undefined) return canvasContext;
  if (typeof document === "undefined") {
    canvasContext = null;
    return null;
  }
  canvasContext = document.createElement("canvas").getContext("2d");
  return canvasContext;
}

export function measureText(
  text: string,
  size: number,
  weight: number = 400,
): number {
  const context = getContext();
  if (!context) return text.length * size * 0.54;
  context.font = `${weight} ${size}px ${SCENE_FONT}`;
  return context.measureText(text).width;
}

export function wrapText(
  text: string,
  maxWidth: number,
  size: number,
  weight: number = 400,
): string[] {
  const paragraphs = text.split("\n");
  const lines: string[] = [];

  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) {
      lines.push("");
      continue;
    }
    const words = paragraph.split(/\s+/).filter(Boolean);
    let current = "";

    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (measureText(candidate, size, weight) <= maxWidth) {
        current = candidate;
        continue;
      }

      if (current) {
        lines.push(current);
        current = "";
      }

      if (measureText(word, size, weight) <= maxWidth) {
        current = word;
        continue;
      }

      let chunk = "";
      for (const character of word) {
        const next = chunk + character;
        if (chunk && measureText(next, size, weight) > maxWidth) {
          lines.push(chunk);
          chunk = character;
        } else {
          chunk = next;
        }
      }
      current = chunk;
    }

    if (current) lines.push(current);
  }

  return lines.length ? lines : [""];
}

export type ShotGeometry = {
  x: number;
  y: number;
  w: number;
  h: number;
  chromeH: number;
  pad: number;
  totalW: number;
  totalH: number;
  cx: number;
  cy: number;
  radius: number;
  outerRadius: number;
  imageX: number;
  imageY: number;
  imageW: number;
  imageH: number;
  framed: boolean;
};

export function shotGeometry(doc: Doc): ShotGeometry {
  const { canvas, shot } = doc;
  const minSide = Math.min(canvas.width, canvas.height);
  const margin = canvas.padding * minSide;
  const maxW = Math.max(80, canvas.width - margin * 2);
  const maxH = Math.max(80, canvas.height - margin * 2);
  const aspect = Math.max(0.2, shot.aspect || 1.6);
  const framed = shot.frame !== "none";
  const chromeRatio =
    shot.frame === "browser" ? 0.062 : shot.frame === "window" ? 0.05 : 0;
  const padRatio = framed ? 0.014 : 0;
  const scale = Math.min(1, Math.max(0.2, shot.scale));

  const maxWidthByWidth = maxW / (1 + padRatio * 2);
  const maxWidthByHeight =
    maxH / (1 / aspect + chromeRatio + padRatio * 2);
  const w = Math.min(maxWidthByWidth, maxWidthByHeight) * scale;
  const h = w / aspect;
  const chromeH = w * chromeRatio;
  const pad = w * padRatio;
  const totalW = w + pad * 2;
  const totalH = h + chromeH + pad * 2;
  const cx = canvas.width * shot.x;
  const cy = canvas.height * shot.y;

  const radius = Math.min(shot.radius, Math.min(w, h) / 2);
  const outerRadius = Math.min(
    radius + pad,
    Math.min(totalW, totalH) / 2,
  );

  return {
    x: cx - totalW / 2,
    y: cy - totalH / 2,
    w,
    h,
    chromeH,
    pad,
    totalW,
    totalH,
    cx,
    cy,
    radius,
    outerRadius,
    imageX: cx - totalW / 2 + pad,
    imageY: cy - totalH / 2 + pad + chromeH,
    imageW: w,
    imageH: h,
    framed,
  };
}

export type AnnotationMetrics = {
  x: number;
  y: number;
  width: number;
  height: number;
  cx: number;
  cy: number;
  pad: number;
  radius: number;
  titleSize: number;
  bodySize: number;
  titleLineHeight: number;
  bodyLineHeight: number;
  titleLines: string[];
  bodyLines: string[];
  gap: number;
  arrowH: number;
  base: number;
};

export function annotationMetrics(
  doc: Doc,
  annotation: Annotation,
): AnnotationMetrics {
  const { canvas } = doc;
  const base = canvas.width / 1600;
  const width =
    Math.min(0.5, Math.max(0.12, annotation.width)) * canvas.width;
  const pad = 20 * base;
  const titleSize = 18 * base;
  const bodySize = 14.5 * base;
  const titleLineHeight = titleSize * 1.32;
  const bodyLineHeight = bodySize * 1.5;
  const innerWidth = Math.max(24, width - pad * 2);

  const titleLines = annotation.title.trim()
    ? wrapText(annotation.title, innerWidth, titleSize, 600)
    : [];
  const bodyLines = annotation.body.trim()
    ? wrapText(annotation.body, innerWidth, bodySize, 400)
    : [];
  const gap = titleLines.length && bodyLines.length ? 7 * base : 0;
  const arrowH = annotation.arrow ? 24 * base : 0;
  const height = Math.max(
    52 * base,
    pad * 2 +
      titleLines.length * titleLineHeight +
      gap +
      bodyLines.length * bodyLineHeight +
      arrowH,
  );
  const cx = annotation.x * canvas.width;
  const cy = annotation.y * canvas.height;

  return {
    x: cx - width / 2,
    y: cy - height / 2,
    width,
    height,
    cx,
    cy,
    pad,
    radius: 15 * base,
    titleSize,
    bodySize,
    titleLineHeight,
    bodyLineHeight,
    titleLines,
    bodyLines,
    gap,
    arrowH,
    base,
  };
}
