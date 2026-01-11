import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import ptTranslations from "../locales/pt.json";
import enTranslations from "../locales/en.json";

export type Language = "pt" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

// Load translations from JSON files
const translations: Record<Language, Record<string, unknown>> = {
  pt: ptTranslations,
  en: enTranslations,
};

// Helper to get nested value from object using dot notation
const getNestedValue = (obj: Record<string, unknown>, path: string): string => {
  const keys = path.split(".");
  let current: unknown = obj;

  for (const key of keys) {
    if (current && typeof current === "object" && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return path; // Return key if not found
    }
  }

  return typeof current === "string" ? current : path;
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem("bundlros_language");
    return (stored as Language) || "pt"; // Default to Portuguese
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("bundlros_language", lang);
  };

  /**
   * Translation function
   * Usage: t('sidebar.inbox') -> "Caixa de Entrada" (PT) or "Inbox" (EN)
   */
  const t = (key: string): string => {
    return getNestedValue(translations[language], key);
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

// Export available languages for UI
export const availableLanguages = [
  { code: "pt" as Language, name: "Português", flag: "🇵🇹" },
  { code: "en" as Language, name: "English", flag: "🇬🇧" },
];

// Re-export translations for direct access if needed
export { translations };
