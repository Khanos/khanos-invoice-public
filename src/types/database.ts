import { InvoiceData } from "./invoice";

/**
 * Database user record
 * Represents a user authorized to access the application
 */
export interface DbUser {
  id: number;
  email: string;
  name: string | null;
  role: string;
  is_active: boolean;
  created_at: Date;
}

/**
 * Database user defaults record
 * Stores personalized invoice defaults for a user
 */
export interface DbUserDefaults {
  id: number;
  user_id: number;
  defaults_json: InvoiceData;
  created_at: Date;
  updated_at: Date;
}

/**
 * Database invoice record
 * Stores a saved invoice with full data
 */
export interface DbInvoice {
  id: number;
  user_id: number;
  invoice_number: string;
  title: string;
  data: InvoiceData;
  created_at: Date;
  updated_at: Date;
}

/**
 * Invoice summary for list display
 * Lightweight version without full data
 */
export interface InvoiceSummary {
  id: number;
  invoice_number: string;
  title: string;
  created_at: Date;
}

/**
 * Result type for save operations
 */
export interface SaveResult {
  success: boolean;
  id?: number;
  error?: string;
}

/**
 * Result type for delete operations
 */
export interface DeleteResult {
  success: boolean;
  error?: string;
}
