/**
 * Format a number as currency with European format (dot for thousands, comma for decimals)
 */
export function formatEUR(amount: number): string {
  return (
    amount.toLocaleString("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + " €"
  );
}

/**
 * Format a number as USD
 */
export function formatUSD(amount: number): string {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }) + " $";
}

/**
 * Format a date string (YYYY-MM-DD) to DD/MM/YYYY
 */
export function formatDate(dateString: string): string {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
}

/**
 * Calculate subtotal from line items (EUR)
 */
export function calculateSubtotalEUR(
  lineItems: { amountEUR: number }[]
): number {
  return lineItems.reduce((sum, item) => sum + item.amountEUR, 0);
}

/**
 * Calculate tax amount
 */
export function calculateTax(subtotal: number, taxRate: number): number {
  return subtotal * (taxRate / 100);
}

/**
 * Calculate total
 */
export function calculateTotal(subtotal: number, taxAmount: number): number {
  return subtotal + taxAmount;
}

/**
 * Generate a unique ID for line items
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

/**
 * Convert USD to EUR using a given exchange rate
 */
export function convertUSDToEUR(
  amountUSD: number,
  exchangeRate: number = 0.8511
): number {
  return Math.round(amountUSD * exchangeRate * 100) / 100;
}
