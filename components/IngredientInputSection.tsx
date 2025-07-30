"use client";
import { useState, useCallback, useEffect } from "react";
import IngredientInput from "./IngredientInput";
import RecipeDisplay, { Recipe } from "./RecipeDisplay";
import MultiImageUpload from "./MultiImageUpload";
import { UserPreferences } from "./PreferencesModal";
import { useLanguage } from "./LanguageContext";

// Helper function to translate preference values
const translatePreferenceValue = (value: string, type: string, t: (key: string) => string): string => {
  switch (type) {
    case 'cookingSkill':
      switch (value) {
        case 'beginner': return t('preferences.options.skillLevels.beginner');
        case 'intermediate': return t('preferences.options.skillLevels.intermediate');
        case 'advanced': return t('preferences.options.skillLevels.advanced');
        case 'expert': return t('preferences.options.skillLevels.expert');
        default: return value;
      }
    case 'mealPace':
      switch (value) {
        case 'quick': return t('preferences.options.mealPaces.quick');
        case 'moderate': return t('preferences.options.mealPaces.moderate');
        case 'slow': return t('preferences.options.mealPaces.slow');
        default: return value;
      }
    case 'mealType':
      switch (value) {
        case 'breakfast': return t('preferences.options.mealTypes.breakfast');
        case 'lunch': return t('preferences.options.mealTypes.lunch');
        case 'dinner': return t('preferences.options.mealTypes.dinner');
        case 'snack': return t('preferences.options.mealTypes.snack');
        case 'dessert': return t('preferences.options.mealTypes.dessert');
        default: return value;
      }
    case 'healthCondition':
      switch (value) {
        case 'diabetes': return t('preferences.dietary.conditions.diabetes');
        case 'heart disease': return t('preferences.dietary.conditions.heartDisease');
        case 'high blood pressure': return t('preferences.dietary.conditions.highBloodPressure');
        case 'celiac disease': return t('preferences.dietary.conditions.celiacDisease');
        case 'lactose intolerance': return t('preferences.dietary.conditions.lactoseIntolerance');
        case 'ibs': return t('preferences.dietary.conditions.ibs');
        case 'kidney disease': return t('preferences.dietary.conditions.kidneyDisease');
        default: return value;
      }
    case 'dietaryRestriction':
      switch (value) {
        case 'vegetarian': return t('preferences.dietary.restrictions.vegetarian');
        case 'vegan': return t('preferences.dietary.restrictions.vegan');
        case 'pescatarian': return t('preferences.dietary.restrictions.pescatarian');
        case 'keto': return t('preferences.dietary.restrictions.keto');
        case 'paleo': return t('preferences.dietary.restrictions.paleo');
        case 'low-carb': return t('preferences.dietary.restrictions.lowCarb');
        case 'gluten-free': return t('preferences.dietary.restrictions.glutenFree');
        case 'dairy-free': return t('preferences.dietary.restrictions.dairyFree');
        default: return value;
      }
    case 'cuisine':
      switch (value) {
        case 'italian': return t('preferences.options.cuisines.italian');
        case 'mexican': return t('preferences.options.cuisines.mexican');
        case 'asian': return t('preferences.options.cuisines.asian');
        case 'mediterranean': return t('preferences.options.cuisines.mediterranean');
        case 'indian': return t('preferences.options.cuisines.indian');
        case 'french': return t('preferences.options.cuisines.french');
        case 'american': return t('preferences.options.cuisines.american');
        case 'thai': return t('preferences.options.cuisines.thai');
        case 'japanese': return t('preferences.options.cuisines.japanese');
        case 'greek': return t('preferences.options.cuisines.greek');
        case 'spanish': return t('preferences.options.cuisines.spanish');
        case 'middle eastern': return t('preferences.options.cuisines.middleeastern');
        default: return value;
      }
    default:
      return value;
  }
};

type InputMode = "text" | "image";

