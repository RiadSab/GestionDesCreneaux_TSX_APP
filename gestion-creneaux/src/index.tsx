import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './components/App';
import reportWebVitals from './reportWebVitals';
import { LanguageProvider } from './contexts/LanguageContext';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);
root.render(
  <React.StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </React.StrictMode>,
);

reportWebVitals();
