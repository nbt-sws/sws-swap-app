/**
 * Client-side image downscale before upload.
 * Listing/avatar photos are displayed at most ~1200px wide in the app;
 * uploading 12MP originals wastes bandwidth and slows first paint.
 */
const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.85;

export async function downscaleImage(file: File): Promise<File> {
  // Pass through non-images and already-small files untouched
  if (!file.type.startsWith('image/')) return file;

  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;
  const longest = Math.max(width, height);
  if (longest <= MAX_DIMENSION && file.size < 400 * 1024) {
    bitmap.close();
    return file;
  }

  const scale = Math.min(1, MAX_DIMENSION / longest);
  const w = Math.round(width * scale);
  const h = Math.round(height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  // Always emit JPEG for photos (smaller than source PNG at these sizes)
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY)
  );
  if (!blob) return file;

  const name = file.name.replace(/\.[^.]+$/, '') + '.jpg';
  return new File([blob], name, { type: 'image/jpeg', lastModified: Date.now() });
}
