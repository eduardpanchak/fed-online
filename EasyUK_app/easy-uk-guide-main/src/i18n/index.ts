import enTranslations from './translations/en.json';
import ukTranslations from './translations/uk.json';
import ruTranslations from './translations/ru.json';
import plTranslations from './translations/pl.json';
import ltTranslations from './translations/lt.json';

export type Language = 'en' | 'uk' | 'ru' | 'pl' | 'lt';

export const translations: Record<Language, Record<string, any>> = {
  en: enTranslations,
  uk: ukTranslations,
  ru: ruTranslations,
  pl: plTranslations,
  lt: ltTranslations,
};

export const LANGUAGE_STORAGE_KEY = 'app-language';

export const getStoredLanguage = (): Language => {
  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return (stored && ['en', 'uk', 'ru', 'pl', 'lt'].includes(stored) ? stored : 'en') as Language;
};

export const setStoredLanguage = (lang: Language): void => {
  localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
};
