/**
 * Compress images to JPEG (max 1920x1920, 80% quality) and validate max file size (5MB).
 */
export async function processFileUpload(file: File, maxMb = 5): Promise<File> {
  if (!file) throw new Error('No file selected');

  const MAX_BYTES = maxMb * 1024 * 1024;

  // 1. If image, attempt canvas compression/resizing
  if (file.type.startsWith('image/') && !file.type.includes('svg')) {
    try {
      const compressedBlob = await compressImage(file, 1920, 1920, 0.82);
      if (compressedBlob) {
        const compressedFile = new File(
          [compressedBlob],
          file.name.replace(/\.[^/.]+$/, '') + '.jpg',
          {
            type: 'image/jpeg',
            lastModified: Date.now(),
          }
        );
        if (compressedFile.size <= MAX_BYTES) {
          return compressedFile;
        }
      }
    } catch (e) {
      console.warn('Image compression failed, checking size limit:', e);
    }
  }

  // 2. Validate max file size
  if (file.size > MAX_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    throw new Error(`File size (${sizeMb} MB) exceeds maximum allowed limit of ${maxMb} MB. Please compress or choose a smaller file.`);
  }

  return file;
}

function compressImage(file: File, maxWidth: number, maxHeight: number, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(null);

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => resolve(blob),
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => resolve(null);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}
