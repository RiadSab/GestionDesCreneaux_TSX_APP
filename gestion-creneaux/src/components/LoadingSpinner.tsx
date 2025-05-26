import React from 'react';
import '../styles/components/LoadingSpinner.css';
import { useLanguage } from '../contexts/LanguageContext';

interface LoadingSpinnerProps {
  textKey?: string; // This prop determines the translation key for the loading message
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ textKey }) => {
  const { t, language, isTranslationsLoaded } = useLanguage(); // Added language and isTranslationsLoaded for debugging

  // Determine the text to display
  let displayText: string | null = null;
  if (textKey) {
    if (isTranslationsLoaded) {
      displayText = t(textKey);
      // For debugging, you can uncomment this:
      // console.log(`LoadingSpinner Debug: lang=${language}, textKey='${textKey}', translated='${displayText}', loaded=${isTranslationsLoaded}`);
    } else {
      // If translations are not yet loaded, you might want a generic, non-translated message
      // or rely on t() to return the key or a default from LanguageContext.
      // For now, we'll let t() handle it, which might return the key if not loaded.
      displayText = t(textKey);
      // console.log(`LoadingSpinner Debug (translations NOT loaded): lang=${language}, textKey='${textKey}', attempted_translation='${displayText}'`);
    }
  }

  return (
    <div className="loading-container">
      <div className="spinner"></div>
      {/* Display the translated text if a textKey was provided and translation resulted in some text */}
      {displayText && <p className="loading-text">{displayText}</p>}
    </div>
  );
};

export default LoadingSpinner;
