"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

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
const translations: Record<Language, any> = {
  en: require('../locales/en.json'),
  es: require('../locales/es.json'),
  fr: require('../locales/fr.json'),
  de: require('../locales/de.json'),
  it: require('../locales/it.json'),
  pt: require('../locales/pt.json'),
  pl: require('../locales/pl.json'),
};

// Helper function to get nested translation
const getNestedTranslation = (obj: any, path: string): string => {
  return path.split('.').reduce((current, key) => current?.[key], obj) || path;
};

// Helper function to replace parameters in translation
const replaceParams = (text: string, params?: Record<string, string | number>): string => {
  if (!params) return text;
  return Object.entries(params).reduce((result, [key, value]) => {
    return result.replace(new RegExp(`{${key}}`, 'g'), String(value));
  }, text);
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
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
      // router.push(pathname, { locale: lang });
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