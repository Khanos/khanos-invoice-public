"use client";

import { InvoiceData, LineItem } from "@/types/invoice";
import {
  generateId,
  convertUSDToEUR,
  calculateSubtotalEUR,
  calculateTax,
  calculateTotal,
} from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

interface InvoiceFormProps {
  data: InvoiceData;
  onChange: (data: InvoiceData) => void;
}

export default function InvoiceForm({ data, onChange }: InvoiceFormProps) {
  const { t } = useTranslation();

  const updateField = <K extends keyof InvoiceData>(
    field: K,
    value: InvoiceData[K]
  ) => {
    onChange({ ...data, [field]: value });
  };

  const updateSeller = (field: keyof InvoiceData["seller"], value: string) => {
    onChange({ ...data, seller: { ...data.seller, [field]: value } });
  };

  const updateClient = (field: keyof InvoiceData["client"], value: string) => {
    onChange({ ...data, client: { ...data.client, [field]: value } });
  };

  const updateLineItem = (
    id: string,
    field: keyof LineItem,
    value: string | number
  ) => {
    const newLineItems = data.lineItems.map((item) => {
      if (item.id !== id) return item;

      const updated = { ...item, [field]: value };

      // Auto-calculate EUR when USD changes
      if (field === "amountUSD") {
        updated.amountEUR = convertUSDToEUR(Number(value), data.exchangeRate);
      }

      return updated;
    });

    // Recalculate totals
    const subtotalEUR = calculateSubtotalEUR(newLineItems);
    const taxAmountEUR = calculateTax(subtotalEUR, data.taxRate);
    const totalEUR = calculateTotal(subtotalEUR, taxAmountEUR);

    onChange({
      ...data,
      lineItems: newLineItems,
      subtotalEUR,
      taxAmountEUR,
      totalEUR,
    });
  };

  const addLineItem = () => {
    const newItem: LineItem = {
      id: generateId(),
      description: "",
      amountUSD: 0,
      amountEUR: 0,
    };
    onChange({ ...data, lineItems: [...data.lineItems, newItem] });
  };

  const removeLineItem = (id: string) => {
    if (data.lineItems.length <= 1) return;

    const newLineItems = data.lineItems.filter((item) => item.id !== id);
    const subtotalEUR = calculateSubtotalEUR(newLineItems);
    const taxAmountEUR = calculateTax(subtotalEUR, data.taxRate);
    const totalEUR = calculateTotal(subtotalEUR, taxAmountEUR);

    onChange({
      ...data,
      lineItems: newLineItems,
      subtotalEUR,
      taxAmountEUR,
      totalEUR,
    });
  };

  const updateTaxRate = (taxRate: number) => {
    const taxAmountEUR = calculateTax(data.subtotalEUR, taxRate);
    const totalEUR = calculateTotal(data.subtotalEUR, taxAmountEUR);
    onChange({ ...data, taxRate, taxAmountEUR, totalEUR });
  };

  const updateExchangeRate = (exchangeRate: number) => {
    // Recalculate all line items' EUR amounts with new exchange rate
    const newLineItems = data.lineItems.map((item) => ({
      ...item,
      amountEUR: convertUSDToEUR(item.amountUSD, exchangeRate),
    }));

    // Recalculate totals
    const subtotalEUR = calculateSubtotalEUR(newLineItems);
    const taxAmountEUR = calculateTax(subtotalEUR, data.taxRate);
    const totalEUR = calculateTotal(subtotalEUR, taxAmountEUR);

    onChange({
      ...data,
      exchangeRate,
      lineItems: newLineItems,
      subtotalEUR,
      taxAmountEUR,
      totalEUR,
    });
  };

  const updateNotes = (index: number, value: string) => {
    const newNotes = [...data.notes];
    newNotes[index] = value;
    onChange({ ...data, notes: newNotes });
  };

  const addNote = () => {
    onChange({ ...data, notes: [...data.notes, ""] });
  };

  const removeNote = (index: number) => {
    if (data.notes.length <= 1) return;
    const newNotes = data.notes.filter((_, i) => i !== index);
    onChange({ ...data, notes: newNotes });
  };

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
        {t("invoiceDetails")}
      </h2>

      {/* Invoice Info */}
      <section className="space-y-4">
        <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
          {t("invoiceInformation")}
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("title")}
            </label>
            <input
              type="text"
              value={data.title}
              onChange={(e) => updateField("title", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("invoiceNumber")}
            </label>
            <input
              type="text"
              value={data.invoiceNumber}
              onChange={(e) => updateField("invoiceNumber", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("issueDate")}
            </label>
            <input
              type="date"
              value={data.issueDate}
              onChange={(e) => updateField("issueDate", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("dueDate")}
            </label>
            <input
              type="date"
              value={data.dueDate}
              onChange={(e) => updateField("dueDate", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>
        </div>
      </section>

      {/* Seller Info */}
      <section className="space-y-4">
        <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
          {t("sellerInformation")}
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("name")}
            </label>
            <input
              type="text"
              value={data.seller.name}
              onChange={(e) => updateSeller("name", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("address")}
            </label>
            <input
              type="text"
              value={data.seller.address}
              onChange={(e) => updateSeller("address", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("taxId")}
            </label>
            <input
              type="text"
              value={data.seller.taxId}
              onChange={(e) => updateSeller("taxId", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("email")}
            </label>
            <input
              type="email"
              value={data.seller.email}
              onChange={(e) => updateSeller("email", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("phone")}
            </label>
            <input
              type="text"
              value={data.seller.phone}
              onChange={(e) => updateSeller("phone", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>
        </div>
      </section>

      {/* Client Info */}
      <section className="space-y-4">
        <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
          {t("clientInformation")}
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("companyName")}
            </label>
            <input
              type="text"
              value={data.client.companyName}
              onChange={(e) => updateClient("companyName", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("address")}
            </label>
            <input
              type="text"
              value={data.client.address}
              onChange={(e) => updateClient("address", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("country")}
            </label>
            <input
              type="text"
              value={data.client.country}
              onChange={(e) => updateClient("country", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("email")}
            </label>
            <input
              type="email"
              value={data.client.email}
              onChange={(e) => updateClient("email", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("phone")}
            </label>
            <input
              type="text"
              value={data.client.phone}
              onChange={(e) => updateClient("phone", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>
        </div>
      </section>

      {/* Line Items */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
            {t("lineItems")}
          </h3>
          <button
            type="button"
            onClick={addLineItem}
            className="text-sm text-cyan-600 hover:text-cyan-800 font-medium"
          >
            {t("addItem")}
          </button>
        </div>
        {data.lineItems.map((item, index) => (
          <div
            key={item.id}
            className="p-4 border border-gray-200 rounded-md space-y-3"
          >
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">
                {t("item")} {index + 1}
              </span>
              {data.lineItems.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeLineItem(item.id)}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  {t("remove")}
                </button>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("description")}
              </label>
              <textarea
                value={item.description}
                onChange={(e) =>
                  updateLineItem(item.id, "description", e.target.value)
                }
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("amountUSD")}
                </label>
                <input
                  type="number"
                  value={item.amountUSD || ""}
                  onChange={(e) =>
                    updateLineItem(
                      item.id,
                      "amountUSD",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("amountEUR")}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={item.amountEUR || ""}
                  onChange={(e) =>
                    updateLineItem(
                      item.id,
                      "amountEUR",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                />
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Tax Rate & Exchange Rate */}
      <section className="space-y-4">
        <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
          {t("tax")}
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("ivaRate")}
            </label>
            <input
              type="number"
              value={data.taxRate}
              onChange={(e) => updateTaxRate(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("exchangeRate")}
            </label>
            <input
              type="number"
              step="0.0001"
              value={data.exchangeRate}
              onChange={(e) => updateExchangeRate(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>
        </div>
      </section>

      {/* Notes */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
            {t("notes")}
          </h3>
          <button
            type="button"
            onClick={addNote}
            className="text-sm text-cyan-600 hover:text-cyan-800 font-medium"
          >
            {t("addNote")}
          </button>
        </div>
        {data.notes.map((note, index) => (
          <div key={index} className="flex gap-2">
            <textarea
              value={note}
              onChange={(e) => updateNotes(index, e.target.value)}
              rows={2}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm"
            />
            {data.notes.length > 1 && (
              <button
                type="button"
                onClick={() => removeNote(index)}
                className="text-red-500 hover:text-red-700 px-2"
              >
                &times;
              </button>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
