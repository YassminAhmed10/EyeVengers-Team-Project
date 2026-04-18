import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from './translations';

// Create context
const LanguageContext = createContext();

// Export hook for easy access
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Provider component
export const LanguageProvider = ({ children }) => {
  // Get initial language from localStorage or default to 'en'
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('pharmaflow-language');
    return saved || 'en';
  });

  // Update localStorage when language changes
  useEffect(() => {
    localStorage.setItem('pharmaflow-language', language);
    
    // Update document direction for RTL support
    if (language === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = 'en';
    }
  }, [language]);

  // Function to get translation
  const t = (section, key) => {
    try {
      return translations[section]?.[language]?.[key] || 
             translations.common[language]?.[key] || 
             key;
    } catch (e) {
      console.warn(`Translation not found: ${section}.${key}`);
      return key;
    }
  };

  // Toggle language
  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ar' : 'en');
  };

  // Check if current language is RTL
  const isRTL = language === 'ar';

  const value = {
    language,
    setLanguage,
    t,
    toggleLanguage,
    isRTL,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;

