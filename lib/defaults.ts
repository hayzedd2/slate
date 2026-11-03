import type { Annotation, Doc } from "./types";

export const DEFAULT_DOC: Doc = {
  version: 2,
  name: "Untitled shot",
  canvas: {
    width: 1600,
    height: 1000,
    radius: 26,
    padding: 0.075,
  },
  background: {
    type: "solid",
    color: "#efe9df",
  },
  backgroundEnabled: true,
  decor: {
    type: "arcs",
    color: "#c2b49c",
    opacity: 0.55,
    scale: 1,
  },
  shot: {
    src: null,
    aspect: 1.6,
    x: 0.5,
    y: 0.5,
    scale: 0.94,
    rotate: 0,
    radius: 12,
    shadow: 72,
    frame: "browser",
    frameTheme: "light",
    url: "yourproject.com",
  },
  annotations: [],
  export: {
    format: "png",
    scale: 2,
  },
};

export const SOLID_SWATCHES = [
  "#efe9df",
  "#f5f2ea",
  "#fdf6ee",
  "#fdece3",
  "#fef3c7",
  "#ecfdf5",
  "#e0f2fe",
  "#ede9fe",
  "#fce7f3",
  "#e7e5e4",
  "#d6d3d1",
  "#a8a29e",
  "#57534e",
  "#292524",
  "#101014",
  "#1e3a8a",
  "#0f766e",
  "#7c2d12",
  "#831843",
  "#4c1d95",
  "#22c55e",
  "#f97316",
];

export const CANVAS_PRESETS = [
  { id: "wide", label: "16:10 · 1600 × 1000", width: 1600, height: 1000 },
  { id: "hd", label: "16:9 · 1600 × 900", width: 1600, height: 900 },
  { id: "classic", label: "4:3 · 1200 × 900", width: 1200, height: 900 },
  { id: "square", label: "Square · 1080 × 1080", width: 1080, height: 1080 },
  { id: "og", label: "OG image · 1200 × 630", width: 1200, height: 630 },
] as const;

export function createAnnotation(index: number): Annotation {
  return {
    id: `note-${Date.now().toString(36)}-${index}`,
    title: "Worth a closer look",
    body: "Use callouts to point at the one detail people should notice.",
    x: 0.62,
    y: 0.58,
    width: 0.24,
    tone: "light",
    arrow: true,
    visible: true,
  };
}
