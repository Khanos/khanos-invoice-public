"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { signOut, useSession } from "next-auth/react";
import { InvoiceData } from "@/types/invoice";
import { useTranslation } from "@/hooks/useTranslation";

// Layout components
import { Header } from "@/components/layout";

// Invoice components
import InvoiceForm from "@/components/invoice/InvoiceForm";
import InvoicePreview from "@/components/InvoicePreview";
import InvoiceSelector from "@/components/InvoiceSelector";
import DefaultsModal from "@/components/DefaultsModal";

// Actions
import { saveInvoiceAction } from "@/app/actions/invoice";

// UI components
import { Button } from "@/components/ui";

// Print functionality
import { useReactToPrint } from "react-to-print";

import { clearInvoiceDrafts, getInvoiceDraftKey, readInvoiceDraft } from "@/lib/invoiceDrafts";
import { parseInvoiceData } from "@/lib/invoiceValidation";

/**
 * Initial empty state used while loading
 */
const emptyState: InvoiceData = {
  title: "",
  invoiceNumber: "",
  issueDate: "",
  dueDate: "",
  seller: { name: "", address: "", taxId: "", email: "", phone: "", website: "" },
  client: { companyName: "", address: "", country: "", email: "", phone: "" },
  lineItems: [{ id: "1", description: "", amountUSD: 0, amountEUR: 0 }],
  taxRate: 0,
  exchangeRate: 0.85,
  subtotalEUR: 0,
  taxAmountEUR: 0,
  totalEUR: 0,
  notes: [],
};

export default function Home() {
  const { data: session, status } = useSession();
  useEffect(() => {
    if (status === "unauthenticated") clearInvoiceDrafts();
  }, [status]);
  const userId = session?.user?.id;
  const email = session?.user?.email;
  if (status !== "authenticated" || !userId || !email) return <LoadingInvoice />;
  // Remount state when accounts change so one account cannot persist another's draft.
  return <InvoiceWorkspace key={userId} userId={userId} email={email} />;
}

function LoadingInvoice() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex items-center gap-3 text-gray-500">
        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span>{t("loading")}</span>
      </div>
    </div>
  );
}

