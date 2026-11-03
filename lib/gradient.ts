export function gradientVector(angle: number) {
  const radians = (angle * Math.PI) / 180;
  const dx = Math.sin(radians);
  const dy = -Math.cos(radians);
  return {
    x1: `${50 - dx * 50}%`,
    y1: `${50 - dy * 50}%`,
    x2: `${50 + dx * 50}%`,
    y2: `${50 + dy * 50}%`,
  };
}
