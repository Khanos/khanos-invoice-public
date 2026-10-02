"use client";

import { useState, useEffect } from "react";
import { InvoiceSummary } from "@/types/database";
import { getInvoicesAction, loadInvoiceAction, deleteInvoiceAction } from "@/app/actions/invoice";
import { InvoiceData } from "@/types/invoice";
import { useTranslation } from "@/hooks/useTranslation";

interface InvoiceSelectorProps {
  currentInvoiceId: number | null;
  onSelect: (data: InvoiceData, id: number) => void;
  onNew: () => void;
  onInvoiceDeleted?: () => void;
}

export default function InvoiceSelector({
  currentInvoiceId,
  onSelect,
  onNew,
  onInvoiceDeleted,
}: InvoiceSelectorProps) {
  const { t } = useTranslation();
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  // Fetch invoices on mount
  useEffect(() => {
    async function fetchInvoices() {
      setIsLoading(true);
      try {
        const data = await getInvoicesAction();
        setInvoices(data);
      } catch (error) {
        console.error("Error fetching invoices:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchInvoices();
  }, []);

  const handleSelect = async (invoice: InvoiceSummary) => {
    setLoadingId(invoice.id);
    try {
      const data = await loadInvoiceAction(invoice.id);
      if (data) {
        onSelect(data, invoice.id);
      }
    } catch (error) {
      console.error("Error loading invoice:", error);
    } finally {
      setLoadingId(null);
      setIsOpen(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, invoiceId: number) => {
    e.stopPropagation();
    if (!confirm(t("deleteConfirmation"))) return;

    try {
      const result = await deleteInvoiceAction(invoiceId);
      if (result.success) {
        setInvoices(invoices.filter((inv) => inv.id !== invoiceId));
        if (currentInvoiceId === invoiceId) {
          onInvoiceDeleted?.();
        }
      }
    } catch (error) {
      console.error("Error deleting invoice:", error);
    }
  };

  const handleNew = () => {
    onNew();
    setIsOpen(false);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const currentInvoice = invoices.find((inv) => inv.id === currentInvoiceId);

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-lg bg-white hover:bg-gray-50 transition-colors min-w-[200px] ${
          currentInvoiceId === null
            ? "border-amber-300 text-amber-800"
            : "border-gray-300"
        }`}
      >
        <svg
          className="w-4 h-4 text-gray-500"
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
        {currentInvoiceId === null && (
          <span
            className="w-2 h-2 rounded-full bg-amber-500 shrink-0"
            aria-hidden="true"
          />
        )}
        <span className="flex-1 text-left truncate">
          {isLoading
            ? t("loadingInvoices")
            : currentInvoice
            ? `${currentInvoice.invoice_number}`
            : currentInvoiceId === null
            ? t("unsavedInvoice")
            : `ID: ${currentInvoiceId}`}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-80 overflow-auto">
            {/* New Invoice Option */}
            <button
              onClick={handleNew}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-cyan-600 hover:bg-cyan-50 border-b border-gray-100"
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              {t("newInvoice")}
            </button>

            {/* Invoice List */}
            {isLoading ? (
              <div className="px-4 py-3 text-sm text-gray-500">
                {t("loadingInvoices")}
              </div>
            ) : invoices.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500">
                {t("noSavedInvoices")}
              </div>
            ) : (
              invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  onClick={() => handleSelect(invoice)}
                  className={`flex items-center justify-between px-4 py-3 hover:bg-gray-50 cursor-pointer ${
                    currentInvoiceId === invoice.id ? "bg-cyan-50" : ""
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {invoice.invoice_number}
                    </div>
                    <div className="text-xs text-gray-500">
                      {invoice.title} &bull; {formatDate(invoice.created_at)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    {loadingId === invoice.id && (
                      <svg
                        className="w-4 h-4 animate-spin text-cyan-500"
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
                    )}
                    <button
                      onClick={(e) => handleDelete(e, invoice.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      title={t("deleteInvoice")}
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
