"use client";

import { useReactToPrint } from "react-to-print";
import { useTranslation } from "@/hooks/useTranslation";

interface PrintButtonProps {
  contentRef: React.RefObject<HTMLDivElement | null>;
  documentTitle?: string;
}

export default function PrintButton({
  contentRef,
  documentTitle = "Invoice",
}: PrintButtonProps) {
  const { t } = useTranslation();

  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle,
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

  return (
    <button
      onClick={() => handlePrint()}
      className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg shadow-md transition-colors duration-200"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
        />
      </svg>
      {t("downloadPrintPdf")}
    </button>
  );
}
