'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load language from localStorage on mount
      const saved = localStorage.getItem('language') as Language;
      if (saved && (saved === 'en' || saved === 'ar')) {
        setLanguageState(saved);
        document.documentElement.lang = saved;
        document.documentElement.dir = saved === 'ar' ? 'rtl' : 'ltr';
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang);
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    }
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    dir: language === 'ar' ? 'rtl' : 'ltr'
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Return default values for SSR
    return {
      language: 'en' as Language,
      setLanguage: () => {},
      dir: 'ltr' as const
    };
  }
  return context;
}

// next-intl compatibility adapters
export function useTranslations(namespace?: string) {
  void namespace;
  return (key: string) => {
    // Return key as fallback for now - prevents build errors
    return key;
  };
}

export function useLocale() {
  const { language } = useLanguage();
  return language;
}
