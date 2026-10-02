import type { InvoiceData } from "@/types/invoice";

function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function isText(value: unknown, max = 2000): value is string {
  return typeof value === "string" && value.length <= max;
}

function isAmount(value: unknown, max = 1e9): value is number {
  return typeof value === "number" && Number.isFinite(value) && Math.abs(value) <= max;
}

function isDate(value: unknown, optional = false): value is string {
  if (optional && value === "") return true;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function isRecordId(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}

const cents = (value: number) => Math.round(value * 100) / 100;

/** Validate untrusted writes and persist only the known invoice fields. */
export function parseInvoiceData(value: unknown, draft = false): InvoiceData | null {
  if (!isObject(value)) return null;
  const { seller, client, lineItems, notes } = value;
  if (
    !isText(value.title, 200) || (!draft && !value.title.trim()) ||
    !isText(value.invoiceNumber, 100) || (!draft && !value.invoiceNumber.trim()) ||
    !isDate(value.issueDate, draft) || !isDate(value.dueDate, true) ||
    !isObject(seller) || !isObject(client) ||
    ![seller.name, seller.taxId, seller.email, seller.phone].every(v => isText(v, 320)) ||
    !isText(seller.address) ||
    (seller.website !== undefined && !isText(seller.website)) ||
    ![client.companyName, client.country, client.email, client.phone].every(v => isText(v, 320)) ||
    !isText(client.address) ||
    !Array.isArray(lineItems) || lineItems.length < 1 || lineItems.length > 100 ||
    !Array.isArray(notes) || notes.length > 20 || !notes.every(v => isText(v)) ||
    !isAmount(value.taxRate, 100) || value.taxRate < 0 ||
    !isAmount(value.exchangeRate, 1e6) || (draft ? value.exchangeRate < 0 : value.exchangeRate <= 0) ||
    ![value.subtotalEUR, value.taxAmountEUR, value.totalEUR].every(v => isAmount(v, 1e15))
  ) return null;

  const ids = new Set<string>();
  const items: InvoiceData["lineItems"] = [];
  for (const item of lineItems) {
    if (
      !isObject(item) || !isText(item.id, 100) || !item.id.trim() || ids.has(item.id) ||
      !isText(item.description) || !isAmount(item.amountUSD) || !isAmount(item.amountEUR)
    ) return null;
    ids.add(item.id);
    items.push({ id: item.id, description: item.description,
      amountUSD: cents(item.amountUSD), amountEUR: cents(item.amountEUR) });
  }

  const subtotalEUR = cents(items.reduce((sum, item) => sum + item.amountEUR, 0));
  const taxAmountEUR = cents(subtotalEUR * value.taxRate / 100);
  return {
    title: value.title, invoiceNumber: value.invoiceNumber,
    issueDate: value.issueDate, dueDate: value.dueDate,
    seller: {
      name: seller.name as string, address: seller.address, taxId: seller.taxId as string,
      email: seller.email as string, phone: seller.phone as string,
      ...(seller.website !== undefined ? { website: seller.website as string } : {}),
    },
    client: {
      companyName: client.companyName as string, address: client.address,
      country: client.country as string, email: client.email as string, phone: client.phone as string,
    },
    lineItems: items, taxRate: value.taxRate, exchangeRate: value.exchangeRate,
    subtotalEUR, taxAmountEUR, totalEUR: cents(subtotalEUR + taxAmountEUR), notes: [...notes],
  };
}
