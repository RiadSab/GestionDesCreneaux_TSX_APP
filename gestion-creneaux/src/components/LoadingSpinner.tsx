import React from 'react';
import '../styles/components/LoadingSpinner.css';
import { useLanguage } from '../contexts/LanguageContext';

interface LoadingSpinnerProps {
  textKey?: string;
}

function LoadingSpinner({ textKey }: LoadingSpinnerProps) {
  const { t } = useLanguage();
  let displayText: string | null = null;
  if (textKey) {
    displayText = t(textKey);
  }
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      {displayText && <p className="loading-text">{displayText}</p>}
    </div>
  );
};


export default LoadingSpinner;
