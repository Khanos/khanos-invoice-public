"use client";

import { forwardRef } from "react";
import { InvoiceData } from "@/types/invoice";
import { formatDate, formatEUR, formatUSD } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

interface InvoicePreviewProps {
  data: InvoiceData;
}

const InvoicePreview = forwardRef<HTMLDivElement, InvoicePreviewProps>(
  function InvoicePreviewInner({ data }, ref) {
    const { t } = useTranslation();

    return (
      <div
        ref={ref}
        className="bg-white shadow-lg print:shadow-none"
        style={{
          width: "210mm",
          minHeight: "297mm",
          padding: "15mm 20mm",
          fontFamily: "Arial, sans-serif",
        }}
      >
        {/* Header Section */}
        <header className="mb-8">
          {/* Title with cyan underline */}
          <h1
            className="text-2xl font-bold text-gray-800 mb-1 pb-1"
            style={{
              borderBottom: "3px solid #00CED1",
              display: "inline-block",
            }}
          >
            {data.title}
          </h1>

          {/* Invoice metadata */}
          <div className="mt-6 text-sm text-gray-700">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1" style={{ width: "280px" }}>
              <span className="text-gray-600">{t("invoiceNumberLabel")}</span>
              <span className="text-right font-medium">{data.invoiceNumber}</span>
              
              <span className="text-gray-600">{t("invoiceDateLabel")}</span>
              <span className="text-right">{formatDate(data.issueDate)}</span>
              
              <span className="text-gray-600">{t("dueDateLabel")}</span>
              <span className="text-right">{formatDate(data.dueDate)}</span>
            </div>
          </div>
        </header>

        {/* Parties Section - Seller & Client */}
        <section className="mb-8">
          <div className="flex justify-between">
            {/* Seller - Left */}
            <div
              className="flex-1 pr-8"
              style={{ borderTop: "2px solid #e5e7eb", paddingTop: "12px" }}
            >
              <h2 className="font-bold text-gray-900 text-sm mb-2 tracking-wide">
                {data.seller.name}
              </h2>
              <div className="text-sm text-gray-700 space-y-0.5">
                <p>{data.seller.address}</p>
                <p>{t("nie")} {data.seller.taxId}</p>
                <p>
                  {data.seller.email} | {data.seller.phone}
                </p>
              </div>
            </div>

            {/* Client - Right */}
            <div
              className="flex-1 pl-8 text-right"
              style={{ borderTop: "2px solid #e5e7eb", paddingTop: "12px" }}
            >
              <h2 className="font-bold text-gray-900 text-sm mb-2 tracking-wide">
                {data.client.companyName}
              </h2>
              <div className="text-sm text-gray-700 space-y-0.5">
                <p>{data.client.address}</p>
                <p>{t("countryLabel")} {data.client.country}</p>
                <p>
                  {data.client.email} | {data.client.phone}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Line Items Table */}
        <section className="mb-8">
          <div className="border border-gray-300">
            {/* Table Header */}
            <div className="grid grid-cols-12 text-xs text-gray-600 border-b border-gray-300">
              <div className="col-span-8 px-3 py-2 font-medium uppercase tracking-wider">
                {t("descriptionHeader")}
              </div>
              <div className="col-span-2 px-3 py-2 text-right font-medium uppercase tracking-wider">
                {t("amountUSDHeader")}
              </div>
              <div className="col-span-2 px-3 py-2 text-right font-medium uppercase tracking-wider">
                {t("amountEURHeader")}
              </div>
            </div>

            {/* Table Body */}
            {data.lineItems.length === 0 ? (
              <div className="px-3 py-4 text-sm text-gray-400 italic text-center">
                No items
              </div>
            ) : (
              data.lineItems.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 text-sm border-b border-gray-200 last:border-b-0"
                >
                  <div className="col-span-8 px-3 py-3 text-gray-800">
                    {item.description}
                  </div>
                  <div className="col-span-2 px-3 py-3 text-right text-gray-800">
                    {formatUSD(item.amountUSD)}
                  </div>
                  <div className="col-span-2 px-3 py-3 text-right text-gray-800">
                    {item.amountEUR.toLocaleString("de-DE", {
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 1,
                    })}{" "}
                    €
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Totals Section */}
        <section className="mb-10 flex justify-center">
          <div className="border border-gray-300" style={{ width: "320px" }}>
            {/* Subtotal */}
            <div className="grid grid-cols-2 border-b border-gray-300 text-sm">
              <div className="px-4 py-2 font-medium text-gray-700">{t("subtotal")}</div>
              <div className="px-4 py-2 text-right text-gray-800">
                {formatEUR(data.subtotalEUR)}
              </div>
            </div>

            {/* IVA */}
            <div className="grid grid-cols-2 border-b border-gray-300 text-sm">
              <div className="px-4 py-2 font-medium text-gray-700">
                {t("ivaPercent", { rate: data.taxRate })}
              </div>
              <div className="px-4 py-2 text-right text-gray-800">
                {formatEUR(data.taxAmountEUR)}
              </div>
            </div>

            {/* Total */}
            <div className="grid grid-cols-2 text-sm bg-gray-50">
              <div className="px-4 py-3 font-bold text-gray-800">{t("total")}</div>
              <div className="px-4 py-3 text-right font-bold text-gray-800">
                {formatEUR(data.totalEUR)}
              </div>
            </div>
          </div>
        </section>

        {/* Notes Section */}
        {data.notes.length > 0 && (
          <section className="mb-10">
            <h3 className="text-base font-semibold text-gray-800 mb-3">{t("note")}</h3>
            <ul className="text-xs text-gray-600 space-y-1.5 list-disc pl-4">
              {data.notes.map((note, index) => (
                <li key={index} className="leading-relaxed">
                  {note}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Footer */}
        <footer className="text-center text-xs text-gray-600 pt-6 border-t border-gray-200">
          <p className="font-medium text-gray-800">
            {t("engineer")} {data.seller.name.split(" ")[0]}{" "}
            {data.seller.name.split(" ").slice(1).join(" ")}
          </p>
          <p className="mt-1">
            ({data.seller.phone.replace("+", "")})
            {data.seller.website && ` | ${data.seller.website}`} |{" "}
            {data.seller.email}
          </p>
        </footer>
      </div>
    );
  }
);

InvoicePreview.displayName = "InvoicePreview";

export default InvoicePreview;
