"use client";

import { produce } from "immer";
import { create } from "zustand";
import { createAnnotation, DEFAULT_DOC } from "./defaults";
import type { Annotation, Doc, PanelId, Selection } from "./types";

type UpdateOptions = {
  history?: boolean;
  merge?: string;
};

type EditorState = {
  doc: Doc;
  past: Doc[];
  future: Doc[];
  selected: Selection;
  panel: PanelId;
  inspectorOpen: boolean;
  exportOpen: boolean;
  gesture: boolean;
  lastMerge: { key: string; at: number } | null;
  toast: { id: number; message: string } | null;
  update: (recipe: (draft: Doc) => void, options?: UpdateOptions) => void;
  beginGesture: () => void;
  endGesture: () => void;
  undo: () => void;
  redo: () => void;
  select: (selection: Selection) => void;
  setPanel: (panel: PanelId) => void;
  openInspector: (panel?: PanelId) => void;
  closeInspector: () => void;
  openExport: () => void;
  closeExport: () => void;
  setCanvasSize: (width: number, height: number) => void;
  addAnnotation: () => void;
  duplicateAnnotation: (id: string) => void;
  removeAnnotation: (id: string) => void;
  notify: (message: string) => void;
  dismissToast: () => void;
  replaceDoc: (doc: Doc) => void;
  hydrate: (doc: Doc) => void;
};

const MAX_HISTORY = 60;

function cloneDoc(doc: Doc): Doc {
  return structuredClone(doc);
}

function pushSnapshot(
  state: EditorState,
  snapshot: Doc,
  clearFuture = true,
): Partial<EditorState> {
  return {
    past: [...state.past, snapshot].slice(-MAX_HISTORY),
    future: clearFuture ? [] : state.future,
  };
}

export const useEditor = create<EditorState>((set, get) => ({
  doc: cloneDoc(DEFAULT_DOC),
  past: [],
  future: [],
  selected: null,
  panel: "canvas",
  inspectorOpen: false,
  exportOpen: false,
  gesture: false,
  lastMerge: null,
  toast: null,

  update: (recipe, options) => {
    const state = get();
    const snapshot = cloneDoc(state.doc);
    const next = produce(state.doc, recipe);
    if (next === state.doc) return;

    const now = Date.now();
    const shouldMerge =
      Boolean(options?.merge) &&
      state.lastMerge?.key === options?.merge &&
      now - (state.lastMerge?.at ?? 0) < 900;
    const recordHistory =
      options?.history !== false && !state.gesture && !shouldMerge;

    set({
      doc: next,
      ...(recordHistory ? pushSnapshot(state, snapshot) : {}),
      lastMerge: options?.merge ? { key: options.merge, at: now } : null,
    });
  },

  beginGesture: () => {
    const state = get();
    if (state.gesture) return;
    set({
      gesture: true,
      ...pushSnapshot(state, cloneDoc(state.doc)),
      lastMerge: null,
    });
  },

  endGesture: () => set({ gesture: false, lastMerge: null }),

  undo: () => {
    const { past, doc, future } = get();
    if (!past.length) return;
    const previous = past[past.length - 1];
    set({
      doc: previous,
      past: past.slice(0, -1),
      future: [doc, ...future].slice(0, MAX_HISTORY),
      lastMerge: null,
    });
    const selected = get().selected;
    if (
      selected?.kind === "annotation" &&
      !previous.annotations.some((item) => item.id === selected.id)
    ) {
      set({ selected: null });
    }
  },

  redo: () => {
    const { future, doc, past } = get();
    if (!future.length) return;
    const next = future[0];
    set({
      doc: next,
      past: [...past, doc].slice(-MAX_HISTORY),
      future: future.slice(1),
      lastMerge: null,
    });
  },

  select: (selected) => set({ selected }),
  setPanel: (panel) => set({ panel, inspectorOpen: true }),
  openInspector: (panel) =>
    set((state) => ({ inspectorOpen: true, panel: panel ?? state.panel })),
  closeInspector: () => set({ inspectorOpen: false }),
  openExport: () => set({ exportOpen: true }),
  closeExport: () => set({ exportOpen: false }),

  setCanvasSize: (width, height) => {
    const w = Math.max(400, Math.min(4000, Math.round(width)));
    const h = Math.max(400, Math.min(4000, Math.round(height)));
    get().update((draft) => {
      const oldMin = Math.min(draft.canvas.width, draft.canvas.height);
      const newMin = Math.min(w, h);
      const ratio = newMin / oldMin;
      draft.canvas.width = w;
      draft.canvas.height = h;
      draft.canvas.radius = Math.round(draft.canvas.radius * ratio);
      draft.shot.radius = Math.round(draft.shot.radius * ratio);
    });
  },

  addAnnotation: () => {
    const annotation = createAnnotation(get().doc.annotations.length + 1);
    get().update((draft) => {
      draft.annotations.push(annotation);
    });
    set({
      selected: { kind: "annotation", id: annotation.id },
      panel: "annotations",
      inspectorOpen: true,
    });
  },

  duplicateAnnotation: (id) => {
    const source = get().doc.annotations.find((item) => item.id === id);
    if (!source) return;
    const copy: Annotation = {
      ...structuredClone(source),
      id: `note-${Date.now().toString(36)}-copy`,
      x: Math.min(0.94, source.x + 0.03),
      y: Math.min(0.94, source.y + 0.03),
    };
    get().update((draft) => {
      const index = draft.annotations.findIndex((item) => item.id === id);
      draft.annotations.splice(index + 1, 0, copy);
    });
    set({
      selected: { kind: "annotation", id: copy.id },
      panel: "annotations",
      inspectorOpen: true,
    });
  },

  removeAnnotation: (id) => {
    get().update((draft) => {
      draft.annotations = draft.annotations.filter((item) => item.id !== id);
    });
    const selected = get().selected;
    if (selected?.kind === "annotation" && selected.id === id) {
      set({ selected: null });
    }
  },

  notify: (message) => {
    set({ toast: { id: Date.now(), message } });
  },

  dismissToast: () => set({ toast: null }),

  replaceDoc: (doc) => {
    set({
      doc: cloneDoc(doc),
      past: [...get().past, cloneDoc(get().doc)].slice(-MAX_HISTORY),
      future: [],
      selected: null,
      lastMerge: null,
    });
  },

  hydrate: (doc) => {
    set({
      doc: cloneDoc(doc),
      past: [],
      future: [],
      selected: null,
      lastMerge: null,
    });
  },
}));

export function selectedAnnotation(state: EditorState): Annotation | null {
  const selected = state.selected;
  if (selected?.kind !== "annotation") return null;
  return state.doc.annotations.find((item) => item.id === selected.id) ?? null;
}
