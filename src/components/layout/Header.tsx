"use client";

import { ReactNode } from "react";
import { useSession } from "next-auth/react";
import { useTranslation } from "@/hooks/useTranslation";
import LanguageToggle from "@/components/LanguageToggle";
import ActionMenu from "./ActionMenu";

interface HeaderProps {
  /** Center content - typically the invoice selector */
  centerContent?: ReactNode;
  /** Primary action button - typically the download/print button */
  primaryAction?: ReactNode;
  /** Action menu items for the dropdown */
  menuItems?: {
    label: string;
    icon?: ReactNode;
    onClick: () => void;
    variant?: "default" | "destructive";
    disabled?: boolean;
  }[];
}

/**
 * App header with 3-zone layout:
 * - Left: Logo/Title
 * - Center: Invoice selector (on larger screens)
 * - Right: Actions (language, menu, primary CTA)
 */
export default function Header({
  centerContent,
  primaryAction,
  menuItems = [],
}: HeaderProps) {
  const { t } = useTranslation();
  const { data: session } = useSession();

  return (
    <header className="bg-white border-b border-gray-200 print:hidden">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Zone: Logo/Title */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Logo Icon */}
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            {/* Title - hidden on mobile */}
            <h1 className="text-lg font-semibold text-gray-900 hidden sm:block">
              {t("invoiceGenerator")}
            </h1>
          </div>

          {/* Center Zone: Invoice Selector (hidden on mobile) */}
          {centerContent && (
            <div className="hidden md:flex flex-1 justify-center px-4">
              {centerContent}
            </div>
          )}

          {/* Right Zone: Actions */}
          <div className="flex items-center gap-2">
            {/* Invoice Selector on mobile - shown below title */}
            {centerContent && (
              <div className="md:hidden mr-2">{centerContent}</div>
            )}

            {/* Language Toggle */}
            <LanguageToggle />

            {/* Action Menu (3-dot) */}
            {menuItems.length > 0 && (
              <ActionMenu
                items={menuItems}
                userName={session?.user?.name || undefined}
              />
            )}

            {/* Primary Action (Download/Print) */}
            {primaryAction && (
              <div className="hidden sm:block ml-2">{primaryAction}</div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile: Primary action as full-width button below header */}
      {primaryAction && (
        <div className="sm:hidden px-4 pb-3">{primaryAction}</div>
      )}
    </header>
  );
}
