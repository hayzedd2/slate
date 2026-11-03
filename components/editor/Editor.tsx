"use client";

import { useEffect, useRef } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { loadDoc, saveDoc } from "@/lib/storage";
import { useEditor } from "@/lib/store";
import { ExportDialog } from "./ExportDialog";
import { Inspector } from "./Inspector";
import { Stage } from "./Stage";
import { TopBar } from "./TopBar";
import { Toast } from "./ui/Toast";
import { useShotUpload } from "./useShotUpload";

function isEditable(target: EventTarget | null): boolean {
  const element = target as HTMLElement | null;
  if (!element) return false;
  return (
    element.tagName === "INPUT" ||
    element.tagName === "TEXTAREA" ||
    element.isContentEditable
  );
}

export function Editor() {
  const undo = useEditor((s) => s.undo);
  const redo = useEditor((s) => s.redo);
  const select = useEditor((s) => s.select);
  const openExport = useEditor((s) => s.openExport);
  const closeInspector = useEditor((s) => s.closeInspector);
  const removeAnnotation = useEditor((s) => s.removeAnnotation);
  const upload = useShotUpload();
  const hydrated = useRef(false);

  useEffect(() => {
    const saved = loadDoc();
    if (saved) useEditor.getState().hydrate(saved);
    hydrated.current = true;
  }, []);

  useEffect(() => {
    let timer: number | undefined;
    const unsubscribe = useEditor.subscribe((state, previous) => {
      if (!hydrated.current || state.doc === previous.doc) return;
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        saveDoc(useEditor.getState().doc);
      }, 700);
    });
    return () => {
      unsubscribe();
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isEditable(event.target)) return;
      const meta = event.metaKey || event.ctrlKey;
      if (!meta) {
        if (event.key === "Escape") {
          select(null);
          closeInspector();
          return;
        }
        if (event.key === "Backspace" || event.key === "Delete") {
          const selected = useEditor.getState().selected;
          if (selected?.kind === "annotation") {
            event.preventDefault();
            removeAnnotation(selected.id);
          }
        }
        return;
      }

      const key = event.key.toLowerCase();
      if (key === "z") {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
      }
      if (key === "e") {
        event.preventDefault();
        openExport();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [undo, redo, select, openExport, closeInspector, removeAnnotation]);

  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return;
      const imageItem = Array.from(items).find((item) =>
        item.type.startsWith("image/"),
      );
      const file = imageItem?.getAsFile();
      if (!file) return;
      event.preventDefault();
      void upload(file);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [upload]);

  return (
    <TooltipProvider>
      <div className="flex h-dvh min-h-[620px] flex-col overflow-hidden bg-[#0b0b0d] text-foreground">
        <TopBar />
        <div className="relative min-h-0 flex-1">
          <Stage />
          <Inspector />
        </div>
        <ExportDialog />
        <Toast />
      </div>
    </TooltipProvider>
  );
}
