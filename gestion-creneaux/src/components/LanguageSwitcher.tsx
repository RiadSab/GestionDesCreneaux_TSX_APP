import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import '../styles/components/LanguageSwitcher.css';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="language-switcher">
      <button
        className={`language-button ${language === 'en' ? 'active' : ''}`}
        onClick={() => setLanguage('en')}
        aria-label={t('language.english')}
      >
        EN
      </button>
      <button
        className={`language-button ${language === 'fr' ? 'active' : ''}`}
        onClick={() => setLanguage('fr')}
        aria-label={t('language.french')}
      >
        FR
      </button>
    </div>
  );
};

export default LanguageSwitcher;
