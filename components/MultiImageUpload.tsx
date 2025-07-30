"use client";
import { useState, useCallback, useRef } from "react";
import { useLanguage } from "./LanguageContext";
import { smartCompress } from "../utils/imageCompression";

interface MultiImageUploadProps {
  onFilesSelected: (files: File[], previews: string[]) => void;
  onFileDelete: (index: number) => void;
  onClearAll: () => void;
  files: File[];
  previews: string[];
}

export default function MultiImageUpload({
  onFilesSelected,
  onFileDelete,
  onClearAll,
  files,
  previews
}: MultiImageUploadProps) {
  const { t } = useLanguage();
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const maxFileSize = 25 * 1024 * 1024; // 25MB max file size
  const maxFiles = 5; // Maximum number of files

  // Check if device supports camera
  const isMobile = typeof window !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const supportsCamera = typeof window !== 'undefined' && 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;

  const processFiles = useCallback(async (fileList: File[]) => {
    // Prevent processing if already processing
    if (isProcessing) {
      console.log('Already processing files, skipping...');
      return;
    }
    
    setIsProcessing(true);
    const processedFiles: File[] = [];
    const processedPreviews: string[] = [];

    try {
      // Filter valid image files
      const validFiles = fileList.filter(file => 
        file.type.startsWith('image/') && file.size <= maxFileSize
      );

      if (validFiles.length === 0) {
        console.warn('No valid image files found');
        setIsProcessing(false);
        return;
      }

      // Use smart compression for each file
      const compressionResults = await Promise.all(
        validFiles.map(file => smartCompress(file))
      );

      // Process results
      compressionResults.forEach((result, index) => {
        const file = validFiles[index];
        
        // Log compression info
        console.log(`Compressed ${file.name}:`, {
          originalSize: `${(result.originalSize / 1024 / 1024).toFixed(2)}MB`,
          compressedSize: `${(result.compressedSize / 1024 / 1024).toFixed(2)}MB`,
          compressionRatio: `${result.compressionRatio.toFixed(1)}%`,
          dimensions: `${result.width}x${result.height}`
        });

        processedFiles.push(result.file);
        const preview = URL.createObjectURL(result.file);
        processedPreviews.push(preview);
      });

      if (processedFiles.length > 0) {
        onFilesSelected(processedFiles, processedPreviews);
      }
    } catch (error) {
      console.error('Error processing files:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [onFilesSelected, isProcessing, maxFileSize]);

  const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const fileArray = Array.from(selectedFiles);
    const validFiles = fileArray.filter(file => 
      file.type.startsWith('image/') && file.size <= maxFileSize
    );

    if (validFiles.length === 0) {
      alert('Please select valid image files (max 25MB each)');
      return;
    }

    if (files.length + validFiles.length > maxFiles) {
      alert(`You can upload a maximum of ${maxFiles} images`);
      return;
    }

    processFiles(validFiles);
  }, [files.length, processFiles, maxFileSize]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleBrowseClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleCameraClick = useCallback(() => {
    console.log('📸 Camera button clicked');
    cameraInputRef.current?.click();
  }, []);

  const handleCameraCapture = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      console.log('📸 Photo captured from camera:', files[0].name);
      // Show a brief success message
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      successMessage.textContent = '📸 Photo captured! Processing...';
      document.body.appendChild(successMessage);
      
      // Remove the message after 2 seconds
      setTimeout(() => {
        document.body.removeChild(successMessage);
      }, 2000);
      
      handleFileSelect(files);
    }
    // Reset the input so the same file can be selected again
    event.target.value = '';
  }, [handleFileSelect]);

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        ref={dropZoneRef}
        className={`relative border-2 border-dashed rounded-xl p-4 sm:p-8 text-center transition-all duration-200 ${
          isDragOver
            ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
            : "border-gray-300 dark:border-gray-600 hover:border-orange-400 dark:hover:border-orange-500"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleCameraCapture}
          className="hidden"
        />

        <div className="space-y-4">
          <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {isDragOver ? t("input.image.dropTitle") : t("input.image.uploadTitle")}
            </h3>
            
            {/* Mobile-optimized buttons */}
            {isMobile ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {t("input.image.dragDropText")}
                </p>
                
                {/* Camera button (if supported) - More prominent on mobile */}
                {supportsCamera && (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={handleCameraClick}
                      className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <div className="flex items-center justify-center gap-3">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        📸 {t("input.image.takePhoto") || "Take Photo"}
                      </div>
                    </button>
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      {t("input.image.cameraInstructions") || "Tap to open camera and take a photo"}
                    </p>
                  </div>
                )}
                
                {/* Divider */}
                <div className="flex items-center">
                  <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
                  <span className="px-3 text-xs text-gray-500 dark:text-gray-400">or</span>
                  <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                
                {/* Browse files button */}
                <button
                  type="button"
                  onClick={handleBrowseClick}
                  className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-base shadow-md hover:shadow-lg"
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    📁 {t("input.image.browseFiles")}
                  </div>
                </button>
              </div>
            ) : (
              /* Desktop version */
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {t("input.image.dragDropText")}{" "}
                <button
                  type="button"
                  onClick={handleBrowseClick}
                  className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium underline"
                >
                  {t("input.image.browseFiles")}
                </button>
              </p>
            )}
            
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-3">
              {t("input.image.fileInfo", { maxFiles })}
            </p>
          </div>
        </div>

        {isProcessing && (
          <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t("input.image.processing")}</p>
            </div>
          </div>
        )}
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">
              {t("input.image.selectedImages")} ({files.length}/{maxFiles})
            </h4>
            <button
              onClick={onClearAll}
              className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
            >
              {t("common.clearAll")}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {files.map((file, index) => (
              <div key={index} className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previews[index]}
                  alt={file.name}
                  className="w-full h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                />
                <button
                  onClick={() => {
                    console.log('🗑️ Delete button clicked for index:', index);
                    onFileDelete(index);
                  }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-black hover:bg-gray-800 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 z-20 cursor-pointer"
                  title={t("common.remove")}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(1)}MB
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 