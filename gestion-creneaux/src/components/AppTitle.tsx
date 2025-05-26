import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const AppTitle: React.FC = () => {
  const { t } = useLanguage();

  return <div className="app-title">{t('app.title')}</div>;
};

export default AppTitle;
