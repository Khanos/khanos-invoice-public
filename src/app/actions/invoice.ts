"use server";

import { getCurrentUserId } from "@/lib/auth";
import {
  getInvoicesByUser,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
} from "@/lib/db";
import { parseInvoiceData, isRecordId } from "@/lib/invoiceValidation";
import { logServerError } from "@/lib/serverErrors";
import { InvoiceData } from "@/types/invoice";
import { InvoiceSummary, SaveResult, DeleteResult } from "@/types/database";

/**
 * Server actions for invoice management
 * All actions require authentication and enforce user isolation
 */

/**
 * Save an invoice to the database
 * Creates a new invoice or updates an existing one
 * 
 * @param data - Full invoice data
 * @param existingId - Optional ID if updating an existing invoice
 * @returns SaveResult with success status and invoice ID
 */
export async function saveInvoiceAction(
  input: unknown,
  existingId?: number
): Promise<SaveResult> {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const data = parseInvoiceData(input);
    if (!data || (existingId !== undefined && !isRecordId(existingId))) {
      return { success: false, error: "Invalid invoice data" };
    }

    if (existingId) {
      // Update existing invoice
      const success = await updateInvoice(existingId, userId, data);
      if (success) {
        return { success: true, id: existingId };
      }
      return { success: false, error: "Failed to update invoice" };
    } else {
      // Create new invoice
      const id = await createInvoice(userId, data);
      if (id) {
        return { success: true, id };
      }
      return { success: false, error: "Failed to create invoice" };
    }
  } catch (error) {
    logServerError("Error saving invoice:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Get all invoices for the current user
 * Returns lightweight summaries for list display
 * 
 * @returns Array of invoice summaries
 */
export async function getInvoicesAction(): Promise<InvoiceSummary[]> {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return [];
    }

    return await getInvoicesByUser(userId);
  } catch (error) {
    logServerError("Error fetching invoices:", error);
    return [];
  }
}

/**
 * Load a specific invoice by ID
 * Verifies ownership before returning data
 * 
 * @param id - Invoice database ID
 * @returns Full invoice data or null if not found/not owned
 */
export async function loadInvoiceAction(id: number): Promise<InvoiceData | null> {
  try {
    const userId = await getCurrentUserId();

    if (!userId || !isRecordId(id)) {
      return null;
    }

    const invoice = await getInvoiceById(id, userId);
    return invoice?.data || null;
  } catch (error) {
    logServerError("Error loading invoice:", error);
    return null;
  }
}

/**
 * Delete an invoice by ID
 * Verifies ownership before deleting
 * 
 * @param id - Invoice database ID
 * @returns DeleteResult with success status
 */
export async function deleteInvoiceAction(id: number): Promise<DeleteResult> {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }
    if (!isRecordId(id)) {
      return { success: false, error: "Invalid invoice ID" };
    }

    const success = await deleteInvoice(id, userId);
    if (success) {
      return { success: true };
    }
    return { success: false, error: "Failed to delete invoice" };
  } catch (error) {
    logServerError("Error deleting invoice:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
