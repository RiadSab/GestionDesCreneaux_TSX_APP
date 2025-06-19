import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { enTranslations } from '../translations/en';
import { frTranslations } from '../translations/fr';

// Définit le type pour un objet de traductions (clé: chaîne, valeur: chaîne)
type Translations = Record<string, string>;
// Définit les langues supportées
type Language = 'en' | 'fr';

// Interface décrivant la forme du contexte de langue
interface LanguageContextType {
  language: Language; // Langue actuelle
  setLanguage: (lang: Language) => void; // Fonction pour changer la langue
  t: (key: string) => string; // Fonction de traduction
  isTranslationsLoaded: boolean; // Indique si les traductions sont chargées
}

// Stocke les traductions pour chaque langue
const translations: Record<Language, Translations> = {
  en: enTranslations, // Traductions anglaises
  fr: frTranslations, // Traductions françaises
};

// Langue par défaut de l'application
const DEFAULT_LANGUAGE: Language = 'en';

// Crée le contexte React avec des valeurs par défaut
const LanguageContext = createContext<LanguageContextType>({
  language: DEFAULT_LANGUAGE, // Langue par défaut
  setLanguage: () => {}, // Fonction vide par défaut pour setLanguage
  t: (key: string) => key, // Fonction de traduction par défaut (retourne la clé si non trouvée)
  isTranslationsLoaded: false, // Par défaut, les traductions ne sont pas chargées
});

// Hook personnalisé pour utiliser facilement le contexte de langue
export const useLanguage = () => useContext(LanguageContext);

// Interface pour les props du LanguageProvider
interface LanguageProviderProps {
  children: ReactNode; // Les composants enfants qui auront accès au contexte
}

// Composant Provider qui enveloppe l'application pour fournir le contexte de langue
export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  // Fonction pour déterminer la langue initiale (localStorage, navigateur, ou défaut)
  const getInitialLanguage = (): Language => {
    // Vérifie si une langue est stockée dans le localStorage
    const storedLanguage = localStorage.getItem('language') as Language | null;
    if (storedLanguage && ['en', 'fr'].includes(storedLanguage)) {
      return storedLanguage;
    }

    // Sinon, essaie de détecter la langue du navigateur
    const browserLanguage = navigator.language.split('-')[0];
    if (browserLanguage === 'fr') {
      return 'fr';
    }
    
    // Sinon, utilise la langue par défaut
    return DEFAULT_LANGUAGE;
  };

  // État pour la langue actuelle, initialisé avec getInitialLanguage
  const [language, setLanguageState] = useState<Language>(getInitialLanguage());
  // État pour indiquer si les traductions sont chargées
  const [isTranslationsLoaded, setIsTranslationsLoaded] = useState<boolean>(false);

  // useEffect pour mettre à jour des choses quand la langue change
  useEffect(() => {
    // Marque les traductions comme chargées (simplifié, pourrait être plus complexe)
    setIsTranslationsLoaded(true);
    
    // Sauvegarde la langue actuelle dans le localStorage
    localStorage.setItem('language', language);
    
    // Met à jour l'attribut lang de la balise <html> pour l'accessibilité et le SEO
    document.documentElement.lang = language;
  }, [language]); // Se déclenche uniquement si la langue change

  // Fonction pour changer la langue de l'application
  const setLanguage = (lang: Language) => {
    // Change l'état seulement si la nouvelle langue est différente de l'actuelle
    if (lang !== language) {
      setLanguageState(lang);
    }
  };

  // Fonction de traduction (t)
  const t = (key: string): string => {
    // Vérifie si la traduction existe pour la langue actuelle
    if (translations[language] && translations[language][key]) {
      return translations[language][key];
    }
    
    // Si non trouvée, essaie de fournir la traduction en anglais par défaut (fallback)
    if (translations.en && translations.en[key]) {
      console.warn(`Missing translation for key "${key}" in ${language}`);
      return translations.en[key];
    }
    
    // Si la clé n'est trouvée nulle part, affiche un avertissement et retourne la clé elle-même
    console.warn(`Translation key not found: "${key}"`);
    return key;
  };

  // Retourne le Provider du contexte avec les valeurs actuelles
  return (
    <LanguageContext.Provider
      value={{
        language, // Langue actuelle
        setLanguage, // Fonction pour changer la langue
        t, // Fonction de traduction
        isTranslationsLoaded, // État du chargement des traductions
      }}
    >
      {children} {/* Les composants enfants peuvent maintenant accéder à ces valeurs via useLanguage */}
    </LanguageContext.Provider>
  );
};
