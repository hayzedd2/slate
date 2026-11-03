import { slugify } from "./download";
import type { Doc } from "./types";

export type ExportFormat = Doc["export"]["format"];

const fontCache = new Map<string, Promise<string>>();

function googleCssUrl(family: string, weights: number[]): string {
  const unique = [...new Set(weights)].sort((a, b) => a - b);
  return `https://fonts.googleapis.com/css2?family=${family.replace(
    / /g,
    "+",
  )}:wght@${unique.join(";")}&display=swap`;
}

function toBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunk = 0x8000;
  let binary = "";
  for (let index = 0; index < bytes.length; index += chunk) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunk));
  }
  return btoa(binary);
}

async function fetchFontFace(family: string, weights: number[]): Promise<string> {
  const key = `${family}:${weights.join(",")}`;
  const cached = fontCache.get(key);
  if (cached) return cached;

  const promise = (async () => {
    const css = await fetch(googleCssUrl(family, weights)).then((response) => {
      if (!response.ok) throw new Error(`Font CSS failed for ${family}`);
      return response.text();
    });

    const blocks: { label: string; body: string }[] = [];
    const labelled = /\/\*\s*([^*]+?)\s*\*\/\s*@font-face\s*{([^}]*)}/g;
    let match: RegExpExecArray | null;
    while ((match = labelled.exec(css))) {
      blocks.push({ label: match[1].trim(), body: match[2] });
    }
    if (!blocks.length) {
      const plain = /@font-face\s*{([^}]*)}/g;
      while ((match = plain.exec(css))) {
        blocks.push({ label: "", body: match[1] });
      }
    }

    const latin = blocks.filter((block) => /^latin$/i.test(block.label));
    const chosen = latin.length ? latin : blocks;

    const rules = await Promise.all(
      chosen.map(async (block) => {
        const weight = /font-weight:\s*([^;]+);/.exec(block.body)?.[1]?.trim() ?? "400";
        const style = /font-style:\s*([^;]+);/.exec(block.body)?.[1]?.trim() ?? "normal";
        const url = /url\((https:\/\/[^)]+)\)/.exec(block.body)?.[1];
        if (!url) return "";
        const buffer = await fetch(url).then((response) => {
          if (!response.ok) throw new Error(`Font file failed for ${family}`);
          return response.arrayBuffer();
        });
        const data = toBase64(buffer);
        return `@font-face{font-family:'${family}';font-style:${style};font-weight:${weight};src:url(data:font/woff2;base64,${data}) format('woff2');}`;
      }),
    );

    return rules.filter(Boolean).join("\n");
  })();

  fontCache.set(key, promise);
  return promise;
}

async function buildSvg(doc: Doc): Promise<string> {
  if (typeof document === "undefined") throw new Error("Export needs a browser");
  const source = document.querySelector<SVGSVGElement>("svg[data-slate-canvas]");
  if (!source) throw new Error("Canvas is not ready yet");

  const clone = source.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
  clone.setAttribute("width", String(doc.canvas.width));
  clone.setAttribute("height", String(doc.canvas.height));
  clone.removeAttribute("style");
  clone.removeAttribute("class");
  clone.removeAttribute("role");
  clone.removeAttribute("aria-label");

  const families = new Map<string, Set<number>>();
  const hasAnnotations = doc.annotations.some(
    (annotation) =>
      annotation.visible &&
      (annotation.title.trim() || annotation.body.trim()),
  );
  if (hasAnnotations || doc.shot.frame === "browser") {
    families.set("Inter", new Set([400, 500, 600]));
  }

  try {
    const rules = await Promise.all(
      [...families].map(([family, weights]) =>
        fetchFontFace(family, [...weights]),
      ),
    );
    const style = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "style",
    );
    style.textContent = rules.join("\n");
    clone.insertBefore(style, clone.firstChild);
  } catch (error) {
    console.warn("Could not embed fonts in export", error);
  }

  return new XMLSerializer().serializeToString(clone);
}

function mimeFor(format: Exclude<ExportFormat, "svg">): string {
  if (format === "jpg") return "image/jpeg";
  if (format === "webp") return "image/webp";
  return "image/png";
}

async function rasterize(
  svg: string,
  width: number,
  height: number,
  format: Exclude<ExportFormat, "svg">,
): Promise<Blob> {
  const url = URL.createObjectURL(
    new Blob([svg], { type: "image/svg+xml;charset=utf-8" }),
  );
  try {
    const image = new Image();
    image.decoding = "sync";
    image.src = url;
    await image.decode();

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(width);
    canvas.height = Math.round(height);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas is unavailable");
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    if (format === "jpg") {
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, mimeFor(format), 0.94),
    );
    if (!blob) throw new Error("Could not encode the image");
    return blob;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function renderExport(
  doc: Doc,
  format: ExportFormat,
  scale: number,
): Promise<{ blob: Blob; filename: string }> {
  const svg = await buildSvg(doc);
  const extension = format === "jpg" ? "jpg" : format;
  const filename = `${slugify(doc.name)}-${doc.canvas.width * scale}x${
    doc.canvas.height * scale
  }.${extension}`;

  if (format === "svg") {
    return {
      blob: new Blob([svg], { type: "image/svg+xml;charset=utf-8" }),
      filename,
    };
  }

  const blob = await rasterize(
    svg,
    doc.canvas.width * scale,
    doc.canvas.height * scale,
    format,
  );
  return { blob, filename };
}

export async function copyPngToClipboard(doc: Doc, scale: number): Promise<void> {
  if (typeof ClipboardItem === "undefined" || !navigator.clipboard?.write) {
    throw new Error("Clipboard images are not supported in this browser");
  }
  const { blob } = await renderExport(doc, "png", scale);
  await navigator.clipboard.write([
    new ClipboardItem({ "image/png": blob }),
  ]);
}
