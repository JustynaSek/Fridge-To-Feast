export interface CompressionOptions {
  maxWidth: number;
  maxHeight: number;
  quality: number;
  format: 'jpeg' | 'webp' | 'png';
  maintainAspectRatio: boolean;
}

export interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  width: number;
  height: number;
}

const defaultOptions: CompressionOptions = {
  maxWidth: 1024,
  maxHeight: 1024,
  quality: 0.8,
  format: 'jpeg',
  maintainAspectRatio: true
};

export const compressImage = async (
  file: File, 
  options: Partial<CompressionOptions> = {}
): Promise<CompressionResult> => {
  const opts = { ...defaultOptions, ...options };
  
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      try {
        // Calculate new dimensions
        let { width, height } = calculateDimensions(
          img.width, 
          img.height, 
          opts.maxWidth, 
          opts.maxHeight, 
          opts.maintainAspectRatio
        );

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Enable image smoothing for better quality
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
        }

        // Draw and compress image
        ctx?.drawImage(img, 0, 0, width, height);

        // Convert to blob with specified format and quality
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: `image/${opts.format}`,
                lastModified: Date.now(),
              });

              const result: CompressionResult = {
                file: compressedFile,
                originalSize: file.size,
                compressedSize: compressedFile.size,
                compressionRatio: (1 - compressedFile.size / file.size) * 100,
                width,
                height
              };

              resolve(result);
            } else {
              reject(new Error('Failed to create compressed image'));
            }
          },
          `image/${opts.format}`,
          opts.quality
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

const calculateDimensions = (
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number,
  maintainAspectRatio: boolean
): { width: number; height: number } => {
  if (maintainAspectRatio) {
    const ratio = Math.min(maxWidth / originalWidth, maxHeight / originalHeight);
    return {
      width: Math.round(originalWidth * ratio),
      height: Math.round(originalHeight * ratio)
    };
  } else {
    return {
      width: Math.min(originalWidth, maxWidth),
      height: Math.min(originalHeight, maxHeight)
    };
  }
};

// Batch compression for multiple images
export const compressImages = async (
  files: File[],
  options: Partial<CompressionOptions> = {}
): Promise<CompressionResult[]> => {
  const results: CompressionResult[] = [];
  
  for (const file of files) {
    try {
      const result = await compressImage(file, options);
      results.push(result);
    } catch (error) {
      console.error(`Failed to compress ${file.name}:`, error);
      // Return original file if compression fails
      results.push({
        file,
        originalSize: file.size,
        compressedSize: file.size,
        compressionRatio: 0,
        width: 0,
        height: 0
      });
    }
  }
  
  return results;
};

// Smart compression based on file size
export const smartCompress = async (file: File): Promise<CompressionResult> => {
  const fileSizeMB = file.size / (1024 * 1024);
  
  if (fileSizeMB > 10) {
    // Large files: aggressive compression
    return compressImage(file, {
      maxWidth: 800,
      maxHeight: 800,
      quality: 0.6,
      format: 'jpeg'
    });
  } else if (fileSizeMB > 5) {
    // Medium files: moderate compression
    return compressImage(file, {
      maxWidth: 1024,
      maxHeight: 1024,
      quality: 0.7,
      format: 'jpeg'
    });
  } else if (fileSizeMB > 2) {
    // Small files: light compression
    return compressImage(file, {
      maxWidth: 1200,
      maxHeight: 1200,
      quality: 0.8,
      format: 'jpeg'
    });
  } else {
    // Very small files: minimal compression
    return compressImage(file, {
      maxWidth: 1500,
      maxHeight: 1500,
      quality: 0.9,
      format: 'jpeg'
    });
  }
}; 