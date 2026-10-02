"use client";

import { ReactNode } from "react";

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  headerAction?: ReactNode;
}

/**
 * Reusable card component for form sections
 * Provides consistent styling with optional header
 */
export default function Card({
  title,
  children,
  className = "",
  headerAction,
}: CardProps) {
  return (
    <div
      className={`bg-white border border-gray-200 rounded-xl overflow-hidden ${className}`}
    >
      {(title || headerAction) && (
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50/50">
          {title && (
            <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          )}
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}
