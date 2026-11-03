"use client";

import { Check } from "lucide-react";
import { useEffect } from "react";
import { useEditor } from "@/lib/store";

export function Toast() {
  const toast = useEditor((s) => s.toast);
  const dismiss = useEditor((s) => s.dismissToast);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(dismiss, 2600);
    return () => window.clearTimeout(timer);
  }, [toast, dismiss]);

  if (!toast) return null;

  return (
    <div className="pointer-events-none fixed bottom-24 left-1/2 z-[100] -translate-x-1/2">
      <div
        key={toast.id}
        className="animate-pop-in flex items-center gap-2.5 rounded-lg border border-white/10 bg-[#18181b] px-3.5 py-2 text-[11px] font-medium text-white/85 shadow-[0_18px_50px_-10px_rgba(0,0,0,0.7)]"
      >
        <span className="grid h-4 w-4 place-items-center rounded-full bg-[#3ddc97] text-[#04140c]">
          <Check size={11} strokeWidth={3} />
        </span>
        {toast.message}
      </div>
    </div>
  );
}
