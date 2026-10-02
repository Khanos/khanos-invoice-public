export interface SellerInfo {
  name: string;
  address: string;
  taxId: string;
  email: string;
  phone: string;
  website?: string;
}

export interface ClientInfo {
  companyName: string;
  address: string;
  country: string;
  email: string;
  phone: string;
}

export interface LineItem {
  id: string;
  description: string;
  amountUSD: number;
  amountEUR: number;
}

export interface InvoiceData {
  // Invoice metadata
  title: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;

  // Parties
  seller: SellerInfo;
  client: ClientInfo;

  // Line items
  lineItems: LineItem[];

  // Totals & Currency
  taxRate: number;
  exchangeRate: number; // USD to EUR conversion rate
  subtotalEUR: number;
  taxAmountEUR: number;
  totalEUR: number;

  // Notes
  notes: string[];
}
