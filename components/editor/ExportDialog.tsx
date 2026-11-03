"use client";

import { Clipboard, Download, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { downloadBlob } from "@/lib/download";
import {
  copyPngToClipboard,
  renderExport,
  type ExportFormat,
} from "@/lib/export";
import { useEditor } from "@/lib/store";
import { Segmented } from "./ui/Segmented";

const FORMATS: { value: ExportFormat; label: string }[] = [
  { value: "png", label: "PNG" },
  { value: "jpg", label: "JPG" },
  { value: "webp", label: "WebP" },
  { value: "svg", label: "SVG" },
];

const SCALES = [
  { value: "1", label: "1×" },
  { value: "2", label: "2×" },
  { value: "3", label: "3×" },
];

export function ExportDialog() {
  const open = useEditor((s) => s.exportOpen);
  const close = useEditor((s) => s.closeExport);
  const doc = useEditor((s) => s.doc);
  const update = useEditor((s) => s.update);
  const notify = useEditor((s) => s.notify);
  const [busy, setBusy] = useState<"download" | "copy" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) setError(null);
  }, [open]);

  const scale = doc.export.scale;

  const download = async () => {
    setBusy("download");
    setError(null);
    try {
      const { blob, filename } = await renderExport(
        doc,
        doc.export.format,
        scale,
      );
      downloadBlob(blob, filename);
      notify(`Exported ${filename}`);
      close();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Export failed");
    } finally {
      setBusy(null);
    }
  };

  const copy = async () => {
    setBusy("copy");
    setError(null);
    try {
      await copyPngToClipboard(doc, scale);
      notify("PNG copied to clipboard");
      close();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Copy failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? null : close())}>
      <DialogContent className="gap-5 rounded-xl border border-white/10 p-5 sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Export image</DialogTitle>
          <DialogDescription>
            Download a pixel-perfect render of this canvas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Format
            </span>
            <Segmented<ExportFormat>
              value={doc.export.format}
              options={FORMATS}
              onChange={(format) =>
                update((draft) => {
                  draft.export.format = format;
                })
              }
            />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Resolution
            </span>
            <Segmented
              value={String(scale)}
              options={SCALES}
              onChange={(value) =>
                update((draft) => {
                  draft.export.scale = Number(value) as 1 | 2 | 3;
                })
              }
            />
          </div>

          <div className="flex items-center justify-between rounded-md border border-white/10 bg-white/[0.03] px-3 py-2.5">
            <span className="text-[11px] text-white/45">Output</span>
            <span className="font-mono text-[11px] tabular-nums text-white/80">
              {doc.canvas.width * scale} × {doc.canvas.height * scale} px
            </span>
          </div>

          <p className="text-[10px] leading-relaxed text-white/35">
            Fonts and the screenshot are embedded in the file.{" "}
            {doc.backgroundEnabled
              ? "Turn the background off to export a transparent PNG."
              : "Background is off — PNG and WebP keep transparency."}
          </p>

          {error ? (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-[10px] text-destructive">
              {error}
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            className="border-white/10 bg-white/[0.04] text-white/75 hover:bg-white/[0.08] hover:text-white"
            onClick={copy}
            disabled={busy !== null || doc.export.format === "svg"}
          >
            {busy === "copy" ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Clipboard size={13} />
            )}
            Copy PNG
          </Button>
          <Button variant="mint" onClick={download} disabled={busy !== null}>
            {busy === "download" ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Download size={13} />
            )}
            {busy === "download" ? "Exporting…" : "Download"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
