"use client";

import {
  Download,
  FolderDown,
  FolderOpen,
  ImagePlus,
  MessageSquareText,
} from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { downloadText, slugify } from "@/lib/download";
import { useEditor } from "@/lib/store";
import type { Doc } from "@/lib/types";
import { useShotUpload } from "./useShotUpload";

export function TopBar() {
  const doc = useEditor((s) => s.doc);
  const update = useEditor((s) => s.update);
  const replaceDoc = useEditor((s) => s.replaceDoc);
  const openExport = useEditor((s) => s.openExport);
  const openInspector = useEditor((s) => s.openInspector);
  const notify = useEditor((s) => s.notify);
  const upload = useShotUpload();
  const projectRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);

  const saveProject = () => {
    downloadText(
      JSON.stringify(doc, null, 2),
      `${slugify(doc.name)}.slate.json`,
      "application/json",
    );
    notify("Project saved as JSON");
  };

  const openProject = async (file: File | undefined) => {
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text()) as Doc;
      if (
        !parsed ||
        parsed.version !== 2 ||
        !parsed.canvas ||
        !parsed.background ||
        !parsed.decor ||
        !parsed.shot ||
        !Array.isArray(parsed.annotations) ||
        !parsed.export
      ) {
        throw new Error("Invalid project");
      }
      replaceDoc(parsed);
      notify(`Loaded “${parsed.name || file.name}”`);
    } catch {
      notify("That file isn’t a valid Slate project");
    }
  };

  return (
    <header className="relative z-40 flex h-12 shrink-0 items-center gap-2 border-b border-white/10 bg-[#0d0d0f] px-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="grid size-7 shrink-0 place-items-center rounded-md bg-[linear-gradient(145deg,#6ee7b7,#22c55e)] shadow-[0_1px_0_rgba(255,255,255,0.25)_inset]">
          <svg
            width="15"
            height="15"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden
          >
            <rect
              x="3"
              y="4"
              width="14"
              height="9.5"
              rx="1.6"
              fill="#052e16"
              fillOpacity="0.9"
            />
            <rect
              x="3"
              y="14.5"
              width="8.5"
              height="2"
              rx="1"
              fill="#052e16"
              fillOpacity="0.55"
            />
            <path
              d="M5.8 7.2h6"
              stroke="#a7f3d0"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <Input
          value={doc.name}
          onChange={(event) =>
            update(
              (draft) => {
                draft.name = event.target.value;
              },
              { merge: "project-name" },
            )
          }
          onBlur={() => {
            if (!doc.name.trim()) {
              update((draft) => {
                draft.name = "Untitled shot";
              });
            }
          }}
          aria-label="Project name"
          className="h-7 w-33  border-transparent bg-transparent px-1.5 text-[12.5px] font-semibold text-white/90 hover:border-white/10 focus-visible:border-white/20 focus-visible:bg-white/4 focus-visible:ring-0 sm:w-47.5"
        />
      </div>

      <span className="mx-1 hidden h-4 w-px bg-white/10 sm:block" />

      <div className="hidden items-center gap-0.5 md:flex">
        <input
          ref={projectRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(event) => {
            void openProject(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
        <Button
          variant="ghost"
          size="sm"
          className="text-white/55 hover:text-white"
          onClick={() => projectRef.current?.click()}
        >
          <FolderOpen size={14} />
          <span className="hidden lg:inline">Open</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-white/55 hover:text-white"
          onClick={saveProject}
        >
          <FolderDown size={14} />
          <span className="hidden lg:inline">Save</span>
        </Button>
      </div>

      <div className="ml-auto flex items-center gap-1">
        <input
          ref={imageRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="hidden"
          onChange={(event) => {
            void upload(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
        <Button
          variant="ghost"
          size="sm"
          className="text-white/55 hover:text-white"
          onClick={() => imageRef.current?.click()}
        >
          <ImagePlus size={14} />
          <span className="hidden lg:inline">Upload</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="text-white/55 hover:text-white"
          onClick={() => openInspector("annotations")}
        >
          <MessageSquareText size={14} />
          <span className="hidden sm:inline">Callouts</span>
          {doc.annotations.length > 0 ? (
            <span className="ml-0.5 grid size-4 place-items-center rounded-full bg-white/10 font-mono text-[9px] text-white/70">
              {doc.annotations.length}
            </span>
          ) : null}
        </Button>

        <Button
          onClick={openExport}
        >
          Export
        </Button>
      </div>
    </header>
  );
}
