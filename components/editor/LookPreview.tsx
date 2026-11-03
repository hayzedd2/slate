"use client";

import { backgroundCss, type Look } from "@/lib/looks";
import type { Doc } from "@/lib/types";
import { cn } from "@/lib/utils";

export function isLookActive(look: Look, doc: Doc): boolean {
  return (
    JSON.stringify(look.background) === JSON.stringify(doc.background) &&
    look.decor.type === doc.decor.type
  );
}

export function LookPreview({
  look,
  className,
}: {
  look: Look;
  className?: string;
}) {
  const { decor } = look;
  const dark = look.frameTheme === "dark";

  return (
    <div
      className={cn(
        "relative aspect-16/10 w-full overflow-hidden  border border-white/10",
        className,
      )}
      style={{ background: backgroundCss(look.background) }}
    >
      {decor.type !== "none" ? (
        <svg
          viewBox="0 0 100 62"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
          style={{ opacity: decor.opacity }}
          aria-hidden
        >
          {decor.type === "arcs" ? (
            <g
              fill="none"
              stroke={decor.color}
              strokeWidth="0.7"
              strokeDasharray="2 2.4"
            >
              <circle cx="2" cy="-2" r="16" />
              <circle cx="2" cy="-2" r="24" />
              <circle cx="98" cy="64" r="16" />
              <circle cx="98" cy="64" r="24" />
            </g>
          ) : null}
          {decor.type === "grid" ? (
            <g stroke={decor.color} strokeWidth="0.35">
              {Array.from({ length: 10 }, (_, index) => (
                <line
                  key={`v${index}`}
                  x1={index * 11}
                  y1={0}
                  x2={index * 11}
                  y2={62}
                />
              ))}
              {Array.from({ length: 7 }, (_, index) => (
                <line
                  key={`h${index}`}
                  x1={0}
                  y1={index * 10}
                  x2={100}
                  y2={index * 10}
                />
              ))}
            </g>
          ) : null}
          {decor.type === "dots" ? (
            <g fill={decor.color}>
              {Array.from({ length: 9 }, (_, row) =>
                Array.from({ length: 14 }, (_, column) => (
                  <circle
                    key={`${row}-${column}`}
                    cx={4 + column * 7}
                    cy={4 + row * 7}
                    r="0.7"
                  />
                )),
              )}
            </g>
          ) : null}
          {decor.type === "frame" ? (
            <rect
              x="3"
              y="3"
              width="94"
              height="56"
              fill="none"
              stroke={decor.color}
              strokeWidth="0.6"
              strokeDasharray="1.4 1.8"
            />
          ) : null}
        </svg>
      ) : null}

      <div
        className={cn(
          "absolute left-1/2 top-1/2 w-[64%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[3px] border shadow-[0_8px_20px_-8px_rgba(0,0,0,0.55)]",
          dark ? "border-white/15 bg-[#1b1b1f]" : "border-black/10 bg-white",
        )}
      >
        <div
          className={cn(
            "flex h-[11px] items-center gap-[2.5px] border-b px-1.5",
            dark
              ? "border-white/10 bg-[#232327]"
              : "border-black/5 bg-[#f6f4f0]",
          )}
        >
          <span className="size-[2.5px] rounded-full bg-[#f87171]" />
          <span className="size-[2.5px] rounded-full bg-[#fbbf24]" />
          <span className="size-[2.5px] rounded-full bg-[#34d399]" />
        </div>
        <div className="space-y-[3px] p-[7px]">
          <div
            className={cn(
              "h-[3px] w-[46%] rounded-[1px]",
              dark ? "bg-white/70" : "bg-neutral-800/80",
            )}
          />
          <div
            className={cn(
              "h-[2px] w-[82%] rounded-[1px]",
              dark ? "bg-white/20" : "bg-neutral-300",
            )}
          />
          <div
            className={cn(
              "h-[2px] w-[66%] rounded-[1px]",
              dark ? "bg-white/20" : "bg-neutral-300",
            )}
          />
          <div className="mt-[5px] grid grid-cols-3 gap-[3px]">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className={cn(
                  "h-[11px] rounded-[1px] border",
                  dark
                    ? "border-white/10 bg-white/[0.04]"
                    : "border-neutral-200 bg-neutral-50",
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
