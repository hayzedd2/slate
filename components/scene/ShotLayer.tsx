import type { PointerEvent } from "react";
import { shotGeometry } from "@/lib/scene";
import type { Doc } from "@/lib/types";

const DOT_COLORS = ["#f87171", "#fbbf24", "#34d399"];

function truncateUrl(url: string, maxChars: number): string {
  const clean = url.replace(/^https?:\/\//, "");
  if (clean.length <= maxChars) return clean;
  return `${clean.slice(0, Math.max(1, maxChars - 1))}…`;
}

export function ShotLayer({
  doc,
  idPrefix,
  onPointerDown,
}: {
  doc: Doc;
  idPrefix: string;
  onPointerDown?: (event: PointerEvent<SVGGElement>) => void;
}) {
  const { shot } = doc;
  if (!shot.src) return null;

  const g = shotGeometry(doc);
  const shadow = Math.max(0, Math.min(100, shot.shadow)) / 100;
  const shadowId = `${idPrefix}-shot-shadow`;
  const clipId = `${idPrefix}-shot-clip`;
  const imageClipId = `${idPrefix}-shot-image-clip`;
  const hairline = Math.max(0.8, g.w * 0.0012);
  const light = shot.frameTheme === "light";
  const outer = light ? "#ffffff" : "#1b1b1f";
  const chrome = light ? "#f6f4f0" : "#232327";
  const border = light ? "rgba(0,0,0,0.09)" : "rgba(255,255,255,0.1)";
  const pill = light ? "#ecebe6" : "#2d2d33";
  const mutedText = light ? "#8b8b83" : "#a1a1aa";
  const chromeH = g.chromeH;
  const pillHeight = chromeH * 0.52;
  const pillWidth = Math.min(g.totalW * 0.54, g.w * 0.62);
  const pillX = g.cx - pillWidth / 2;
  const pillY = g.y + g.pad + (chromeH - pillHeight) / 2;
  const urlSize = Math.max(8, chromeH * 0.29);
  const url = truncateUrl(shot.url, Math.floor(pillWidth / (urlSize * 0.56)));

  const imagePath = g.framed
    ? [
        `M ${g.imageX} ${g.imageY}`,
        `H ${g.imageX + g.imageW}`,
        `V ${g.imageY + g.imageH - g.radius}`,
        `Q ${g.imageX + g.imageW} ${g.imageY + g.imageH} ${
          g.imageX + g.imageW - g.radius
        } ${g.imageY + g.imageH}`,
        `H ${g.imageX + g.radius}`,
        `Q ${g.imageX} ${g.imageY + g.imageH} ${g.imageX} ${
          g.imageY + g.imageH - g.radius
        }`,
        "Z",
      ].join(" ")
    : null;

  const chromePath = [
    `M ${g.x} ${g.y + g.outerRadius}`,
    `Q ${g.x} ${g.y} ${g.x + g.outerRadius} ${g.y}`,
    `H ${g.x + g.totalW - g.outerRadius}`,
    `Q ${g.x + g.totalW} ${g.y} ${g.x + g.totalW} ${g.y + g.outerRadius}`,
    `V ${g.y + g.pad + chromeH}`,
    `H ${g.x}`,
    "Z",
  ].join(" ");

  return (
    <g
      transform={`rotate(${shot.rotate} ${g.cx} ${g.cy})`}
      onPointerDown={onPointerDown}
      style={{ cursor: onPointerDown ? "grab" : undefined }}
    >
      <defs>
        <filter
          id={shadowId}
          x="-35%"
          y="-35%"
          width="170%"
          height="180%"
          colorInterpolationFilters="sRGB"
        >
          <feDropShadow
            dx="0"
            dy={g.w * 0.02 * shadow}
            stdDeviation={Math.max(0.01, g.w * 0.04 * shadow)}
            floodColor="#17120a"
            floodOpacity={0.28 * shadow + 0.03}
          />
        </filter>
        {g.framed ? (
          <clipPath id={imageClipId}>
            <path d={imagePath ?? undefined} />
          </clipPath>
        ) : (
          <clipPath id={clipId}>
            <rect
              x={g.x}
              y={g.y}
              width={g.totalW}
              height={g.totalH}
              rx={g.radius}
            />
          </clipPath>
        )}
      </defs>

      <g filter={shadow > 0 ? `url(#${shadowId})` : undefined}>
        {g.framed ? (
          <>
            <rect
              x={g.x}
              y={g.y}
              width={g.totalW}
              height={g.totalH}
              rx={g.outerRadius}
              fill={outer}
              stroke={border}
              strokeWidth={hairline}
            />
            {chromeH > 0 ? (
              <>
                <path d={chromePath} fill={chrome} />
                {shot.frame === "browser" ? (
                  <>
                    <rect
                      x={pillX}
                      y={pillY}
                      width={pillWidth}
                      height={pillHeight}
                      rx={pillHeight / 2}
                      fill={pill}
                    />
                    <text
                      x={pillX + pillWidth / 2}
                      y={pillY + pillHeight / 2}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontFamily="Inter, ui-sans-serif, system-ui, sans-serif"
                      fontSize={urlSize}
                      fontWeight={500}
                      fill={mutedText}
                    >
                      {url}
                    </text>
                  </>
                ) : null}
                {DOT_COLORS.map((color, index) => (
                  <circle
                    key={color}
                    cx={
                      g.x +
                      g.pad +
                      chromeH * 0.4 +
                      index * chromeH * 0.32
                    }
                    cy={g.y + g.pad + chromeH / 2}
                    r={chromeH * 0.105}
                    fill={color}
                    opacity={0.9}
                  />
                ))}
              </>
            ) : null}
            <image
              href={shot.src}
              x={g.imageX}
              y={g.imageY}
              width={g.imageW}
              height={g.imageH}
              preserveAspectRatio="xMidYMid slice"
              clipPath={`url(#${imageClipId})`}
            />
          </>
        ) : (
          <image
            href={shot.src}
            x={g.x}
            y={g.y}
            width={g.totalW}
            height={g.totalH}
            preserveAspectRatio="xMidYMid slice"
            clipPath={`url(#${clipId})`}
          />
        )}
      </g>
    </g>
  );
}
