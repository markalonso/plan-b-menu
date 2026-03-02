import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Language = 'ar' | 'en';
type Direction = 'rtl' | 'ltr';

type LanguageContextValue = {
  language: Language;
  direction: Direction;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (arText: string, enText: string) => string;
};

const STORAGE_KEY = 'qr-menu-language';

const FONT_AR = 'Inter, "Noto Sans Arabic", "Tajawal", "Geeza Pro", "Tahoma", system-ui, sans-serif';
const FONT_EN = 'Inter, "SF Pro Text", "Segoe UI", system-ui, sans-serif';
const HEADING_FONT = '"Playfair Display", "Noto Naskh Arabic", serif';

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved === 'en' ? 'en' : 'ar';
  });

  const direction: Direction = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = direction;
    document.documentElement.style.setProperty('--font-family', language === 'ar' ? FONT_AR : FONT_EN);
    document.documentElement.style.setProperty('--font-heading', HEADING_FONT);
    window.localStorage.setItem(STORAGE_KEY, language);
  }, [direction, language]);

  const value = useMemo(
    () => ({
      language,
      direction,
      setLanguage,
      toggleLanguage: () => setLanguage((prev) => (prev === 'ar' ? 'en' : 'ar')),
      t: (arText: string, enText: string) => (language === 'ar' ? arText : enText)
    }),
    [direction, language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useLanguage must be used inside LanguageProvider');
  }

  return context;
}
