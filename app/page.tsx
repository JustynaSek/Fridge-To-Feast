"use client";
import IngredientInputSection from "../components/IngredientInputSection";
import PreferencesModal from "../components/PreferencesModal";
import SavedRecipesModal from "../components/SavedRecipesModal";
import { ToastContainer, useToast } from "../components/Toast";
import { useStorageManager, StorageWarning } from "../components/StorageManager";
import { OfflineIndicator } from "../components/OfflineIndicator";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useLanguage } from "../components/LanguageContext";
import { useState } from "react";

export default function Home() {
  const { toasts, removeToast, showSuccess } = useToast();
  const { showWarning, setShowWarning } = useStorageManager();
  const { t } = useLanguage();

  const handlePreferencesSaved = () => {
    showSuccess(t('common.success'), t('preferences.saved'));
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100">
      {/* Offline Indicator */}
      <OfflineIndicator />
      
      {/* Storage Warning */}
      {showWarning && (
        <StorageWarning onDismiss={() => setShowWarning(false)} />
      )}

      {/* Header */}
      <header className="w-full py-4 px-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm border-b border-orange-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                {t('header.title')}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                {t('header.subtitle')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <SavedRecipesButton />
            <PreferencesButton onPreferencesSaved={handlePreferencesSaved} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 gap-6">
        {/* Hero Section */}
        <div className="text-center mb-6 max-w-2xl">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-gray-800 dark:text-gray-200">
            {t('home.hero.title')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
            {t('home.hero.subtitle')}
          </p>
        </div>

        {/* Ingredient Input Section (Client Component) */}
        <IngredientInputSection />
      </main>

      {/* Footer */}
      <footer className="w-full py-4 px-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-center text-sm text-gray-500 dark:text-gray-400 border-t border-orange-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto">
          {t('home.footer.copyright')}
        </div>
      </footer>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

// Saved Recipes Button Component
function SavedRecipesButton() {
  const [showSavedRecipes, setShowSavedRecipes] = useState(false);
  const { t } = useLanguage();
  
  const handleClose = () => {
    setShowSavedRecipes(false);
  };
  
  return (
    <>
      <button
        onClick={() => setShowSavedRecipes(true)}
        className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
        title={t('header.savedRecipes')}
      >
        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>
      {showSavedRecipes && (
        <SavedRecipesModal onClose={handleClose} />
      )}
    </>
  );
}

// Preferences Button Component
function PreferencesButton({ onPreferencesSaved }: { onPreferencesSaved: () => void }) {
  const [showPreferences, setShowPreferences] = useState(false);
  const { t } = useLanguage();
  
  const handleClose = () => {
    setShowPreferences(false);
  };
  
  return (
    <>
      <button
        onClick={() => setShowPreferences(true)}
        className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30 hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
        title={t('header.preferences')}
      >
        <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
      {showPreferences && (
        <PreferencesModal onClose={handleClose} onPreferencesSaved={onPreferencesSaved} />
      )}
    </>
  );
}
