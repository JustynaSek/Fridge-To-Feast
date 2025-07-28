"use client";
import { useState } from "react";
import { useLanguage } from "./LanguageContext";

interface IngredientInputProps {
  onSubmit: (ingredients: string[]) => void;
  loading?: boolean;
}

export default function IngredientInput({ onSubmit, loading = false }: IngredientInputProps) {
  const { t } = useLanguage();
  const [inputValue, setInputValue] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      // Split by comma and filter out empty strings
      const newIngredientsList = inputValue
        .split(',')
        .map(item => item.trim())
        .filter(item => item.length > 0);
      
      const newIngredients = [...ingredients, ...newIngredientsList];
      setIngredients(newIngredients);
      setInputValue("");
    }
  };

  const handleGenerateRecipes = () => {
    if (ingredients.length > 0) {
      onSubmit(ingredients);
    }
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setIngredients([]);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Input Form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
                         placeholder={t("ingredientInput.placeholder")}
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || loading}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
                         {t("ingredientInput.add")}
          </button>
        </div>
      </form>

      {/* Ingredients List */}
      {ingredients.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                             {t("ingredientInput.yourIngredients", { count: ingredients.length })}
            </h3>
            <button
              onClick={clearAll}
              className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
            >
                             {t("ingredientInput.clearAll")}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {ingredients.map((ingredient, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 rounded-lg"
              >
                <span className="text-sm font-medium">{ingredient}</span>
                <button
                  onClick={() => removeIngredient(index)}
                  className="text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-200 transition-colors"
                  disabled={loading}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generate Button */}
      {ingredients.length > 0 && (
        <div className="text-center">
          <button
            onClick={handleGenerateRecipes}
            disabled={loading}
            className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                                 {t("ingredientInput.generatingRecipes")}
              </div>
            ) : (
                             t("ingredientInput.generateRecipes")
            )}
          </button>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                         {t("ingredientInput.clickToGenerate")}
          </p>
        </div>
      )}
    </div>
  );
} 