function InvoiceWorkspace({ userId, email }: { userId: number; email: string }) {
  const { t } = useTranslation();
  const [invoiceData, setInvoiceData] = useState<InvoiceData>(emptyState);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentInvoiceId, setCurrentInvoiceId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDefaultsModalOpen, setIsDefaultsModalOpen] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);
  const draftKey = getInvoiceDraftKey(userId);

  // Print handler
  const handlePrint = useReactToPrint({
    contentRef: invoiceRef,
    documentTitle: `${invoiceData.title} - ${invoiceData.invoiceNumber}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 0;
      }
      @media print {
        html, body {
          height: 100%;
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden;
        }
      }
    `,
  });

  /**
   * Fetch user-specific defaults from the server
   */
  const fetchUserDefaults = useCallback(async (): Promise<InvoiceData | null> => {
    try {
      const response = await fetch("/api/user-defaults");
      if (response.ok) {
        return await response.json();
      }
      if (response.status === 401) {
        clearInvoiceDrafts();
        void signOut({ callbackUrl: "/login" });
      }
      console.error("Failed to fetch user defaults:", response.status);
      return null;
    } catch (error) {
      console.error("Error fetching user defaults:", error);
      return null;
    }
  }, []);

  // Load this account's draft, preserving a scoped legacy draft during migration.
  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      const defaults = await fetchUserDefaults();
      if (cancelled) return;
      let draft: InvoiceData | null = null;
      try {
        const saved = readInvoiceDraft(draftKey, email);
        if (saved) draft = parseInvoiceData(JSON.parse(saved), true);
      } catch {
        console.error("Failed to load invoice draft");
      }
      setInvoiceData(draft ?? defaults ?? emptyState);
      setIsLoaded(true);
    }
    loadData();
    return () => { cancelled = true; };
  }, [fetchUserDefaults, draftKey, email]);

  // Sensitive drafts expire with this tab and are removed when signing out.
  useEffect(() => {
    if (!isLoaded) return;
    try {
      sessionStorage.setItem(draftKey, JSON.stringify(invoiceData));
    } catch {
      console.error("Failed to save invoice draft");
    }
  }, [invoiceData, isLoaded, draftKey]);

  // ============================================
  // Action handlers
  // ============================================

  const handleReset = useCallback(async () => {
    if (confirm(t("resetConfirmation"))) {
      const defaults = await fetchUserDefaults();
      if (defaults) {
        setInvoiceData(defaults);
      }
      setCurrentInvoiceId(null);
      if (draftKey) {
        sessionStorage.removeItem(draftKey);
      }
    }
  }, [t, fetchUserDefaults, draftKey]);

  const handleLoadInvoice = useCallback((data: InvoiceData, id: number) => {
    setInvoiceData(data);
    setCurrentInvoiceId(id);
  }, []);

  const handleNewInvoice = useCallback(async () => {
    const defaults = await fetchUserDefaults();
    if (defaults) {
      setInvoiceData(defaults);
    }
    setCurrentInvoiceId(null);
    if (draftKey) {
      sessionStorage.removeItem(draftKey);
    }
  }, [fetchUserDefaults, draftKey]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const result = await saveInvoiceAction(invoiceData, currentInvoiceId ?? undefined);
      if (result.success && result.id) {
        setCurrentInvoiceId(result.id);
      } else {
        console.error("Save failed:", result.error);
      }
    } catch (error) {
      console.error("Error saving invoice:", error);
    } finally {
      setIsSaving(false);
    }
  }, [invoiceData, currentInvoiceId]);

  const handleInvoiceDeleted = useCallback(async () => {
    const defaults = await fetchUserDefaults();
    if (defaults) {
      setInvoiceData(defaults);
    }
    setCurrentInvoiceId(null);
    if (draftKey) {
      sessionStorage.removeItem(draftKey);
    }
  }, [fetchUserDefaults, draftKey]);

  // ============================================
  // Menu items for ActionMenu
  // ============================================

  const menuItems = [
    {
      label: t("saveInvoice"),
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
        </svg>
      ),
      onClick: handleSave,
      disabled: isSaving,
    },
    {
      label: t("newInvoice"),
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      onClick: handleNewInvoice,
    },
    {
      label: t("editDefaults"),
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L8 18l-4 1 1-4L16.5 3.5z" />
        </svg>
      ),
      onClick: () => setIsDefaultsModalOpen(true),
    },
    {
      label: t("resetToDefaults"),
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      onClick: handleReset,
      variant: "destructive" as const,
    },
  ];

  // ============================================
  // Render
  // ============================================

  if (!isLoaded) return <LoadingInvoice />;

  return (
    <div className="min-h-screen bg-gray-100 print:bg-white print:min-h-0">
      {/* Header */}
      <Header
        centerContent={
          <InvoiceSelector
            currentInvoiceId={currentInvoiceId}
            onSelect={handleLoadInvoice}
            onNew={handleNewInvoice}
            onInvoiceDeleted={handleInvoiceDeleted}
          />
        }
        primaryAction={
          <Button variant="primary" size="lg" onClick={() => handlePrint()}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {t("downloadPrintPdf")}
          </Button>
        }
        menuItems={menuItems}
      />

      {/* Main Content */}
      <main className="print:max-w-none print:p-0 print:m-0">
        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)] print:block">
          {/* Form Panel */}
          <div className="lg:w-[420px] xl:w-[480px] flex-shrink-0 bg-gray-50 border-r border-gray-200 print:hidden overflow-y-auto">
            <div className="p-4 lg:p-6">
              <InvoiceForm data={invoiceData} onChange={setInvoiceData} />
            </div>
          </div>

          {/* Preview Panel */}
          <div className="flex-1 bg-gray-200 print:bg-white overflow-auto print:overflow-visible">
            {/* Preview header - desktop only */}
            <div className="hidden lg:flex items-center justify-between px-6 py-3 bg-gray-100 border-b border-gray-200 print:hidden">
              <div>
                <h2 className="text-sm font-medium text-gray-700">{t("preview")}</h2>
                <p className="text-xs text-gray-500">{t("previewDescription")}</p>
              </div>
              {currentInvoiceId && (
                <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                  ID: {currentInvoiceId}
                </span>
              )}
            </div>

            {/* Preview container - centered with shadow */}
            <div className="p-4 lg:p-8 flex justify-center print:p-0">
              <div 
                className="bg-white shadow-2xl print:shadow-none transform origin-top scale-[0.6] sm:scale-[0.7] md:scale-[0.8] lg:scale-[0.85] xl:scale-90 print:scale-100"
                style={{ marginBottom: '-40%' }}
              >
                <InvoicePreview ref={invoiceRef} data={invoiceData} />
              </div>
            </div>
          </div>
        </div>
      </main>
      <DefaultsModal
        isOpen={isDefaultsModalOpen}
        onClose={() => setIsDefaultsModalOpen(false)}
      />
    </div>
  );
}
