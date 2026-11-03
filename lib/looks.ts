import type { Background, Decor, FrameTheme } from "./types";

export type Look = {
  id: string;
  name: string;
  hint: string;
  background: Background;
  decor: Decor;
  frameTheme: FrameTheme;
};

const gradient = (
  id: string,
  colors: string[],
  angle = 145,
): Background => ({
  type: "gradient",
  kind: "linear",
  angle,
  stops: colors.map((color, index) => ({
    id: `${id}-${index}`,
    color,
    position:
      colors.length === 1 ? 0 : Math.round((index / (colors.length - 1)) * 100),
  })),
});

export const LOOKS: Look[] = [
  {
    id: "sand",
    name: "Sand",
    hint: "Warm, quiet, editorial",
    background: { type: "solid", color: "#efe9df" },
    decor: { type: "arcs", color: "#bfae93", opacity: 0.55, scale: 1 },
    frameTheme: "light",
  },
  {
    id: "linen",
    name: "Linen",
    hint: "Paper with a fine frame",
    background: { type: "solid", color: "#f6f3ec" },
    decor: { type: "frame", color: "#d2c7b6", opacity: 0.7, scale: 1 },
    frameTheme: "light",
  },
  {
    id: "mint",
    name: "Mint",
    hint: "Fresh product demo",
    background: gradient("mint", ["#f0fdf4", "#d1fae5", "#a7f3d0"], 160),
    decor: { type: "dots", color: "#34d399", opacity: 0.32, scale: 1 },
    frameTheme: "light",
  },
  {
    id: "lilac",
    name: "Lilac",
    hint: "Soft mesh gradient",
    background: {
      type: "mesh",
      colors: ["#ddd6fe", "#fbcfe8", "#c4b5fd", "#e9d5ff"],
      base: "#faf5ff",
      intensity: 72,
      seed: 4812,
    },
    decor: { type: "none", color: "#ffffff", opacity: 0.2, scale: 1 },
    frameTheme: "light",
  },
  {
    id: "peach",
    name: "Peach",
    hint: "Sunlit and friendly",
    background: gradient("peach", ["#fff7ed", "#ffedd5", "#fed7aa"], 135),
    decor: { type: "arcs", color: "#f0a882", opacity: 0.4, scale: 1 },
    frameTheme: "light",
  },
  {
    id: "sky",
    name: "Sky",
    hint: "Clean technical grid",
    background: gradient("sky", ["#f0f9ff", "#dbeafe", "#bfdbfe"], 150),
    decor: { type: "grid", color: "#60a5fa", opacity: 0.22, scale: 1 },
    frameTheme: "light",
  },
  {
    id: "ink",
    name: "Ink",
    hint: "Dark studio backdrop",
    background: { type: "solid", color: "#101014" },
    decor: { type: "grid", color: "#ffffff", opacity: 0.07, scale: 1 },
    frameTheme: "dark",
  },
  {
    id: "cobalt",
    name: "Cobalt",
    hint: "Deep launch-night blue",
    background: gradient("cobalt", ["#1e3a8a", "#172554", "#0b102e"], 145),
    decor: { type: "arcs", color: "#60a5fa", opacity: 0.28, scale: 1 },
    frameTheme: "dark",
  },
  {
    id: "paper",
    name: "Paper",
    hint: "Soft print-like neutral",
    background: { type: "solid", color: "#f8f5ef" },
    decor: { type: "frame", color: "#d8cfc0", opacity: 0.65, scale: 1 },
    frameTheme: "light",
  },
  {
    id: "ocean",
    name: "Ocean",
    hint: "Airy blue product shot",
    background: gradient("ocean", ["#f0f9ff", "#dbeafe", "#bae6fd"], 155),
    decor: { type: "dots", color: "#0ea5e9", opacity: 0.24, scale: 1 },
    frameTheme: "light",
  },
  {
    id: "sunset",
    name: "Sunset",
    hint: "Warm rose gradient",
    background: gradient("sunset", ["#fff1f2", "#fecdd3", "#fda4af"], 140),
    decor: { type: "arcs", color: "#fb7185", opacity: 0.35, scale: 1 },
    frameTheme: "light",
  },
  {
    id: "forest",
    name: "Forest",
    hint: "Dark green studio",
    background: { type: "solid", color: "#0f2419" },
    decor: { type: "grid", color: "#4ade80", opacity: 0.08, scale: 1 },
    frameTheme: "dark",
  },
];

export function backgroundCss(background: Background): string {
  if (background.type === "solid") return background.color;
  if (background.type === "mesh") {
    return [
      `radial-gradient(at 18% 22%, ${background.colors[0]} 0px, transparent 52%)`,
      `radial-gradient(at 82% 18%, ${background.colors[1]} 0px, transparent 50%)`,
      `radial-gradient(at 24% 82%, ${background.colors[2]} 0px, transparent 54%)`,
      `radial-gradient(at 78% 78%, ${background.colors[3]} 0px, transparent 52%)`,
      background.base,
    ].join(", ");
  }
  const stops = [...background.stops]
    .sort((a, b) => a.position - b.position)
    .map((stop) => `${stop.color} ${stop.position}%`)
    .join(", ");
  return background.kind === "radial"
    ? `radial-gradient(circle at 50% 45%, ${stops})`
    : `linear-gradient(${background.angle}deg, ${stops})`;
}
