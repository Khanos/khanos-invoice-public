"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { signOut } from "next-auth/react";
import { clearInvoiceDrafts } from "@/lib/invoiceDrafts";
import { useTranslation } from "@/hooks/useTranslation";

interface ActionMenuItem {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: "default" | "destructive";
  disabled?: boolean;
}

interface ActionMenuProps {
  items: ActionMenuItem[];
  userName?: string;
  triggerClassName?: string;
}

/**
 * 3-dot dropdown menu for secondary actions
 */
export default function ActionMenu({
  items,
  userName,
  triggerClassName = "",
}: ActionMenuProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  const handleLogout = () => {
    clearInvoiceDrafts();
    void signOut({ callbackUrl: "/login" });
  };

  return (
    <div ref={menuRef} className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors ${triggerClassName}`}
        aria-label="Actions menu"
        aria-expanded={isOpen}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1 overflow-hidden">
          {/* Menu Items */}
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                item.onClick();
                setIsOpen(false);
              }}
              disabled={item.disabled}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                item.variant === "destructive"
                  ? "text-red-600 hover:bg-red-50"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {item.icon && (
                <span className="w-4 h-4 flex-shrink-0">{item.icon}</span>
              )}
              <span>{item.label}</span>
            </button>
          ))}

          {/* Divider */}
          <div className="my-1 border-t border-gray-100" />

          {/* User Info */}
          {userName && (
            <div className="px-4 py-2 text-xs text-gray-500">
              <span className="font-medium text-gray-700">{userName}</span>
            </div>
          )}

          {/* Sign Out */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span>{t("signOut")}</span>
          </button>
        </div>
      )}
    </div>
  );
}
