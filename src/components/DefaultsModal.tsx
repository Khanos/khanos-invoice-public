"use client";

import { useEffect, useRef, useState } from "react";

import InvoiceForm from "@/components/invoice/InvoiceForm";
import { Button } from "@/components/ui";
import { useTranslation } from "@/hooks/useTranslation";
import { InvoiceData } from "@/types/invoice";

interface DefaultsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DefaultsModal({
  isOpen,
  onClose,
}: DefaultsModalProps) {
  const { t } = useTranslation();
  const [defaults, setDefaults] = useState<InvoiceData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const controller = new AbortController();

    async function loadDefaults() {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch("/api/user-defaults", {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Failed to load defaults: ${response.status}`);
        }
        setDefaults(await response.json());
      } catch (loadError) {
        if ((loadError as Error).name !== "AbortError") {
          console.error("Failed to load invoice defaults:", loadError);
          setError(t("defaultsLoadFailed"));
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadDefaults();
    closeButtonRef.current?.focus();
    document.body.style.overflow = "hidden";

    return () => {
      controller.abort();
      document.body.style.overflow = "";
    };
  }, [isOpen, t]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSaving) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, isSaving, onClose]);

  const handleSave = async () => {
    if (!defaults) {
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const response = await fetch("/api/user-defaults", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(defaults),
      });

      if (!response.ok) {
        throw new Error(`Failed to save defaults: ${response.status}`);
      }

      onClose();
    } catch (saveError) {
      console.error("Failed to save invoice defaults:", saveError);
      setError(t("defaultsSaveFailed"));
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-950/50 p-3 sm:p-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSaving) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="defaults-modal-title"
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-gray-50 shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-gray-200 bg-white px-5 py-4">
          <div>
            <h2
              id="defaults-modal-title"
              className="text-lg font-semibold text-gray-900"
            >
              {t("editDefaults")}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {t("editDefaultsDescription")}
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={t("close")}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {isLoading && (
            <div className="flex min-h-48 items-center justify-center text-sm text-gray-500">
              {t("loading")}
            </div>
          )}
          {!isLoading && defaults && (
            <InvoiceForm data={defaults} onChange={setDefaults} />
          )}
        </div>

        <footer className="border-t border-gray-200 bg-white px-5 py-4">
          {error && (
            <p className="mb-3 text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              onClick={onClose}
              disabled={isSaving}
            >
              {t("cancel")}
            </Button>
            <Button
              type="button"
              variant="primary"
              loading={isSaving}
              disabled={!defaults || isLoading}
              onClick={handleSave}
            >
              {isSaving ? t("savingDefaults") : t("saveDefaults")}
            </Button>
          </div>
        </footer>
      </section>
    </div>
  );
}
