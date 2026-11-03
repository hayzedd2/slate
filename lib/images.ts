export async function fileToDataUrl(
  file: File,
  options: { maxSize?: number; quality?: number; keepAlpha?: boolean } = {},
): Promise<string> {
  const { maxSize = 2400, quality = 0.9, keepAlpha = false } = options;
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

  if (file.type === "image/svg+xml") return dataUrl;

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });

  const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
  if (scale >= 1 && !keepAlpha) return dataUrl;

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  const type = keepAlpha ? "image/png" : "image/jpeg";
  return canvas.toDataURL(type, quality);
}
