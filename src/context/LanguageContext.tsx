import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Language, LanguageContextType } from '../types/i18n';
import { translations } from '../constants/translations';

const STORAGE_KEY = 'bochka_lang';

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export interface LanguageProviderProps {
  children?: React.ReactNode;
  defaultLanguage?: Language;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children, defaultLanguage }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (defaultLanguage) {
      return defaultLanguage;
    }
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'ru' || saved === 'uz') {
        return saved;
      }
    } catch {
      // In case localStorage is disabled or restricted
    }
    return 'ru';
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore storage errors
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => {
      const next = prev === 'ru' ? 'uz' : 'ru';
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // ignore storage errors
      }
      return next;
    });
  }, []);

  // Update HTML lang attribute
  useEffect(() => {
    try {
      document.documentElement.lang = language;
    } catch {
      // ignore if SSR/test environment without document
    }
  }, [language]);

  const t = useCallback((path: string): string => {
    const keys = path.split('.');
    
    // Resolve for current language
    let current: unknown = translations[language];
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = (current as Record<string, unknown>)[key];
      } else {
        current = undefined;
        break;
      }
    }

    if (typeof current === 'string') {
      return current;
    }

    // Fallback to Russian if missing in Uzbek
    let fallback: unknown = translations.ru;
    for (const key of keys) {
      if (fallback && typeof fallback === 'object' && key in fallback) {
        fallback = (fallback as Record<string, unknown>)[key];
      } else {
        fallback = undefined;
        break;
      }
    }

    if (typeof fallback === 'string') {
      return fallback;
    }

    return path;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};

export const useLanguage = useTranslation;
