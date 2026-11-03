import type { GradientStop } from "./types";

export type GradientPreset = {
  id: string;
  name: string;
  kind: "linear" | "radial";
  angle: number;
  stops: { color: string; position: number }[];
};

export const GRADIENT_PRESETS: GradientPreset[] = [
  {
    id: "sand",
    name: "Sand",
    kind: "linear",
    angle: 150,
    stops: [
      { color: "#faf6ee", position: 0 },
      { color: "#efe6d8", position: 55 },
      { color: "#e3d5c1", position: 100 },
    ],
  },
  {
    id: "mint",
    name: "Mint",
    kind: "linear",
    angle: 160,
    stops: [
      { color: "#f0fdf4", position: 0 },
      { color: "#d1fae5", position: 52 },
      { color: "#a7f3d0", position: 100 },
    ],
  },
  {
    id: "peach",
    name: "Peach",
    kind: "linear",
    angle: 135,
    stops: [
      { color: "#fff7ed", position: 0 },
      { color: "#ffedd5", position: 50 },
      { color: "#fed7aa", position: 100 },
    ],
  },
  {
    id: "sky",
    name: "Sky",
    kind: "linear",
    angle: 150,
    stops: [
      { color: "#f0f9ff", position: 0 },
      { color: "#dbeafe", position: 50 },
      { color: "#bfdbfe", position: 100 },
    ],
  },
  {
    id: "lilac",
    name: "Lilac",
    kind: "linear",
    angle: 145,
    stops: [
      { color: "#faf5ff", position: 0 },
      { color: "#ede9fe", position: 52 },
      { color: "#ddd6fe", position: 100 },
    ],
  },
  {
    id: "blush",
    name: "Blush",
    kind: "linear",
    angle: 140,
    stops: [
      { color: "#fff1f2", position: 0 },
      { color: "#ffe4e6", position: 52 },
      { color: "#fecdd3", position: 100 },
    ],
  },
  {
    id: "graphite",
    name: "Graphite",
    kind: "linear",
    angle: 145,
    stops: [
      { color: "#475569", position: 0 },
      { color: "#1e293b", position: 55 },
      { color: "#0f172a", position: 100 },
    ],
  },
  {
    id: "cobalt",
    name: "Cobalt",
    kind: "linear",
    angle: 145,
    stops: [
      { color: "#1e3a8a", position: 0 },
      { color: "#172554", position: 55 },
      { color: "#0b102e", position: 100 },
    ],
  },
  {
    id: "violet-glow",
    name: "Violet glow",
    kind: "radial",
    angle: 90,
    stops: [
      { color: "#8b5cf6", position: 0 },
      { color: "#4c1d95", position: 60 },
      { color: "#12071f", position: 100 },
    ],
  },
];

export type MeshPreset = {
  id: string;
  name: string;
  colors: [string, string, string, string];
  base: string;
  intensity: number;
};

export const MESH_PRESETS: MeshPreset[] = [
  {
    id: "lilac",
    name: "Lilac",
    colors: ["#ddd6fe", "#fbcfe8", "#c4b5fd", "#e9d5ff"],
    base: "#faf5ff",
    intensity: 72,
  },
  {
    id: "aurora",
    name: "Aurora",
    colors: ["#7c3aed", "#2563eb", "#db2777", "#22d3ee"],
    base: "#0a0a12",
    intensity: 82,
  },
  {
    id: "peach",
    name: "Peach",
    colors: ["#fed7aa", "#fecdd3", "#fde68a", "#fbcfe8"],
    base: "#fffaf4",
    intensity: 68,
  },
  {
    id: "lagoon",
    name: "Lagoon",
    colors: ["#0f766e", "#06b6d4", "#1d4ed8", "#a3e635"],
    base: "#06131a",
    intensity: 72,
  },
  {
    id: "ember",
    name: "Ember",
    colors: ["#7c2d12", "#dc2626", "#f59e0b", "#facc15"],
    base: "#160a05",
    intensity: 80,
  },
  {
    id: "noir",
    name: "Noir",
    colors: ["#111827", "#374151", "#6b7280", "#e5e7eb"],
    base: "#08090c",
    intensity: 58,
  },
];

export function gradientCss(preset: GradientPreset): string {
  const stops = [...preset.stops]
    .sort((a, b) => a.position - b.position)
    .map((stop) => `${stop.color} ${stop.position}%`)
    .join(", ");
  return preset.kind === "radial"
    ? `radial-gradient(circle at 50% 45%, ${stops})`
    : `linear-gradient(${preset.angle}deg, ${stops})`;
}

export function meshCss(preset: MeshPreset): string {
  return [
    `radial-gradient(at 18% 22%, ${preset.colors[0]} 0px, transparent 52%)`,
    `radial-gradient(at 82% 18%, ${preset.colors[1]} 0px, transparent 50%)`,
    `radial-gradient(at 24% 82%, ${preset.colors[2]} 0px, transparent 54%)`,
    `radial-gradient(at 78% 78%, ${preset.colors[3]} 0px, transparent 52%)`,
    preset.base,
  ].join(", ");
}

export function stopsFromPreset(preset: GradientPreset): GradientStop[] {
  return preset.stops.map((stop, index) => ({
    id: `${preset.id}-${index}`,
    color: stop.color,
    position: stop.position,
  }));
}

export function isGradientPresetActive(
  preset: GradientPreset,
  stops: GradientStop[],
  kind: string,
): boolean {
  if (preset.kind !== kind || preset.stops.length !== stops.length) return false;
  const sortedA = [...preset.stops].sort((a, b) => a.position - b.position);
  const sortedB = [...stops].sort((a, b) => a.position - b.position);
  return sortedA.every(
    (stop, index) =>
      stop.color.toLowerCase() === sortedB[index]?.color.toLowerCase() &&
      Math.abs(stop.position - sortedB[index]?.position) < 0.6,
  );
}
