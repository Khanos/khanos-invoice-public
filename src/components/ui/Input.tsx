"use client";

import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";

interface BaseInputProps {
  label?: string;
  error?: string;
}

type InputProps = BaseInputProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, "className">;

type TextareaProps = BaseInputProps &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className"> & {
    rows?: number;
  };

const inputBaseClass =
  "w-full px-3 py-2.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg transition-all duration-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent hover:border-gray-300";

const labelClass = "block text-xs font-medium text-gray-500 mb-1.5";
const errorClass = "text-xs text-red-500 mt-1";

/**
 * Styled input component with optional label
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  function InputInner({ label, error, ...props }, ref) {
    return (
      <div>
        {label && <label className={labelClass}>{label}</label>}
        <input ref={ref} className={inputBaseClass} {...props} />
        {error && <p className={errorClass}>{error}</p>}
      </div>
    );
  }
);

/**
 * Styled textarea component with optional label
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function TextareaInner({ label, error, rows = 2, ...props }, ref) {
    return (
      <div>
        {label && <label className={labelClass}>{label}</label>}
        <textarea
          ref={ref}
          rows={rows}
          className={`${inputBaseClass} resize-none`}
          {...props}
        />
        {error && <p className={errorClass}>{error}</p>}
      </div>
    );
  }
);

export default Input;
