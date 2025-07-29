"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Import translation files
import enTranslations from '../locales/en.json';
import esTranslations from '../locales/es.json';
import frTranslations from '../locales/fr.json';
import deTranslations from '../locales/de.json';
import itTranslations from '../locales/it.json';
import ptTranslations from '../locales/pt.json';
import plTranslations from '../locales/pl.json';

// Language options
export const languages = {
  en: { name: 'English', flag: '🇺🇸' },
  es: { name: 'Español', flag: '🇪🇸' },
  fr: { name: 'Français', flag: '🇫🇷' },
  de: { name: 'Deutsch', flag: '🇩🇪' },
  it: { name: 'Italiano', flag: '🇮🇹' },
  pt: { name: 'Português', flag: '🇵🇹' },
  pl: { name: 'Polski', flag: '🇵🇱' },
};

export type Language = keyof typeof languages;

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  languages: typeof languages;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation data
const translations: Record<Language, Record<string, unknown>> = {
  en: enTranslations,
  es: esTranslations,
  fr: frTranslations,
  de: deTranslations,
  it: itTranslations,
  pt: ptTranslations,
  pl: plTranslations,
};

// Helper function to get nested translation
const getNestedTranslation = (obj: Record<string, unknown>, path: string): string => {
  const keys = path.split('.');
  let current: unknown = obj;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return path; // Return the original path if not found
    }
  }
  
  return typeof current === 'string' ? current : path;
};

// Helper function to replace parameters in translation
const replaceParams = (text: string, params?: Record<string, string | number>): string => {
  if (!params) return text;
  return Object.entries(params).reduce((result, [key, value]) => {
    return result.replace(new RegExp(`{${key}}`, 'g'), String(value));
  }, text);
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');

  // Initialize language from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage') as Language;
    
    if (savedLanguage && languages[savedLanguage]) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  // Translation function
  const t = (key: string, params?: Record<string, string | number>): string => {
    const translation = getNestedTranslation(translations[currentLanguage], key);
    return replaceParams(translation, params);
  };

  // Set language function
  const setLanguage = (lang: Language) => {
    if (languages[lang]) {
      setCurrentLanguage(lang);
      localStorage.setItem('preferredLanguage', lang);
      
      // For now, we'll just update the language state
      // In a full i18n setup, you might want to redirect to localized routes
    }
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t, languages }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
} 