"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useLanguage } from "./LanguageContext";

export interface UserPreferences {
  // Health & Dietary
  healthConditions: string[];
  dietaryRestrictions: string[];
  allergies: string[];
  
  // Taste & Cooking Preferences
  spiceLevel: "mild" | "medium" | "hot" | "very-hot";
  likesSalty: boolean;
  likesSweet: boolean;
  mealPace: "quick" | "moderate" | "slow";
  
  // Cuisine & Style
  preferredCuisines: string[];
  cookingStyle: "traditional" | "modern" | "fusion" | "comfort";
  
  // Cooking Skills & Equipment
  cookingSkill: "beginner" | "intermediate" | "advanced";
  availableEquipment: string[];
  maxCookingTime: "15min" | "30min" | "45min" | "60min+";
  
  // Serving & Portions
  servingSize: "1-2" | "3-4" | "5-6" | "8+";
  mealType: "breakfast" | "lunch" | "dinner" | "snack" | "dessert";
  
  // Additional Preferences
  organicPreference: "prefer" | "avoid" | "no-preference";
  budgetFriendly: boolean;
  seasonalIngredients: boolean;
}

const defaultPreferences: UserPreferences = {
  healthConditions: [],
  dietaryRestrictions: [],
  allergies: [],
  spiceLevel: "medium",
  likesSalty: true,
  likesSweet: true,
  mealPace: "moderate",
  preferredCuisines: [],
  cookingStyle: "traditional",
  cookingSkill: "intermediate",
  availableEquipment: ["stovetop", "oven"], // Domyślnie kuchenka i piekarnik
  maxCookingTime: "45min",
  servingSize: "3-4",
  mealType: "dinner",
  organicPreference: "no-preference",
  budgetFriendly: true,
  seasonalIngredients: false,
};

interface PreferencesModalProps {
  onClose: () => void;
  onPreferencesSaved?: () => void;
}

