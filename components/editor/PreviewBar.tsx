"use client";

import { Redo2, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEditor } from "@/lib/store";

function ratioLabel(width: number, height: number): string {
  const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
  const divisor = gcd(width, height);
  return `${width / divisor}:${height / divisor}`;
}

export function PreviewBar({ scale }: { scale: number }) {
  const doc = useEditor((s) => s.doc);
  const undo = useEditor((s) => s.undo);
  const redo = useEditor((s) => s.redo);
  const canUndo = useEditor((s) => s.past.length > 0);
  const canRedo = useEditor((s) => s.future.length > 0);

  return (
    <div className="flex h-[38px] w-full items-center gap-1 rounded-lg border border-white/10 bg-[#141416]/90 px-1.5 shadow-[0_18px_50px_-24px_rgba(0,0,0,0.9)] backdrop-blur-md">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            title="Undo (⌘Z)"
            onClick={undo}
            disabled={!canUndo}
            className="text-white/45 hover:text-white"
          >
            <Undo2 size={13} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Undo</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            title="Redo (⇧⌘Z)"
            onClick={redo}
            disabled={!canRedo}
            className="text-white/45 hover:text-white"
          >
            <Redo2 size={13} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Redo</TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="mx-1 h-4" />

      <span className="px-1 font-mono text-[10.5px] tabular-nums text-white/50">
        {doc.canvas.width} × {doc.canvas.height}
      </span>
      <span className="rounded-[4px] bg-white/[0.06] px-1.5 py-0.5 text-[9.5px] font-medium text-white/45">
        {ratioLabel(doc.canvas.width, doc.canvas.height)}
      </span>

      <div className="ml-auto flex items-center gap-1.5 pr-1">
        <span className="text-[9px] uppercase tracking-[0.16em] text-white/30">
          Zoom
        </span>
        <span className="font-mono text-[10.5px] tabular-nums text-white/70">
          {Math.round(scale * 100)}%
        </span>
      </div>
    </div>
  );
}
