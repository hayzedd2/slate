"use client";

import { useCallback } from "react";
import { fileToDataUrl } from "@/lib/images";
import { useEditor } from "@/lib/store";

export function useShotUpload() {
  const update = useEditor((s) => s.update);
  const select = useEditor((s) => s.select);
  const setPanel = useEditor((s) => s.setPanel);
  const notify = useEditor((s) => s.notify);

  return useCallback(
    async (file?: File | null) => {
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        notify("Choose a PNG, JPG, WebP or SVG image");
        return;
      }

      try {
        const src = await fileToDataUrl(file, {
          maxSize: 2400,
          quality: 0.94,
          keepAlpha: true,
        });
        const aspect = await new Promise<number>((resolve) => {
          const image = new Image();
          image.onload = () =>
            resolve(
              image.naturalWidth / Math.max(1, image.naturalHeight),
            );
          image.onerror = () => resolve(1.6);
          image.src = src;
        });

        update((draft) => {
          draft.shot.src = src;
          draft.shot.aspect =
            Number.isFinite(aspect) && aspect > 0 ? aspect : 1.6;
          draft.shot.scale = 0.94;
          draft.shot.rotate = 0;
        });
        select({ kind: "shot" });
        setPanel("shot");
        notify("Screenshot added");
      } catch {
        notify("Could not read that image");
      }
    },
    [update, select, setPanel, notify],
  );
}
