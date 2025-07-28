"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import { useLanguage } from "./LanguageContext";
import { compressImages, smartCompress, CompressionResult } from "../utils/imageCompression";

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
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const maxFileSize = 25 * 1024 * 1024; // 25MB max file size
  const maxFiles = 5; // Maximum number of files

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

  // Remove the problematic useEffect that was causing infinite loop
  // Files are now processed only when new files are selected via handleFileSelect or handleDrop

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

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        ref={dropZoneRef}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
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

        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {isDragOver ? t("input.image.dropTitle") : t("input.image.uploadTitle")}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t("input.image.dragDropText")}{" "}
              <button
                type="button"
                onClick={handleClick}
                className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium underline"
              >
                {t("input.image.browseFiles")}
              </button>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
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