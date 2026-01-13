export type ImageCompressionOptions = {
  maxDimension?: number;
  quality?: number;
  /** Background color used when source has transparency (default: white) */
  background?: string;
};

const DEFAULT_MAX_DIMENSION = 1200;
const DEFAULT_QUALITY = 0.8;

async function decodeImageBlob(blob: Blob): Promise<{ width: number; height: number; draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void; cleanup?: () => void }> {
  // Prefer createImageBitmap (faster, avoids DOM Image quirks)
  try {
    const bitmap = await createImageBitmap(blob);
    return {
      width: bitmap.width,
      height: bitmap.height,
      draw: (ctx, w, h) => ctx.drawImage(bitmap, 0, 0, w, h),
      cleanup: () => {
        try {
          bitmap.close();
        } catch {
          // ignore
        }
      },
    };
  } catch {
    // Fallback to HTMLImageElement
    const url = URL.createObjectURL(blob);
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new Image();
        el.onload = () => resolve(el);
        el.onerror = () => reject(new Error('Failed to load image'));
        el.src = url;
      });

      return {
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
        draw: (ctx, w, h) => ctx.drawImage(img, 0, 0, w, h),
        cleanup: () => URL.revokeObjectURL(url),
      };
    } catch (e) {
      URL.revokeObjectURL(url);
      throw e;
    }
  }
}

/**
 * Compresses an image Blob by resizing and converting to JPEG.
 * Useful to keep uploads small so PDF generation doesn't exceed compute limits.
 */
export async function compressImageBlobToJpeg(input: Blob, opts: ImageCompressionOptions = {}): Promise<Blob> {
  const maxDimension = opts.maxDimension ?? DEFAULT_MAX_DIMENSION;
  const quality = opts.quality ?? DEFAULT_QUALITY;
  const background = opts.background ?? '#FFFFFF';

  const decoded = await decodeImageBlob(input);

  try {
    let width = decoded.width;
    let height = decoded.height;

    if (width > maxDimension || height > maxDimension) {
      if (width > height) {
        height = Math.round((height * maxDimension) / width);
        width = maxDimension;
      } else {
        width = Math.round((width * maxDimension) / height);
        height = maxDimension;
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    // Use { alpha: false } so the browser can optimize and we control transparency via background fill.
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('Could not get canvas context');

    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);
    decoded.draw(ctx, width, height);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('Failed to compress image'))),
        'image/jpeg',
        quality
      );
    });

    return blob;
  } finally {
    decoded.cleanup?.();
  }
}
