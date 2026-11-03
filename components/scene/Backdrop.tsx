import { gradientVector } from "@/lib/gradient";
import type { Doc } from "@/lib/types";

function seeded(seed: number) {
  let state = seed || 1;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function Backdrop({ doc, idPrefix }: { doc: Doc; idPrefix: string }) {
  const { background, canvas } = doc;

  if (background.type === "solid") {
    return (
      <rect width={canvas.width} height={canvas.height} fill={background.color} />
    );
  }

  if (background.type === "gradient") {
    const stops = [...background.stops].sort((a, b) => a.position - b.position);
    const id = `${idPrefix}-backdrop-gradient`;
    return (
      <>
        <defs>
          {background.kind === "linear" ? (
            <linearGradient id={id} {...gradientVector(background.angle)}>
              {stops.map((stop) => (
                <stop
                  key={stop.id}
                  offset={`${Math.min(100, Math.max(0, stop.position))}%`}
                  stopColor={stop.color}
                />
              ))}
            </linearGradient>
          ) : (
            <radialGradient id={id} cx="50%" cy="45%" r="78%">
              {stops.map((stop) => (
                <stop
                  key={stop.id}
                  offset={`${Math.min(100, Math.max(0, stop.position))}%`}
                  stopColor={stop.color}
                />
              ))}
            </radialGradient>
          )}
        </defs>
        <rect width={canvas.width} height={canvas.height} fill={`url(#${id})`} />
      </>
    );
  }

  const random = seeded(background.seed);
  const positions = Array.from({ length: 4 }, () => ({
    cx: 12 + random() * 76,
    cy: 12 + random() * 76,
    r: 42 + random() * 30,
  }));
  const intensity = background.intensity / 100;

  return (
    <>
      <defs>
        {background.colors.map((color, index) => {
          const position = positions[index];
          return (
            <radialGradient
              key={`${color}-${index}`}
              id={`${idPrefix}-mesh-${index}`}
              cx={`${position.cx}%`}
              cy={`${position.cy}%`}
              r={`${position.r}%`}
            >
              <stop offset="0%" stopColor={color} stopOpacity={0.95} />
              <stop
                offset="55%"
                stopColor={color}
                stopOpacity={0.5 * intensity + 0.18}
              />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </radialGradient>
          );
        })}
      </defs>
      <rect width={canvas.width} height={canvas.height} fill={background.base} />
      <g opacity={0.6 + intensity * 0.4}>
        {background.colors.map((_, index) => (
          <rect
            key={index}
            width={canvas.width}
            height={canvas.height}
            fill={`url(#${idPrefix}-mesh-${index})`}
          />
        ))}
      </g>
    </>
  );
}

export function Decor({ doc, idPrefix }: { doc: Doc; idPrefix: string }) {
  const { decor, canvas } = doc;
  if (decor.type === "none") return null;

  const unit = Math.min(canvas.width, canvas.height);
  const scale = Math.max(0.4, Math.min(2, decor.scale));
  const opacity = Math.max(0, Math.min(1, decor.opacity));

  if (decor.type === "arcs") {
    const stroke = Math.max(1, unit * 0.0016);
    const dash = `${unit * 0.012 * scale} ${unit * 0.016 * scale}`;
    return (
      <g
        fill="none"
        stroke={decor.color}
        strokeWidth={stroke}
        strokeDasharray={dash}
        strokeLinecap="round"
        opacity={opacity}
      >
        {[0.24, 0.36, 0.48].map((radius) => (
          <circle
            key={`tl-${radius}`}
            cx={unit * 0.04}
            cy={-unit * 0.02}
            r={unit * radius * scale}
          />
        ))}
        {[0.24, 0.36, 0.48].map((radius) => (
          <circle
            key={`br-${radius}`}
            cx={canvas.width - unit * 0.02}
            cy={canvas.height + unit * 0.03}
            r={unit * radius * scale}
          />
        ))}
      </g>
    );
  }

  if (decor.type === "grid") {
    const size = unit * 0.07 * scale;
    const id = `${idPrefix}-decor-grid`;
    return (
      <>
        <defs>
          <pattern
            id={id}
            width={size}
            height={size}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${size} 0 L 0 0 0 ${size}`}
              fill="none"
              stroke={decor.color}
              strokeWidth={Math.max(0.6, unit * 0.0009)}
            />
          </pattern>
        </defs>
        <rect
          width={canvas.width}
          height={canvas.height}
          fill={`url(#${id})`}
          opacity={opacity}
        />
      </>
    );
  }

  if (decor.type === "dots") {
    const size = unit * 0.038 * scale;
    const id = `${idPrefix}-decor-dots`;
    return (
      <>
        <defs>
          <pattern
            id={id}
            width={size}
            height={size}
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx={size / 2}
              cy={size / 2}
              r={Math.max(0.9, unit * 0.0022)}
              fill={decor.color}
            />
          </pattern>
        </defs>
        <rect
          width={canvas.width}
          height={canvas.height}
          fill={`url(#${id})`}
          opacity={opacity}
        />
      </>
    );
  }

  const inset = unit * 0.028;
  return (
    <rect
      x={inset}
      y={inset}
      width={canvas.width - inset * 2}
      height={canvas.height - inset * 2}
      rx={unit * 0.016}
      fill="none"
      stroke={decor.color}
      strokeWidth={Math.max(1, unit * 0.0014)}
      strokeDasharray={`${unit * 0.007} ${unit * 0.009}`}
      opacity={opacity}
    />
  );
}
