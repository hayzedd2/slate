import type { Doc } from "./types";

const STORAGE_KEY = "slate.project.v2";

export function loadDoc(): Doc | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Doc> | null;
    if (!parsed || parsed.version !== 2) return null;
    if (
      !parsed.canvas ||
      !parsed.background ||
      !parsed.decor ||
      !parsed.shot ||
      !Array.isArray(parsed.annotations) ||
      !parsed.export
    ) {
      return null;
    }
    return {
      ...(parsed as Doc),
      backgroundEnabled: parsed.backgroundEnabled !== false,
    };
  } catch {
    return null;
  }
}

export function saveDoc(doc: Doc) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(doc));
  } catch {
    // Large screenshots can exceed the storage quota. The session still works.
  }
}

export function clearSavedDoc() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore.
  }
}
