import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../utils/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('rajpatra_language') || 'en';
  });

  const [fontSizeLevel, setFontSizeLevel] = useState(0); // -1: small, 0: normal, 1: large

  useEffect(() => {
    localStorage.setItem('rajpatra_language', language);
    document.documentElement.lang = language;
  }, [language]);

  const switchLanguage = (newLang) => {
    if (['en', 'hi', 'pa'].includes(newLang)) {
      setLanguage(newLang);
    }
  };

  /**
   * Helper to retrieve static UI text
   */
  const t = (key) => {
    if (!translations[language]) {
      return translations.en[key] || key;
    }
    return translations[language][key] || translations.en[key] || key;
  };

  /**
   * Helper to retrieve localized multilingual fields from Order objects
   */
  const getLocalized = (fieldObj) => {
    if (!fieldObj) return '';
    if (typeof fieldObj === 'string') return fieldObj;
    return fieldObj[language] || fieldObj.en || '';
  };

  const adjustFontSize = (level) => {
    setFontSizeLevel(level);
    if (level === 1) {
      document.documentElement.style.fontSize = '18px';
    } else if (level === -1) {
      document.documentElement.style.fontSize = '14px';
    } else {
      document.documentElement.style.fontSize = '16px';
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        switchLanguage,
        t,
        getLocalized,
        fontSizeLevel,
        adjustFontSize,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
