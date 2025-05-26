import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const TranslationTester: React.FC = () => {
  const { t, language, setLanguage, isTranslationsLoaded } = useLanguage();

  // Define some keys to test
  const testKeys = [
    'app.title',
    'nav.dashboard',
    'nav.bookings',
    'auth.login',
    'auth.passwordLength',
  ];

  return (
    <div style={{ margin: '20px', padding: '20px', border: '1px solid #ccc' }}>
      <h2>Translation Tester</h2>
      <div>
        <p>
          Current language: <strong>{language}</strong>
        </p>
        <p>
          Translations loaded:{' '}
          <strong>{isTranslationsLoaded ? 'Yes' : 'No'}</strong>
        </p>
        <button onClick={() => setLanguage('en')}>English</button>
        <button onClick={() => setLanguage('fr')}>French</button>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>Test Translations:</h3>
        <ul>
          {testKeys.map((key) => (
            <li key={key}>
              <strong>{key}:</strong> {t(key)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TranslationTester;
