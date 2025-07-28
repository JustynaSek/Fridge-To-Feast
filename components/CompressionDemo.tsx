"use client";
import { useState } from 'react';
import { smartCompress, CompressionResult } from '../utils/imageCompression';

export default function CompressionDemo() {
  const [results, setResults] = useState<CompressionResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setIsProcessing(true);
    const compressionResults: CompressionResult[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        try {
          const result = await smartCompress(file);
          compressionResults.push(result);
        } catch (error) {
          console.error(`Failed to compress ${file.name}:`, error);
        }
      }
    }

    setResults(compressionResults);
    setIsProcessing(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Image Compression Demo
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Upload images to see how client-side compression reduces file sizes
        </p>
        
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
        />
      </div>

      {isProcessing && (
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Compressing images...</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Compression Results
          </h3>
          
          <div className="grid gap-4">
            {results.map((result, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {result.file.name}
                  </h4>
                  <span className={`text-sm font-medium ${
                    result.compressionRatio > 50 ? 'text-green-600' : 
                    result.compressionRatio > 20 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {result.compressionRatio.toFixed(1)}% smaller
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Original Size:</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {(result.originalSize / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Compressed Size:</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {(result.compressedSize / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Dimensions:</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {result.width} × {result.height}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Format:</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {result.file.type.split('/')[1].toUpperCase()}
                    </p>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${100 - result.compressionRatio}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {((result.compressedSize / result.originalSize) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
            <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-2">
              Benefits for Vercel Deployment
            </h4>
            <ul className="text-sm text-orange-800 dark:text-orange-200 space-y-1">
              <li>• Stays under 4.5MB API route limit</li>
              <li>• Faster upload times</li>
              <li>• Reduced server processing time</li>
              <li>• Better user experience</li>
              <li>• Lower bandwidth usage</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
} 