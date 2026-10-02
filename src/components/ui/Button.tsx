"use client";

import { ButtonHTMLAttributes, forwardRef, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconOnly?: boolean;
  loading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-cyan-500 text-white shadow-md hover:bg-cyan-600 active:bg-cyan-700 disabled:bg-cyan-300",
  secondary:
    "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 active:bg-gray-100 disabled:bg-gray-50 disabled:text-gray-400",
  ghost:
    "bg-transparent text-gray-600 hover:bg-gray-100 active:bg-gray-200 disabled:text-gray-400",
  destructive:
    "bg-transparent text-red-600 hover:bg-red-50 active:bg-red-100 disabled:text-red-300",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs gap-1.5",
  md: "px-4 py-2 text-sm gap-2",
  lg: "px-6 py-3 text-sm gap-2",
};

const iconOnlySizeStyles: Record<ButtonSize, string> = {
  sm: "p-1.5",
  md: "p-2",
  lg: "p-3",
};

/**
 * Button component with multiple variants and sizes
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(function ButtonInner(
  {
    variant = "secondary",
    size = "md",
    icon,
    iconOnly = false,
    loading = false,
    children,
    disabled,
    ...props
  },
  ref
) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2";

  const sizeClass = iconOnly ? iconOnlySizeStyles[size] : sizeStyles[size];

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeClass}`}
      {...props}
    >
      {loading ? (
        <svg
          className="w-4 h-4 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : (
        icon
      )}
      {!iconOnly && children}
    </button>
  );
});

export default Button;
