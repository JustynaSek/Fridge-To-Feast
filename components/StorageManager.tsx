"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "./LanguageContext";

interface StorageInfo {
  recipes: number;
  preferences: boolean;
  totalSize: number;
  quota: number;
  usage: number;
  available: number;
}

export function useStorageManager() {
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  // Calculate storage usage
  const calculateStorageInfo = async (): Promise<StorageInfo> => {
    try {
      // Get saved recipes
      const savedRecipes = JSON.parse(localStorage.getItem('savedRecipes') || '[]');
      const hasPreferences = localStorage.getItem('userPreferences') !== null;
      
      // Estimate storage usage
      const recipesSize = new Blob([JSON.stringify(savedRecipes)]).size;
      const preferencesSize = hasPreferences ? new Blob([localStorage.getItem('userPreferences') || '']).size : 0;
      const totalSize = recipesSize + preferencesSize;
      
      // Try to get quota information
      let quota = 25 * 1024 * 1024; // Default 25MB
      let usage = totalSize;
      
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        try {
          const estimate = await navigator.storage.estimate() as { quota?: number; usage?: number };
          quota = estimate.quota || quota;
          usage = estimate.usage || usage;
        } catch (error) {
          console.warn('Could not get storage estimate:', error);
        }
      }
      
      return {
        recipes: savedRecipes.length,
        preferences: hasPreferences,
        totalSize,
        quota,
        usage,
        available: quota - usage
      };
    } catch (error) {
      console.error('Error calculating storage info:', error);
      return {
        recipes: 0,
        preferences: false,
        totalSize: 0,
        quota: 25 * 1024 * 1024,
        usage: 0,
        available: 25 * 1024 * 1024
      };
    }
  };

  // Check storage health
  const checkStorageHealth = useCallback(async (): Promise<void> => {
    const info = await calculateStorageInfo();
    setStorageInfo(info);
    
    // Show warning if usage is high
    const usagePercentage = (info.usage / info.quota) * 100;
    if (usagePercentage > 80 || info.totalSize > 25 * 1024 * 1024) {
      setShowWarning(true);
    }
  }, []);

  // Clean up old data
  const cleanupStorage = () => {
    try {
      // Remove recipes older than 30 days
      const recipes = JSON.parse(localStorage.getItem('savedRecipes') || '[]');
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const filteredRecipes = recipes.filter((recipe: { savedAt?: string }) => {
        const savedAt = new Date(recipe.savedAt || 0);
        return savedAt > thirtyDaysAgo;
      });
      
      localStorage.setItem('savedRecipes', JSON.stringify(filteredRecipes));
      
      // Clear any corrupted data
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('fridge-to-feast-')) {
          try {
            JSON.parse(localStorage.getItem(key) || '');
          } catch {
            localStorage.removeItem(key);
          }
        }
      });
      
      checkStorageHealth();
      return true;
    } catch (error) {
      console.error('Storage cleanup failed:', error);
      return false;
    }
  };

  // Export all data
  const exportAllData = () => {
    try {
      const recipes = JSON.parse(localStorage.getItem('savedRecipes') || '[]');
      const preferences = localStorage.getItem('userPreferences');
      
      const exportData = {
        recipes,
        preferences: preferences ? JSON.parse(preferences) : null,
        exportDate: new Date().toISOString(),
        version: '1.0',
        app: 'Fridge to Feast'
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fridge-to-feast-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('Export failed:', error);
      return false;
    }
  };

  // Import all data
  const importAllData = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const importData = JSON.parse(content);
          
          if (importData.recipes) {
            localStorage.setItem('savedRecipes', JSON.stringify(importData.recipes));
          }
          
          if (importData.preferences) {
            localStorage.setItem('userPreferences', JSON.stringify(importData.preferences));
          }
          
          checkStorageHealth();
          resolve(true);
        } catch (error) {
          console.error('Import failed:', error);
          resolve(false);
        }
      };
      reader.readAsText(file);
    });
  };

  useEffect(() => {
    checkStorageHealth();
    
    const handleStorageChange = () => {
      checkStorageHealth();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [checkStorageHealth]);

  return {
    storageInfo,
    showWarning,
    setShowWarning,
    checkStorageHealth,
    cleanupStorage,
    exportAllData,
    importAllData
  };
}

// Storage Warning Component
export function StorageWarning({ onDismiss }: { onDismiss: () => void }) {
  const { t } = useLanguage();
  return (
    <div className="fixed bottom-4 right-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 max-w-sm shadow-lg z-50">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
            {t("storage.warning.title")}
          </h4>
          <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
            {t("storage.yourBrowserStorageIsGettingFull")}
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="flex-shrink-0 text-yellow-400 hover:text-yellow-600 dark:hover:text-yellow-300"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
} 