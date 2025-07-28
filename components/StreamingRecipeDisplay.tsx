"use client";
import { useState, useEffect } from 'react';
import { Recipe } from './RecipeDisplay';
import { useLanguage } from './LanguageContext';

interface StreamingRecipeDisplayProps {
  isStreaming: boolean;
  onStreamingComplete: (recipes: Recipe[]) => void;
  onError: (error: string) => void;
}

export default function StreamingRecipeDisplay({ 
  isStreaming, 
  onStreamingComplete, 
  onError 
}: StreamingRecipeDisplayProps) {
  const { t } = useLanguage();
  const [streamingText, setStreamingText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (isStreaming) {
      setStreamingText('');
      setIsComplete(false);
    }
  }, [isStreaming]);

  const handleStreamingResponse = async (response: Response) => {
    if (!response.body) {
      onError("No response body available");
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let accumulatedText = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        accumulatedText += chunk;
        setStreamingText(accumulatedText);

        // Try to parse as JSON (in case it's complete)
        try {
          const recipes = JSON.parse(accumulatedText);
          if (Array.isArray(recipes)) {
            setIsComplete(true);
            onStreamingComplete(recipes);
            return;
          }
        } catch (e) {
          // Continue accumulating if JSON is incomplete
        }
      }

      // Final attempt to parse the complete response
      try {
        const recipes = JSON.parse(accumulatedText);
        if (Array.isArray(recipes)) {
          setIsComplete(true);
          onStreamingComplete(recipes);
        } else {
          onError("Invalid response format");
        }
      } catch (e) {
        onError("Failed to parse recipe response");
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : "Streaming error");
    }
  };

  if (!isStreaming && !isComplete) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {isComplete ? t('ui.recipeGenerated') : t('ui.generatingRecipe')}
          </h2>
        </div>

        {isStreaming && !isComplete && (
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('ui.generatingInProgress')}
              </h3>
              <div className="text-sm text-gray-600 dark:text-gray-400 font-mono bg-white dark:bg-gray-800 rounded p-3 border">
                {streamingText || t('ui.startingGeneration')}
                <span className="animate-pulse">▋</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              <span>{t('ui.pleaseWait')}</span>
            </div>
          </div>
        )}

        {isComplete && (
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-medium">{t('ui.recipeGenerationComplete')}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 