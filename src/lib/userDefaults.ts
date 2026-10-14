import "server-only";

import { InvoiceData } from "@/types/invoice";
import { generateId } from "./utils";

/**
 * User-specific default invoice data
 * 
 * This file provides empty defaults for new users.
 * Personalized defaults are stored in the database (user_defaults table)
 * and fetched via the API route.
 */

/**
 * Placeholder defaults for new/unknown users
 * Personal text is loaded only from the current account's database record.
 */
export const placeholderDefaults: InvoiceData = {
  title: "",
  invoiceNumber: "",
  issueDate: new Date().toISOString().split("T")[0],
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0],

  seller: {
    name: "",
    address: "",
    taxId: "",
    email: "",
    phone: "",
    website: "",
  },

  client: {
    companyName: "",
    address: "",
    country: "",
    email: "",
    phone: "",
  },

  lineItems: [
    {
      id: generateId(),
      description: "",
      amountUSD: 0,
      amountEUR: 0,
    },
  ],

  taxRate: 0,
  exchangeRate: 0.85,
  subtotalEUR: 0,
  taxAmountEUR: 0,
  totalEUR: 0,

  notes: [],
};

/**
 * Get placeholder default invoice data
 * Returns a fresh copy with generated IDs and current dates
 * 
 * @returns InvoiceData - Placeholder defaults for new users
 */
export function getPlaceholderDefaults(): InvoiceData {
  return {
    ...placeholderDefaults,
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    lineItems: [{ ...placeholderDefaults.lineItems[0], id: generateId() }],
  };
}

/**
 * Merge database defaults with placeholder defaults
 * Ensures all required fields are present even if DB data is incomplete
 * 
 * @param dbDefaults - Defaults from database (may be partial)
 * @returns InvoiceData - Complete defaults with fresh dates
 */
export function mergeWithPlaceholderDefaults(
  dbDefaults: Partial<InvoiceData> | null
): InvoiceData {
  if (!dbDefaults) {
    return getPlaceholderDefaults();
  }

  // Merge with placeholders, then update dates
  const merged: InvoiceData = {
    ...placeholderDefaults,
    ...dbDefaults,
    // Always use fresh dates
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: dbDefaults.dueDate 
      ? new Date().toISOString().split("T")[0] // Use today if they had a due date set
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    // Ensure line items have fresh IDs
    lineItems: dbDefaults.lineItems?.length 
      ? dbDefaults.lineItems.map((item) => ({ ...item, id: item.id || generateId() }))
      : [{ ...placeholderDefaults.lineItems[0], id: generateId() }],
    // Ensure notes is always an array
    notes: dbDefaults.notes || [],
  };

  return merged;
}
