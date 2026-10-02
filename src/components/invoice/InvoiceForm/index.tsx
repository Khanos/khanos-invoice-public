"use client";

import { InvoiceData, LineItem, SellerInfo, ClientInfo } from "@/types/invoice";
import {
  generateId,
  convertUSDToEUR,
  calculateSubtotalEUR,
  calculateTax,
  calculateTotal,
} from "@/lib/utils";

import InvoiceInfoCard from "./InvoiceInfoCard";
import SellerCard from "./SellerCard";
import ClientCard from "./ClientCard";
import LineItemsCard from "./LineItemsCard";
import TotalsCard from "./TotalsCard";
import NotesCard from "./NotesCard";

interface InvoiceFormProps {
  data: InvoiceData;
  onChange: (data: InvoiceData) => void;
}

/**
 * Invoice form orchestrator - manages all form sections
 * Handles data flow and calculations between card components
 */
export default function InvoiceForm({ data, onChange }: InvoiceFormProps) {
  // ============================================
  // Update handlers
  // ============================================

  const updateField = <K extends keyof InvoiceData>(
    field: K,
    value: InvoiceData[K]
  ) => {
    onChange({ ...data, [field]: value });
  };

  const updateSeller = (field: keyof SellerInfo, value: string) => {
    onChange({ ...data, seller: { ...data.seller, [field]: value } });
  };

  const updateClient = (field: keyof ClientInfo, value: string) => {
    onChange({ ...data, client: { ...data.client, [field]: value } });
  };

  // ============================================
  // Line item handlers
  // ============================================

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

  // ============================================
  // Rate handlers
  // ============================================

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

  // ============================================
  // Notes handlers
  // ============================================

  const updateNote = (index: number, value: string) => {
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

  // ============================================
  // Render
  // ============================================

  return (
    <div className="space-y-4">
      <InvoiceInfoCard data={data} onUpdate={updateField} />
      <SellerCard seller={data.seller} onUpdate={updateSeller} />
      <ClientCard client={data.client} onUpdate={updateClient} />
      <LineItemsCard
        lineItems={data.lineItems}
        onUpdateItem={updateLineItem}
        onAddItem={addLineItem}
        onRemoveItem={removeLineItem}
      />
      <TotalsCard
        data={data}
        onUpdateTaxRate={updateTaxRate}
        onUpdateExchangeRate={updateExchangeRate}
      />
      <NotesCard
        notes={data.notes}
        onUpdateNote={updateNote}
        onAddNote={addNote}
        onRemoveNote={removeNote}
      />
    </div>
  );
}
