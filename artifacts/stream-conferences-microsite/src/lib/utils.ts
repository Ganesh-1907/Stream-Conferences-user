import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getNameInitials(name?: string, fallback: string = 'S'): string {
  if (!name || !name.trim()) return fallback;

  // Clean honorific prefixes like Dr., Prof., Mr., Mrs., Ms., Doctor, Er. etc.
  const cleaned = name
    .trim()
    .replace(/^(dr\.|dr|prof\.|prof|mr\.|mr|mrs\.|mrs|ms\.|ms|doctor|er\.|er)\b\s+/i, '')
    .trim();

  if (!cleaned) return name.charAt(0).toUpperCase() || fallback;

  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  const firstInitial = parts[0].charAt(0).toUpperCase();
  const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
  return `${firstInitial}${lastInitial}`;
}

export const compressImage = async (
  file: File,
  maxSizeBytes: number = 5 * 1024 * 1024,
): Promise<File> => {
  if (!file) throw new Error('No file selected');
  const FIVE_MB = 5 * 1024 * 1024;

  if (file.type.startsWith('image/') && file.type !== 'image/gif' && file.type !== 'image/svg+xml') {
    if (file.size > 1.5 * 1024 * 1024) {
      try {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result || ''));
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        });

        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const image = new Image();
          image.onload = () => resolve(image);
          image.onerror = () => reject(new Error('Failed to load image'));
          image.src = dataUrl;
        });

        let width = img.naturalWidth;
        let height = img.naturalHeight;
        const MAX_DIM = 1920;
        if (width > MAX_DIM || height > MAX_DIM) {
          const scale = Math.min(MAX_DIM / width, MAX_DIM / height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const originalType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
          let quality = 0.85;
          let blob: Blob | null = null;

          while (quality >= 0.4) {
            blob = await new Promise<Blob | null>((resolve) =>
              canvas.toBlob(resolve, originalType, quality),
            );
            if (blob && blob.size <= FIVE_MB) break;
            quality -= 0.1;
          }

          if (blob) {
            const ext = originalType === 'image/png' ? 'png' : 'jpg';
            const name = file.name.replace(/\.[^.]+$/, '') || 'image';
            const compressed = new File([blob], `${name}.${ext}`, { type: originalType });
            if (compressed.size <= FIVE_MB) return compressed;
          }
        }
      } catch (err) {
        console.warn('Image compression skipped:', err);
      }
    }
  }

  if (file.size > FIVE_MB) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    throw new Error(`File size (${sizeMb} MB) exceeds maximum allowed limit of 5 MB.`);
  }

  return file;
};
