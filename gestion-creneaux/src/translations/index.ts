import enTranslationsData from './en.json';
import frTranslationsData from './fr.json';

type TranslationsType = {
  [key: string]: string;
};

export const enTranslations: TranslationsType = enTranslationsData;
export const frTranslations: TranslationsType = frTranslationsData;

export const getTranslations = (language: string = 'en'): TranslationsType => {
  switch (language) {
    case 'en':
      return enTranslations;
    case 'fr':
      return frTranslations;
    default:
      return enTranslations;
  }
};

// Helper function to get a specific translation key
export const getTranslation = (
  key: string,
  language: string = 'en',
): string => {
  const translations = getTranslations(language);
  return translations[key] || key;
};

// Helper function to change the language
export const setLanguage = (language: string): void => {
  localStorage.setItem('preferredLanguage', language);
};

// Helper function to get the current language
export const getCurrentLanguage = (): string => {
  return localStorage.getItem('preferredLanguage') || 'en';
};
