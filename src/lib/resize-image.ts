const MAX_DIMENSION = 800;
const JPEG_QUALITY = 0.85;

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("IMAGE_LOAD_FAILED"));
    };

    image.src = url;
  });
}

function scaledDimensions(
  width: number,
  height: number,
  maxDimension: number,
): { width: number; height: number } {
  if (width <= maxDimension && height <= maxDimension) {
    return { width, height };
  }

  const ratio = Math.min(maxDimension / width, maxDimension / height);
  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio),
  };
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("CANVAS_EXPORT_FAILED"));
          return;
        }
        resolve(blob);
      },
      mimeType,
      quality,
    );
  });
}

export type AvatarOutputFormat = "jpeg" | "webp";

export async function resizeImageForAvatar(
  file: File,
  format: AvatarOutputFormat = "jpeg",
): Promise<File> {
  const image = await loadImageFromFile(file);
  const { width, height } = scaledDimensions(
    image.naturalWidth,
    image.naturalHeight,
    MAX_DIMENSION,
  );

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("CANVAS_CONTEXT_FAILED");
  }

  context.drawImage(image, 0, 0, width, height);

  const mimeType = format === "webp" ? "image/webp" : "image/jpeg";
  const extension = format === "webp" ? "webp" : "jpg";
  const blob = await canvasToBlob(canvas, mimeType, JPEG_QUALITY);

  const baseName = file.name.replace(/\.[^.]+$/, "") || "avatar";
  return new File([blob], `${baseName}.${extension}`, {
    type: mimeType,
    lastModified: Date.now(),
  });
}
