// Utility for managing image previews and preventing memory leaks

interface PreviewManager {
  createPreview: (file: File) => string;
  revokePreview: (url: string) => void;
  revokeAllPreviews: () => void;
}

class ImagePreviewManager implements PreviewManager {
  private activePreviews: Set<string> = new Set();

  createPreview(file: File): string {
    const url = URL.createObjectURL(file);
    this.activePreviews.add(url);
    return url;
  }

  revokePreview(url: string): void {
    if (this.activePreviews.has(url)) {
      URL.revokeObjectURL(url);
      this.activePreviews.delete(url);
    }
  }

  revokeAllPreviews(): void {
    this.activePreviews.forEach(url => {
      URL.revokeObjectURL(url);
    });
    this.activePreviews.clear();
  }

  getActiveCount(): number {
    return this.activePreviews.size;
  }
}

// Global instance
export const previewManager = new ImagePreviewManager();

// Helper functions
export const createImagePreview = (file: File): string => {
  return previewManager.createPreview(file);
};

export const revokeImagePreview = (url: string): void => {
  previewManager.revokePreview(url);
};

export const revokeAllImagePreviews = (): void => {
  previewManager.revokeAllPreviews();
};

// Memory usage estimation
export const estimateMemoryUsage = (files: File[]): {
  originalSize: number;
  compressedSize: number;
  totalSize: number;
} => {
  const originalSize = files.reduce((sum, file) => sum + file.size, 0);
  // Estimate compression ratio (typically 20-80% of original)
  const compressedSize = originalSize * 0.3; // 30% of original size
  const totalSize = originalSize + compressedSize;

  return {
    originalSize,
    compressedSize,
    totalSize
  };
};

// Memory warning utility
export const checkMemoryUsage = (files: File[]): {
  isHigh: boolean;
  warning: string | null;
} => {
  const { totalSize } = estimateMemoryUsage(files);
  const totalSizeMB = totalSize / (1024 * 1024);

  if (totalSizeMB > 50) {
    return {
      isHigh: true,
      warning: `High memory usage detected: ${totalSizeMB.toFixed(1)}MB. Consider removing some images.`
    };
  }

  return {
    isHigh: false,
    warning: null
  };
}; 