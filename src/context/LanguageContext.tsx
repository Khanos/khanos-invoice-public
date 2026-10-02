"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  type Locale,
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
} from "@/lib/i18n";

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  isLoaded: boolean;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined
);

interface LanguageProviderProps {
  children: ReactNode;
}

/**
 * Get the initial locale from localStorage (client-side only)
 * This avoids hydration mismatches by returning DEFAULT_LOCALE during SSR
 */
function getInitialLocale(): Locale {
  if (typeof window === "undefined") {
    return DEFAULT_LOCALE;
  }
  
  try {
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (saved === "en" || saved === "es") {
      return saved;
    }
  } catch {
    // Ignore localStorage errors
  }
  
  return DEFAULT_LOCALE;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  // Start with default locale to avoid hydration mismatch
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load language preference from localStorage after mount (client-side)
  /* eslint-disable react-hooks/set-state-in-effect --
   * The post-mount update intentionally avoids a server/client hydration mismatch.
   */
  useEffect(() => {
    const savedLocale = getInitialLocale();
    if (savedLocale !== locale) {
      setLocaleState(savedLocale);
    }
    setIsLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount
  /* eslint-enable react-hooks/set-state-in-effect */

  // Persist language preference to localStorage
  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    } catch (error) {
      console.error("Failed to save language preference:", error);
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, isLoaded }}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * Hook to access the current language and setter
 */
export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