export default function IngredientInputSection() {
  const { t } = useLanguage();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [inputMode, setInputMode] = useState<InputMode>("image");
  const [noRecipesFromImages, setNoRecipesFromImages] = useState(false);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);

  // Image upload state (lifted up)
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [identifiedIngredients, setIdentifiedIngredients] = useState<string[]>([]);
  const [detectLoading, setDetectLoading] = useState(false);
  const [ingredientEdit, setIngredientEdit] = useState<string>("");

  // Load user preferences on component mount
  useEffect(() => {
    const saved = localStorage.getItem('userPreferences');
    console.log('🔍 Loading preferences from localStorage:', saved);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        console.log('✅ Parsed preferences:', parsed);
        setUserPreferences(parsed);
      } catch (e) {
        console.error('❌ Failed to load preferences:', e);
      }
    } else {
      console.log('ℹ️ No saved preferences found');
    }
  }, []);

  // Listen for preference changes
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('userPreferences');
      console.log('🔄 Storage event - new preferences:', saved);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          console.log('✅ Updated preferences from storage event:', parsed);
          setUserPreferences(parsed);
        } catch (e) {
          console.error('❌ Failed to load preferences from storage event:', e);
        }
      } else {
        console.log('ℹ️ Preferences cleared from storage');
        setUserPreferences(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleTextSubmit = async (inputIngredients: string[]) => {
    console.log('📤 handleTextSubmit - userPreferences:', userPreferences);
    setLoading(true);
    setError("");
    setRecipes([]);
    
    try {
      const requestBody = { 
        ingredients: inputIngredients,
        preferences: { 
          ...userPreferences,
          language: t('common.language') // Add current language to preferences
        }
      };
      console.log('📤 API request body:', requestBody);
      
      // Use streaming API
      const res = await fetch("/api/generate-recipe-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to generate recipes.");
      }
      
      // Handle streaming response
      const reader = res.body?.getReader();
      if (!reader) {
        throw new Error("No response body available");
      }
      
      let accumulatedText = '';
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        accumulatedText += chunk;
        
        // Check if the response contains an error message
        if (accumulatedText.includes('"error"') || accumulatedText.includes('I\'m sorry') || accumulatedText.includes('cannot generate')) {
          try {
            const errorResponse = JSON.parse(accumulatedText);
            if (errorResponse.error) {
              throw new Error(errorResponse.error);
            }
          } catch (_parseError) {
            // If it's not valid JSON but contains error keywords, treat as error
            if (accumulatedText.includes('I\'m sorry') || accumulatedText.includes('cannot generate')) {
              throw new Error("Unable to generate recipes with the provided ingredients. Please try different ingredients.");
            }
          }
        }
        
        // Try to parse as JSON (in case it's complete)
        try {
          const recipes = JSON.parse(accumulatedText);
          if (Array.isArray(recipes)) {
            setRecipes(recipes);
            break;
          }
        } catch (_e) {
          // Continue accumulating if JSON is incomplete
        }
      }
      
      // Final attempt to parse the complete response
      try {
        const recipes = JSON.parse(accumulatedText);
        if (Array.isArray(recipes)) {
          setRecipes(recipes);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (_parseError) {
        // Check if it's an error message
        if (accumulatedText.includes('I\'m sorry') || accumulatedText.includes('cannot generate')) {
          throw new Error("Unable to generate recipes with the provided ingredients. Please try different ingredients.");
        }
        throw new Error("Failed to parse recipe response");
      }
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Debug state changes
  useEffect(() => {
    console.log('🔄 State changed - imageFiles:', imageFiles.length, 'imagePreviews:', imagePreviews.length);
  }, [imageFiles, imagePreviews]);

  // Debug identifiedIngredients changes
  useEffect(() => {
    console.log('🔍 identifiedIngredients changed:', identifiedIngredients);
  }, [identifiedIngredients]);



  // Called by MultiImageUpload when files are selected/optimized
  // Handle new files being selected (processed files from MultiImageUpload)
  const handleFilesSelected = useCallback((newFiles: File[], newPreviews: string[]) => {
    console.log('🖼️ handleFilesSelected called with:', {
      newFiles: newFiles.length,
      newPreviews: newPreviews.length
    });
    
    // Only add the new files, don't reprocess existing ones
    setImageFiles(prev => [...prev, ...newFiles]);
    setImagePreviews(prev => [...prev, ...newPreviews]);
  }, []);

  // Handle individual file deletion
  const handleFileDelete = useCallback((index: number) => {
    console.log('🗑️ handleFileDelete called with index:', index);
    
    setImageFiles(prev => {
      const newFiles = prev.filter((_, i) => i !== index);
      console.log('🗑️ New imageFiles length:', newFiles.length);
      return newFiles;
    });
    setImagePreviews(prev => {
      const newPreviews = prev.filter((_, i) => i !== index);
      console.log('🗑️ New imagePreviews length:', newPreviews.length);
      return newPreviews;
    });
    // Clear identified ingredients when images change
    setIdentifiedIngredients([]);
  }, []);

  // Handle clear all files
  const handleClearAll = useCallback(() => {
    setImageFiles([]);
    setImagePreviews([]);
    setIdentifiedIngredients([]);
  }, []);

  // Handle clear recipes
  const handleClearRecipes = useCallback(() => {
    setRecipes([]);
    setNoRecipesFromImages(false);
  }, []);

  const handleDetectIngredients = async () => {
    if (imageFiles.length === 0) return;
    
    console.log('🔍 Setting detectLoading to true');
    setDetectLoading(true);
    try {
      const formData = new FormData();
      imageFiles.forEach((file) => {
        formData.append("images", file);
      });

      const res = await fetch("/api/process-images", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to process images");
      }

      const data = await res.json();
      console.log('🔍 Full API response:', data);
      console.log('🔍 Detected ingredients:', data.ingredients);
      console.log('🔍 Setting identifiedIngredients to:', data.ingredients || []);
      setIdentifiedIngredients(data.ingredients || []);
      console.log('🔍 setIdentifiedIngredients called');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to detect ingredients";
      console.error('❌ Image detection error:', errorMessage);
      setError(errorMessage);
    } finally {
      console.log('🔍 Setting detectLoading to false');
      setDetectLoading(false);
    }
  };

  const handleToggleIngredient = (ingredient: string) => {
    setIdentifiedIngredients(prev => 
      prev.includes(ingredient) 
        ? prev.filter(i => i !== ingredient)
        : [...prev, ingredient]
    );
  };

  const handleAddIngredient = () => {
    if (ingredientEdit.trim()) {
      setIdentifiedIngredients(prev => [...prev, ingredientEdit.trim()]);
      setIngredientEdit("");
    }
  };

  const handleRemoveIngredient = (ingredient: string) => {
    setIdentifiedIngredients(prev => prev.filter(i => i !== ingredient));
  };

  const handleGenerateFromDetected = async () => {
    if (identifiedIngredients.length > 0) {
      console.log('📤 handleGenerateFromDetected - userPreferences:', userPreferences);
      setNoRecipesFromImages(false);
      setLoading(true);
      setError("");
      setRecipes([]);
      
      try {
        const requestBody = { 
          ingredients: identifiedIngredients,
          preferences: { 
            ...userPreferences,
            language: t('common.language') // Add current language to preferences
          }
        };
        console.log('📤 API request body (detected):', requestBody);
        
        // Use streaming API
        const res = await fetch("/api/generate-recipe-stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to generate recipes.");
        }
        
        // Handle streaming response
        const reader = res.body?.getReader();
        if (!reader) {
          throw new Error("No response body available");
        }
        
        let accumulatedText = '';
        const decoder = new TextDecoder();
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          accumulatedText += chunk;
          
          // Try to parse as JSON (in case it's complete)
          try {
            const recipes = JSON.parse(accumulatedText);
            if (Array.isArray(recipes)) {
              setRecipes(recipes);
              if (recipes.length === 0) {
                setNoRecipesFromImages(true);
              }
              break;
            }
          } catch (_e) {
            // Continue accumulating if JSON is incomplete
          }
        }
        
        // Final attempt to parse the complete response
        try {
          const recipes = JSON.parse(accumulatedText);
          if (Array.isArray(recipes)) {
            setRecipes(recipes);
            if (recipes.length === 0) {
              setNoRecipesFromImages(true);
            }
          } else {
            throw new Error("Invalid response format");
          }
        } catch (_e) {
          throw new Error("Failed to parse recipe response");
        }
        
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Preferences Indicator */}
      {userPreferences && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400 text-sm mb-2">
                <span className="font-semibold">{t("ui.personalizedRecipesEnabled")}</span>
                <span className="text-xs bg-green-200 dark:bg-green-800 px-2 py-1 rounded-full">
                  {translatePreferenceValue(userPreferences.cookingSkill, 'cookingSkill', t)} • {translatePreferenceValue(userPreferences.mealPace, 'mealPace', t)}
                </span>
              </div>
              <div className="text-xs text-green-600 dark:text-green-300 space-y-1">
                {userPreferences.healthConditions.length > 0 && (
                                     <div>{t("ui.healthConditions")}: {userPreferences.healthConditions.map(condition => translatePreferenceValue(condition, 'healthCondition', t)).join(", ")}</div>
                )}
                {userPreferences.dietaryRestrictions.length > 0 && (
                                     <div>{t("ui.dietaryRestrictions")}: {userPreferences.dietaryRestrictions.map(restriction => translatePreferenceValue(restriction, 'dietaryRestriction', t)).join(", ")}</div>
                )}
                {userPreferences.preferredCuisines.length > 0 && (
                                     <div>{t("ui.preferredCuisines")}: {userPreferences.preferredCuisines.map(cuisine => translatePreferenceValue(cuisine, 'cuisine', t)).join(", ")}</div>
                )}
                <div className="flex flex-wrap gap-2">
                                     <span>{t("ui.cookingSkill")}: {translatePreferenceValue(userPreferences.cookingSkill, 'cookingSkill', t)}</span>
                   <span>{t("ui.maxCookingTime")}: {userPreferences.maxCookingTime}</span>
                   <span>{t("ui.servingSize")}: {userPreferences.servingSize}</span>
                   <span>{t("ui.mealType")}: {translatePreferenceValue(userPreferences.mealType, 'mealType', t)}</span>
                   {userPreferences.budgetFriendly && <span>{t("ui.budgetFriendly")}</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Input Method Selector */}
      <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-orange-200 dark:border-gray-700 overflow-hidden">
        {/* Tab Navigation */}
        <div className="flex border-b border-orange-200 dark:border-gray-700">
          <button
            className={`flex-1 px-6 py-4 font-semibold text-sm sm:text-base transition-all duration-200 ${
              inputMode === "text"
                ? "bg-orange-500 text-white shadow-lg"
                : "text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-gray-700"
            }`}
            onClick={() => setInputMode("text")}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
                             <span className="hidden sm:inline">{t("ui.enterIngredients")}</span>
               <span className="sm:hidden">{t("common.text")}</span>
            </div>
          </button>
          <button
            className={`flex-1 px-6 py-4 font-semibold text-sm sm:text-base transition-all duration-200 ${
              inputMode === "image"
                ? "bg-orange-500 text-white shadow-lg"
                : "text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-gray-700"
            }`}
            onClick={() => setInputMode("image")}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
                             <span className="hidden sm:inline">{t("ui.uploadImages")}</span>
               <span className="sm:hidden">{t("common.photos")}</span>
            </div>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {inputMode === "text" && (
            <div className="space-y-4">
              <div className="text-center">
                                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                   {t("ui.whatsInYourKitchen")}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                   {t("ui.listYourIngredientsAndWellCreateDeliciousRecipesForYou")}
                  </p>
              </div>
              <IngredientInput onSubmit={handleTextSubmit} />
            </div>
          )}

          {inputMode === "image" && (
            <div className="space-y-6">
              <div className="text-center">
                                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                   {t("ui.snapAPhotoOfYourIngredients")}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                   {t("ui.dontSeeYourIngredientsAddThemManuallyBelow")}
                  </p>
              </div>
              
              <MultiImageUpload
                onFilesSelected={handleFilesSelected}
                onFileDelete={handleFileDelete}
                onClearAll={handleClearAll}
                files={imageFiles}
                previews={imagePreviews}
              />
              
              {imageFiles.length > 0 && (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <button
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold px-8 py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
                      onClick={handleDetectIngredients}
                      disabled={detectLoading}
                    >
                      {detectLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                     <span>{t("ui.detectingIngredients")}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                                                     <span>{t("ui.detectIngredients")}</span>
                        </div>
                      )}
                    </button>
                  </div>
                  
                  {(() => {
                    console.log('🔍 Render condition check:', {
                      identifiedIngredientsLength: identifiedIngredients.length,
                      detectLoading,
                      shouldShow: identifiedIngredients.length > 0 && !detectLoading
                    });
                    return identifiedIngredients.length > 0 && !detectLoading;
                  })() && (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-700">
                      <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                                                 {t("ui.reviewEditIngredients")}
                      </h3>
                      
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {identifiedIngredients.map((ingredient) => (
                            <div key={ingredient} className="flex items-center gap-2 bg-white dark:bg-gray-700 px-3 py-2 rounded-lg border border-green-200 dark:border-green-600">
                              <input
                                type="checkbox"
                                checked={true}
                                onChange={() => handleToggleIngredient(ingredient)}
                                className="text-green-600"
                              />
                              <span className="text-sm font-medium">{ingredient}</span>
                              <button
                                className="text-red-500 hover:text-red-700 transition-colors"
                                onClick={() => handleRemoveIngredient(ingredient)}
                                                                 title={t("ui.removeIngredient")}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex gap-2">
                          <input
                            type="text"
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                         placeholder={t("ui.addIngredient")}
                            value={ingredientEdit}
                            onChange={(e) => setIngredientEdit(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddIngredient(); } }}
                          />
                          <button
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            onClick={handleAddIngredient}
                            type="button"
                          >
                            <span className="hidden sm:inline">{t("common.add")}</span>
                            <span className="sm:hidden">+</span>
                          </button>
                        </div>
                        
                        <button
                          className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50"
                          onClick={handleGenerateFromDetected}
                          disabled={identifiedIngredients.length === 0}
                        >
                          <div className="flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                                                         <span>{t("ui.generateRecipe")}</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Recipe Results */}
      {((recipes && recipes.length > 0) || loading) && (
        <section className="mt-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-orange-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                 {t("ui.yourRecipes")}
              </h2>
              {/* onClear prop was removed from RecipeDisplay, so this button is removed */}
            </div>
            <RecipeDisplay 
              recipes={recipes} 
              loading={loading} 
              onClear={handleClearRecipes}
            />
          </div>
        </section>
      )}
      
      {/* No Recipes Message */}
      {inputMode === "image" && noRecipesFromImages && !loading && (
        <div className="mt-4 p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl text-center">
          <div className="flex items-center justify-center gap-2 text-yellow-700 dark:text-yellow-400 mb-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
                         <span className="font-medium">{t("ui.noRecipesFound")}</span>
          </div>
          <p className="text-sm text-yellow-600 dark:text-yellow-300">
                         {t("ui.tryAddingMoreIngredientsOrUploadClearerImagesWithBetterLighting")}
          </p>
        </div>
      )}
    </div>
  );
} 