import * as React from 'react';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Language, getStoredLanguage, setStoredLanguage } from '@/i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(getStoredLanguage);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    setStoredLanguage(lang);
  };

  const t = (key: string, params?: Record<string, string>): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
        }
    
    let result = value || key;
    
    if (params && typeof result === 'string') {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        result = result.replace(new RegExp(`{${paramKey}}`, 'g'), paramValue);
      });
    }
    
    return result;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
