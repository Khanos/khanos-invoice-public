"use client";

import { useCallback } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  type TranslationKey,
  getTranslation,
} from "@/lib/i18n";

interface UseTranslationReturn {
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  locale: string;
}

/**
 * Hook to access translations in components
 * Returns a t() function for translating keys
 */
export function useTranslation(): UseTranslationReturn {
  const { locale } = useLanguage();

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>): string => {
      return getTranslation(locale, key, params);
    },
    [locale]
  );

  return { t, locale };
}
