export type GradientStop = {
  id: string;
  color: string;
  position: number;
};

export type SolidBackground = {
  type: "solid";
  color: string;
};

export type GradientBackground = {
  type: "gradient";
  kind: "linear" | "radial";
  angle: number;
  stops: GradientStop[];
};

export type MeshBackground = {
  type: "mesh";
  colors: [string, string, string, string];
  base: string;
  intensity: number;
  seed: number;
};

export type Background = SolidBackground | GradientBackground | MeshBackground;

export type DecorType = "none" | "arcs" | "grid" | "dots" | "frame";

export type Decor = {
  type: DecorType;
  color: string;
  opacity: number;
  scale: number;
};

export type FrameStyle = "none" | "browser" | "window";
export type FrameTheme = "light" | "dark";

export type Shot = {
  src: string | null;
  aspect: number;
  /** Center of the screenshot, normalized to the canvas. */
  x: number;
  y: number;
  /** Size relative to the largest screenshot that fits the canvas. */
  scale: number;
  rotate: number;
  radius: number;
  shadow: number;
  frame: FrameStyle;
  frameTheme: FrameTheme;
  url: string;
};

export type AnnotationTone = "light" | "dark" | "accent";

export type Annotation = {
  id: string;
  title: string;
  body: string;
  /** Center of the card, normalized to the canvas. */
  x: number;
  y: number;
  /** Card width as a fraction of the canvas width. */
  width: number;
  tone: AnnotationTone;
  arrow: boolean;
  visible: boolean;
};

export type ExportSettings = {
  format: "png" | "jpg" | "webp" | "svg";
  scale: 1 | 2 | 3;
};

export type Doc = {
  version: 2;
  name: string;
  canvas: {
    width: number;
    height: number;
    /** Corner radius in canvas pixels. */
    radius: number;
    /** Breathing room around the screenshot, as a fraction of the short side. */
    padding: number;
  };
  background: Background;
  /** When false the canvas exports transparent (checkerboard in the editor). */
  backgroundEnabled: boolean;
  decor: Decor;
  shot: Shot;
  annotations: Annotation[];
  export: ExportSettings;
};

export type PanelId = "canvas" | "shot" | "annotations";

export type Selection =
  | { kind: "shot" }
  | { kind: "annotation"; id: string }
  | null;
