"use client";

import { useLanguage } from "@/context/LanguageContext";
import { type Locale, localeFlags, localeNames } from "@/lib/i18n";

const locales: Locale[] = ["es", "en"];

/**
 * Flag-based language toggle component
 * Displays language flags with visual indicator for active language
 */
export default function LanguageToggle() {
  const { locale, setLocale, isLoaded } = useLanguage();

  // Prevent hydration mismatch by not rendering until loaded
  if (!isLoaded) {
    return (
      <div className="flex items-center gap-1 print:hidden">
        <span className="w-8 h-8 rounded-md bg-gray-100 animate-pulse" />
        <span className="w-8 h-8 rounded-md bg-gray-100 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 print:hidden" role="group" aria-label="Language selection">
      {locales.map((loc) => {
        const isActive = locale === loc;
        return (
          <button
            key={loc}
            onClick={() => setLocale(loc)}
            className={`
              flex items-center justify-center w-8 h-8 rounded-md text-lg
              transition-all duration-200
              ${isActive
                ? "bg-cyan-100 ring-2 ring-cyan-500 scale-110"
                : "bg-gray-100 hover:bg-gray-200 opacity-60 hover:opacity-100"
              }
            `}
            aria-label={`Switch to ${localeNames[loc]}`}
            aria-pressed={isActive}
            title={localeNames[loc]}
          >
            {localeFlags[loc]}
          </button>
        );
      })}
    </div>
  );
}
