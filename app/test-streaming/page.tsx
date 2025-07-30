"use client";
import { useState } from 'react';
import { Recipe } from '../../components/RecipeDisplay';

export default function TestStreamingPage() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [error, setError] = useState('');

  const testRecipeGeneration = async () => {
    setIsStreaming(true);
    setError('');
    setRecipes([]);

    try {
      const response = await fetch('/api/generate-recipe-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients: ['chicken', 'onion', 'garlic'],
          preferences: {
            language: 'English',
            cookingSkill: 'beginner',
            maxCookingTime: '30min',
            servingSize: '2-4'
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate recipes');
      }

      const data = await response.json();
      
      if (!data.recipes || !Array.isArray(data.recipes)) {
        throw new Error('Invalid response format from server');
      }

      setRecipes(data.recipes);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Streaming Recipe Generation Test
        </h1>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
            <button
              onClick={testRecipeGeneration}
              disabled={isStreaming}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
            >
              {isStreaming ? 'Generating...' : 'Test Recipe Generation'}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
              <p className="text-red-700 dark:text-red-400">Error: {error}</p>
            </div>
          )}



          {recipes.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
              <h2 className="text-xl font-semibold mb-4">Generated Recipes</h2>
              <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(recipes, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 