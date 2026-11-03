"use client";

import { useEffect, useRef, useState } from "react";
import { useEditor } from "@/lib/store";
import { ControlDock } from "./ControlDock";
import { PreviewBar } from "./PreviewBar";
import { SceneCanvas } from "./SceneCanvas";

const BAR_HEIGHT = 38;
const BAR_GAP = 10;

export function Stage() {
  const doc = useEditor((s) => s.doc);
  const inspectorOpen = useEditor((s) => s.inspectorOpen);
  const hostRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const update = () => {
      setSize({ width: host.clientWidth, height: host.clientHeight });
      setReady(true);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  const sideReserve =
    inspectorOpen && size.width > 1100 ? Math.min(360, size.width - 720) : 0;
  const availableWidth = Math.max(220, size.width - 120 - sideReserve);
  const availableHeight = Math.max(
    200,
    size.height - 168 - BAR_HEIGHT - BAR_GAP,
  );
  const scale = Math.min(
    availableWidth / doc.canvas.width,
    availableHeight / doc.canvas.height,
    1,
  );
  const canvasWidth = doc.canvas.width * scale;
  const barWidth = Math.min(
    Math.max(340, canvasWidth),
    Math.max(340, availableWidth),
  );

  return (
    <div
      ref={hostRef}
      className="slate-studio relative h-full w-full overflow-hidden"
    >
      <div
        className="absolute inset-0 flex flex-col items-center justify-center pb-36 pt-8 transition-[padding] duration-200 ease-out"
        style={{ paddingLeft: 32, paddingRight: 32 + sideReserve }}
      >
        {ready && scale > 0 ? (
          <div
            className="flex flex-col items-center"
            style={{ gap: BAR_GAP }}
          >
            <SceneCanvas scale={scale} />
            <div style={{ width: barWidth }}>
              <PreviewBar scale={scale} />
            </div>
          </div>
        ) : null}
      </div>

      <div
        className="pointer-events-none absolute inset-y-0 bottom-0 left-0 z-20 flex items-end justify-center px-4 pb-5"
        style={{ right: sideReserve }}
      >
        <div className="pointer-events-auto max-w-full">
          <ControlDock />
        </div>
      </div>
    </div>
  );
}
