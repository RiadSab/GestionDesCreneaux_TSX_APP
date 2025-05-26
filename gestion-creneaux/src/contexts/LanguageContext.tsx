import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { enTranslations } from '../translations/en';
import { frTranslations } from '../translations/fr';

type Translations = Record<string, string>;
type Language = 'en' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isTranslationsLoaded: boolean;
  setCurrentPage: (page: string) => void;
  currentPage?: string | null;
  isCurrentPage?: (page: string) => boolean;
}

const translations: Record<Language, Translations> = {
  en: enTranslations,
  fr: frTranslations,
};

const DEFAULT_LANGUAGE: Language = 'en';

const LanguageContext = createContext<LanguageContextType>({
  language: DEFAULT_LANGUAGE,
  setLanguage: () => {},
  t: (key: string) => key,
  isTranslationsLoaded: false,
  setCurrentPage: () => {},
  currentPage: null,
  isCurrentPage: () => false,
});

export const useLanguage = () => useContext(LanguageContext);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  // Try to get stored language preference, or default to browser language
  const getInitialLanguage = (): Language => {
    const storedLanguage = localStorage.getItem('language') as Language | null;
    if (storedLanguage && ['en', 'fr'].includes(storedLanguage)) {
      return storedLanguage;
    }
    
    // Check browser language
    const browserLanguage = navigator.language.split('-')[0];
    if (browserLanguage === 'fr') {
      return 'fr';
    }
    
    return DEFAULT_LANGUAGE;
  };

  const [language, setLanguageState] = useState<Language>(getInitialLanguage());
  const [isTranslationsLoaded, setIsTranslationsLoaded] = useState<boolean>(false);
  const [currentPage, setCurrentPageState] = useState<string | null>(null);

  useEffect(() => {
    // Set translations as loaded after initial render
    setIsTranslationsLoaded(true);
    
    // Store language preference
    localStorage.setItem('language', language);
    
    // Update document language for accessibility
    document.documentElement.lang = language;
  }, [language]); // This effect is fine for setting the HTML lang attribute.

  const setLanguage = (lang: Language) => {
    if (lang !== language) {
      setLanguageState(lang);
    }
  };

  const t = (key: string): string => {
    // Check if the key exists in the current language
    if (translations[language] && translations[language][key]) {
      return translations[language][key];
    }
    
    // Fallback to English if the translation is missing
    if (translations.en && translations.en[key]) {
      console.warn(`Missing translation for key "${key}" in ${language}`);
      return translations.en[key];
    }
    
    // Return the key itself if no translation found
    console.warn(`Translation key not found: "${key}"`);
    return key;
  };

  const setCurrentPage = (page: string) => {
    setCurrentPageState(page);
  };

  const isCurrentPage = (page: string) => {
    return currentPage === page;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        isTranslationsLoaded,
        setCurrentPage,
        currentPage,
        isCurrentPage,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};
