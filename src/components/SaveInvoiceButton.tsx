"use client";

import { useState } from "react";
import { InvoiceData } from "@/types/invoice";
import { saveInvoiceAction } from "@/app/actions/invoice";
import { useTranslation } from "@/hooks/useTranslation";

interface SaveInvoiceButtonProps {
  data: InvoiceData;
  currentInvoiceId: number | null;
  onSaved: (id: number) => void;
}

type SaveState = "idle" | "saving" | "saved" | "error";

export default function SaveInvoiceButton({
  data,
  currentInvoiceId,
  onSaved,
}: SaveInvoiceButtonProps) {
  const { t } = useTranslation();
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const handleSave = async () => {
    setSaveState("saving");

    try {
      const result = await saveInvoiceAction(data, currentInvoiceId ?? undefined);

      if (result.success && result.id) {
        setSaveState("saved");
        onSaved(result.id);

        // Reset to idle after 2 seconds
        setTimeout(() => {
          setSaveState("idle");
        }, 2000);
      } else {
        setSaveState("error");
        console.error("Save failed:", result.error);

        // Reset to idle after 3 seconds
        setTimeout(() => {
          setSaveState("idle");
        }, 3000);
      }
    } catch (error) {
      console.error("Error saving invoice:", error);
      setSaveState("error");

      // Reset to idle after 3 seconds
      setTimeout(() => {
        setSaveState("idle");
      }, 3000);
    }
  };

  const getButtonContent = () => {
    switch (saveState) {
      case "saving":
        return (
          <>
            <svg
              className="w-5 h-5 animate-spin"
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
            {t("saving")}
          </>
        );
      case "saved":
        return (
          <>
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
                d="M5 13l4 4L19 7"
              />
            </svg>
            {t("saved")}
          </>
        );
      case "error":
        return (
          <>
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            {t("saveFailed")}
          </>
        );
      default:
        return (
          <>
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
                d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
              />
            </svg>
            {t("saveInvoice")}
          </>
        );
    }
  };

  const getButtonClasses = () => {
    const baseClasses =
      "inline-flex items-center gap-2 px-4 py-2 font-medium rounded-lg shadow-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

    switch (saveState) {
      case "saving":
        return `${baseClasses} bg-gray-100 text-gray-600 cursor-wait`;
      case "saved":
        return `${baseClasses} bg-green-500 text-white`;
      case "error":
        return `${baseClasses} bg-red-500 text-white hover:bg-red-600`;
      default:
        return `${baseClasses} bg-white text-gray-700 border border-gray-300 hover:bg-gray-50`;
    }
  };

  return (
    <button
      onClick={handleSave}
      disabled={saveState === "saving"}
      className={getButtonClasses()}
    >
      {getButtonContent()}
    </button>
  );
}