export default function PreferencesModal({ onClose, onPreferencesSaved }: PreferencesModalProps) {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [activeTab, setActiveTab] = useState("health");
  const [mounted, setMounted] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (mounted) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [mounted]);

  useEffect(() => {
    const saved = localStorage.getItem('userPreferences');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure default equipment is always included if user has no equipment
        const mergedPreferences = { ...defaultPreferences, ...parsed };
        if (!mergedPreferences.availableEquipment || mergedPreferences.availableEquipment.length === 0) {
          mergedPreferences.availableEquipment = defaultPreferences.availableEquipment;
        }
        setPreferences(mergedPreferences);
      } catch (e) {
        console.error('Failed to load preferences:', e);
      }
    }
  }, []);

  const savePreferences = () => {
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
    // Trigger storage event for other components
    window.dispatchEvent(new Event('storage'));
    // Call the callback if provided
    if (onPreferencesSaved) {
      onPreferencesSaved();
    }
    onClose();
  };

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Handle click outside to close modal
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleInputChange = (field: keyof UserPreferences, value: string | string[] | boolean) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayInputChange = (field: keyof UserPreferences, value: string, action: 'add' | 'remove') => {
    setPreferences(prev => {
      const currentArray = (prev[field] as string[]) || [];
      const newArray = action === 'add' 
        ? [...currentArray, value]
        : currentArray.filter(item => item !== value);
      
      return {
        ...prev,
        [field]: newArray
      };
    });
  };

  const handleEquipmentChange = (equipment: string, checked: boolean) => {
    setPreferences(prev => {
      const currentEquipment = prev.availableEquipment || [];
      const newEquipment = checked
        ? [...currentEquipment, equipment]
        : currentEquipment.filter(item => item !== equipment);
      
      return {
        ...prev,
        availableEquipment: newEquipment
      };
    });
  };

  const handleCuisineChange = (cuisine: string, checked: boolean) => {
    setPreferences(prev => {
      const currentCuisines = prev.preferredCuisines || [];
      const newCuisines = checked
        ? [...currentCuisines, cuisine]
        : currentCuisines.filter(item => item !== cuisine);
      
      return {
        ...prev,
        preferredCuisines: newCuisines
      };
    });
  };

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999]"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[85vh] sm:max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('preferences.title')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1 px-4 sm:px-6">
            {[
              { id: "health", label: t('preferences.tabs.health'), icon: "🏥" },
              { id: "taste", label: t('preferences.tabs.taste'), icon: "👅" },
              { id: "cooking", label: t('preferences.tabs.cooking'), icon: "👨‍🍳" },
              { id: "equipment", label: t('preferences.tabs.equipment'), icon: "🔧" },
              { id: "meals", label: t('preferences.tabs.meals'), icon: "🍽️" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors touch-manipulation ${
                  activeTab === tab.id
                    ? "text-orange-600 border-b-2 border-orange-600 bg-orange-50 dark:bg-orange-900/20"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                <span className="block text-sm sm:text-base mb-1">{tab.icon}</span>
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 pb-8 overflow-y-auto max-h-[40vh] sm:max-h-[50vh]" style={{ WebkitOverflowScrolling: 'touch' }}>
          {/* Health & Diet Tab */}
          {activeTab === "health" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                  {t('preferences.dietary.healthConditions')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {["diabetes", "heart disease", "high blood pressure", "celiac disease", "lactose intolerance", "ibs", "kidney disease"].map(condition => (
                    <label key={condition} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={preferences.healthConditions.includes(condition)}
                        onChange={() => handleArrayInputChange("healthConditions", condition, preferences.healthConditions.includes(condition) ? "remove" : "add")}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                      <span className="text-sm capitalize">{t(`preferences.dietary.conditions.${condition.replace(/\s+([a-z])/g, (g) => g[1].toUpperCase())}`)}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                  {t('preferences.dietary.restrictionsTitle')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {["vegetarian", "vegan", "pescatarian", "keto", "paleo", "low-carb", "gluten-free", "dairy-free"].map(restriction => (
                    <label key={restriction} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={preferences.dietaryRestrictions.includes(restriction)}
                        onChange={() => handleArrayInputChange("dietaryRestrictions", restriction, preferences.dietaryRestrictions.includes(restriction) ? "remove" : "add")}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                      <span className="text-sm capitalize">{
                        t(`preferences.dietary.restrictions.${restriction.replace(/-([a-z])/g, (g) => g[1].toUpperCase())}`)
                      }</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                  {t("preferences.dietary.allergiesTitle")}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {["nuts", "shellfish", "eggs", "soy", "wheat", "fish", "sesame", "sulfites"].map(allergy => (
                    <label key={allergy} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={preferences.allergies.includes(allergy)}
                        onChange={() => handleArrayInputChange("allergies", allergy, preferences.allergies.includes(allergy) ? "remove" : "add")}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                      <span className="text-sm capitalize">{t(`preferences.dietary.allergyOptions.${allergy}`)}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Taste & Style Tab */}
          {activeTab === "taste" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                  {t("preferences.spiceLevelPreference")}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {["mild", "medium", "hot", "very-hot"].map(level => (
                    <label key={level} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="spiceLevel"
                        value={level}
                        checked={preferences.spiceLevel === level}
                        onChange={(e) => handleInputChange("spiceLevel", e.target.value as UserPreferences["spiceLevel"])}
                        className="text-orange-600 focus:ring-orange-500"
                      />
                      <span className="text-sm capitalize">{t(`preferences.options.spiceLevels.${level.replace(/-([a-z])/g, (g) => g[1].toUpperCase())}`)}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                  {t("preferences.tastePreferences")}
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={preferences.likesSalty}
                      onChange={(e) => handleInputChange("likesSalty", e.target.checked)}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                                         <span>{t("preferences.iEnjoySaltyFlavors")}</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={preferences.likesSweet}
                      onChange={(e) => handleInputChange("likesSweet", e.target.checked)}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                                         <span>{t("preferences.iEnjoySweetFlavors")}</span>
                  </label>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                  {t("preferences.cookingStyle")}
                </h3>
                <select
                  value={preferences.cookingStyle}
                  onChange={(e) => handleInputChange("cookingStyle", e.target.value as UserPreferences["cookingStyle"])}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                                     <option value="traditional">{t("preferences.traditional")}</option>
                   <option value="modern">{t("preferences.modern")}</option>
                   <option value="fusion">{t("preferences.fusion")}</option>
                   <option value="comfort">{t("preferences.comfortFood")}</option>
                </select>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                  {t("preferences.preferredCuisines")}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {["italian", "mexican", "asian", "mediterranean", "indian", "french", "american", "thai", "japanese", "greek", "spanish", "middle-eastern"].map(cuisine => (
                    <label key={cuisine} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={preferences.preferredCuisines.includes(cuisine)}
                        onChange={() => handleCuisineChange(cuisine, !preferences.preferredCuisines.includes(cuisine))}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                      <span className="text-sm capitalize">{t(`preferences.options.cuisines.${cuisine.replace(/-([a-z])/g, (g) => g[1].toUpperCase())}`)}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Cooking Skills Tab */}
          {activeTab === "cooking" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                  {t("preferences.cookingSkillLevel")}
                </h3>
                <div className="space-y-3">
                  {[
                    { value: "beginner", label: t("preferences.options.skillLevels.beginner"), desc: t("preferences.options.skillLevels.beginnerDesc") },
                    { value: "intermediate", label: t("preferences.options.skillLevels.intermediate"), desc: t("preferences.options.skillLevels.intermediateDesc") },
                    { value: "advanced", label: t("preferences.options.skillLevels.advanced"), desc: t("preferences.options.skillLevels.advancedDesc") }
                  ].map(level => (
                    <label key={level.value} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                      <input
                        type="radio"
                        name="cookingSkill"
                        value={level.value}
                        checked={preferences.cookingSkill === level.value}
                        onChange={(e) => handleInputChange("cookingSkill", e.target.value as UserPreferences["cookingSkill"])}
                        className="mt-1 text-orange-600 focus:ring-orange-500"
                      />
                      <div>
                        <div className="font-medium">{level.label}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{level.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                  {t("preferences.cookingPacePreference")}
                </h3>
                <div className="space-y-3">
                  {[
                    { value: "quick", label: t("preferences.options.mealPaces.quick"), desc: t("preferences.options.mealPaces.quickDesc") },
                    { value: "moderate", label: t("preferences.options.mealPaces.moderate"), desc: t("preferences.options.mealPaces.moderateDesc") },
                    { value: "slow", label: t("preferences.options.mealPaces.slow"), desc: t("preferences.options.mealPaces.slowDesc") }
                  ].map(pace => (
                    <label key={pace.value} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                      <input
                        type="radio"
                        name="mealPace"
                        value={pace.value}
                        checked={preferences.mealPace === pace.value}
                        onChange={(e) => handleInputChange("mealPace", e.target.value as UserPreferences["mealPace"])}
                        className="mt-1 text-orange-600 focus:ring-orange-500"
                      />
                      <div>
                        <div className="font-medium">{pace.label}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{pace.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Kitchen Equipment Tab */}
          {activeTab === "equipment" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                  {t("preferences.availableKitchenEquipment")}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    "blender", "food processor", "slow cooker", "air fryer", 
                    "instant pot", "stand mixer", "grill", "oven", 
                    "stovetop", "microwave", "toaster oven", "rice cooker"
                  ].map(equipment => (
                    <label key={equipment} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={preferences.availableEquipment.includes(equipment)}
                        onChange={() => handleEquipmentChange(equipment, !preferences.availableEquipment.includes(equipment))}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                      <span className="text-sm capitalize">{t(`preferences.options.equipment.${equipment.replace(/\s+([a-z])/g, (g) => g[1].toUpperCase())}`)}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-xs text-blue-700 dark:text-blue-300">
                      {t("preferences.equipmentHint")}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                  {t("preferences.maximumCookingTime")}
                </h3>
                <select
                  value={preferences.maxCookingTime}
                  onChange={(e) => handleInputChange("maxCookingTime", e.target.value as UserPreferences["maxCookingTime"])}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                                     <option value="15min">{t("preferences.cookingTime15min")}</option>
                   <option value="30min">{t("preferences.cookingTime30min")}</option>
                   <option value="45min">{t("preferences.cookingTime45min")}</option>
                   <option value="60min+">{t("preferences.cookingTime60minPlus")}</option>
                </select>
              </div>
            </div>
          )}

          {/* Meal Planning Tab */}
          {activeTab === "meals" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                  {t("preferences.servingSize")}
                </h3>
                <select
                  value={preferences.servingSize}
                  onChange={(e) => handleInputChange("servingSize", e.target.value as UserPreferences["servingSize"])}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                                     <option value="1-2">{t("preferences.servingSize1_2")}</option>
                   <option value="3-4">{t("preferences.servingSize3_4")}</option>
                   <option value="5-6">{t("preferences.servingSize5_6")}</option>
                   <option value="8+">{t("preferences.servingSize8Plus")}</option>
                </select>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                  {t("preferences.preferredMealType")}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {["breakfast", "lunch", "dinner", "snack", "dessert"].map(mealType => (
                    <label key={mealType} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="mealType"
                        value={mealType}
                        checked={preferences.mealType === mealType}
                        onChange={(e) => handleInputChange("mealType", e.target.value as UserPreferences["mealType"])}
                        className="text-orange-600 focus:ring-orange-500"
                      />
                      <span className="text-sm capitalize">{t(`preferences.options.mealTypes.${mealType}`)}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                  {t("preferences.additionalPreferences")}
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={preferences.budgetFriendly}
                      onChange={(e) => handleInputChange("budgetFriendly", e.target.checked)}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                                         <span>{t("preferences.preferBudgetFriendlyIngredients")}</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={preferences.seasonalIngredients}
                      onChange={(e) => handleInputChange("seasonalIngredients", e.target.checked)}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                                         <span>{t("preferences.preferSeasonalIngredients")}</span>
                  </label>
                </div>

                <div className="mt-4">
                                     <label className="block text-sm font-medium mb-2">{t("preferences.organicPreference")}</label>
                  <select
                    value={preferences.organicPreference}
                    onChange={(e) => handleInputChange("organicPreference", e.target.value as UserPreferences["organicPreference"])}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                                         <option value="no-preference">{t("preferences.noPreference")}</option>
                     <option value="prefer">{t("preferences.preferOrganicWhenPossible")}</option>
                     <option value="avoid">{t("preferences.avoidOrganicPreferConventional")}</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 gap-4">
          <div className="text-xs text-gray-500 dark:text-gray-400 order-2 sm:order-1">
            <span className="hidden sm:inline">{t("preferences.pressEscOrClickOutsideToClose")}</span>
            <span className="sm:hidden">
              {t("preferences.pressEscOrClickOutsideToClose").includes("Esc") ? "Esc lub kliknij..." : 
               t("preferences.pressEscOrClickOutsideToClose").includes("Échap") ? "Échap ou cliquez..." :
               t("preferences.pressEscOrClickOutsideToClose").includes("Drücken") ? "Esc oder klicken..." :
               t("preferences.pressEscOrClickOutsideToClose").includes("Premi") ? "Esc o clicca..." :
               t("preferences.pressEscOrClickOutsideToClose").includes("Presiona") ? "Esc o haz clic..." :
               t("preferences.pressEscOrClickOutsideToClose").includes("Pressione") ? "Esc ou clique..." :
               "Esc or click..."}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3 order-1 sm:order-2 w-full sm:w-auto justify-center sm:justify-end">
            <button
              onClick={() => setPreferences(defaultPreferences)}
              className="px-4 py-3 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 bg-white dark:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-500 shadow-sm whitespace-nowrap"
            >
              {t("preferences.resetToDefaults")}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-3 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600 bg-white dark:bg-gray-600 shadow-sm whitespace-nowrap"
            >
              {t("common.cancel")}
            </button>
            <button
              onClick={savePreferences}
              className="px-4 py-3 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium shadow-sm whitespace-nowrap"
            >
              {t("preferences.savePreferences")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (!mounted) {
    return null;
  }

  return createPortal(modalContent, document.body);
} 