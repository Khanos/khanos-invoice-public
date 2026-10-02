import "server-only";
import { logServerError } from "./serverErrors";
import { sql } from "@vercel/postgres";
import { DbUser, DbInvoice, InvoiceSummary } from "@/types/database";
import { InvoiceData } from "@/types/invoice";

/**
 * Database utilities for user management and invoice storage
 * All queries use parameterized SQL to prevent injection attacks
 */

// ============================================
// USER FUNCTIONS (Authorization)
// ============================================

/**
 * Get a user by email address
 * @param email - User's email address
 * @returns User record or null if not found
 */
export async function getUserByEmail(email: string): Promise<DbUser | null> {
  try {
    const { rows } = await sql<DbUser>`
      SELECT id, email, name, role, is_active, created_at
      FROM users
      WHERE LOWER(email) = LOWER(${email})
    `;
    return rows[0] || null;
  } catch (error) {
    logServerError("Error fetching user by email:", error);
    return null;
  }
}

/** Register a Google account without changing an existing identity or status. */
export async function getOrCreateGoogleUser(
  email: string,
  name: string | null
): Promise<DbUser | null> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || normalizedEmail.length > 320) return null;

  try {
    const { rows } = await sql<DbUser>`
      INSERT INTO users (email, name, role, is_active)
      SELECT ${normalizedEmail}, ${name?.trim().slice(0, 320) || null}, 'user', true
      WHERE NOT EXISTS (
        SELECT 1 FROM users WHERE LOWER(email) = ${normalizedEmail}
      )
      ON CONFLICT (email) DO NOTHING
      RETURNING id, email, name, role, is_active, created_at
    `;
    // A separate read also handles a concurrent sign-in winning the insert.
    return rows[0] ?? await getUserByEmail(normalizedEmail);
  } catch (error) {
    logServerError("Error registering Google user:", error);
    return null;
  }
}

/**
 * Check if a user is allowed to access the application
 * @param email - User's email address
 * @returns true if user exists and is active
 */
export async function isUserAllowed(email: string): Promise<boolean> {
  const user = await getUserByEmail(email);
  return user !== null && user.is_active;
}

/**
 * Get a user by ID
 * @param id - User's database ID
 * @returns User record or null if not found
 */
export async function getUserById(id: number): Promise<DbUser | null> {
  try {
    const { rows } = await sql<DbUser>`
      SELECT id, email, name, role, is_active, created_at
      FROM users
      WHERE id = ${id}
    `;
    return rows[0] || null;
  } catch (error) {
    logServerError("Error fetching user by ID:", error);
    return null;
  }
}

// ============================================
// USER DEFAULTS FUNCTIONS
// ============================================

/**
 * Get personalized invoice defaults for a user
 * @param userId - User's database ID
 * @returns Invoice defaults or null if not configured
 */
export async function getUserDefaultsFromDb(
  userId: number
): Promise<InvoiceData | null> {
  try {
    const { rows } = await sql`
      SELECT defaults_json
      FROM user_defaults
      WHERE user_id = ${userId}
    `;
    return rows[0]?.defaults_json || null;
  } catch (error) {
    logServerError("Error fetching user defaults:", error);
    return null;
  }
}

/**
 * Save or update personalized invoice defaults for a user
 * @param userId - User's database ID
 * @param defaults - Invoice default data
 */
export async function saveUserDefaults(
  userId: number,
  defaults: InvoiceData
): Promise<boolean> {
  try {
    await sql`
      INSERT INTO user_defaults (user_id, defaults_json, updated_at)
      VALUES (${userId}, ${JSON.stringify(defaults)}::jsonb, NOW())
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        defaults_json = ${JSON.stringify(defaults)}::jsonb,
        updated_at = NOW()
    `;
    return true;
  } catch (error) {
    logServerError("Error saving user defaults:", error);
    return false;
  }
}

// ============================================
// INVOICE FUNCTIONS
// ============================================

/**
 * Get all invoices for a user (summary only, for list display)
 * @param userId - User's database ID
 * @returns Array of invoice summaries, ordered by most recent first
 */
export async function getInvoicesByUser(
  userId: number
): Promise<InvoiceSummary[]> {
  try {
    const { rows } = await sql<InvoiceSummary>`
      SELECT id, invoice_number, title, created_at
      FROM invoices
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;
    return rows;
  } catch (error) {
    logServerError("Error fetching invoices:", error);
    return [];
  }
}

/**
 * Get a single invoice by ID with ownership verification
 * @param id - Invoice database ID
 * @param userId - User's database ID (for ownership check)
 * @returns Full invoice record or null if not found/not owned
 */
export async function getInvoiceById(
  id: number,
  userId: number
): Promise<DbInvoice | null> {
  try {
    const { rows } = await sql<DbInvoice>`
      SELECT id, user_id, invoice_number, title, data, created_at, updated_at
      FROM invoices
      WHERE id = ${id} AND user_id = ${userId}
    `;
    return rows[0] || null;
  } catch (error) {
    logServerError("Error fetching invoice by ID:", error);
    return null;
  }
}

/**
 * Create a new invoice
 * @param userId - User's database ID
 * @param data - Full invoice data
 * @returns Created invoice ID or null on failure
 */
export async function createInvoice(
  userId: number,
  data: InvoiceData
): Promise<number | null> {
  try {
    const { rows } = await sql<{ id: number }>`
      INSERT INTO invoices (user_id, invoice_number, title, data)
      VALUES (
        ${userId},
        ${data.invoiceNumber},
        ${data.title},
        ${JSON.stringify(data)}::jsonb
      )
      RETURNING id
    `;
    return rows[0]?.id || null;
  } catch (error) {
    logServerError("Error creating invoice:", error);
    return null;
  }
}

/**
 * Update an existing invoice with ownership verification
 * @param id - Invoice database ID
 * @param userId - User's database ID (for ownership check)
 * @param data - Updated invoice data
 * @returns true if updated successfully
 */
export async function updateInvoice(
  id: number,
  userId: number,
  data: InvoiceData
): Promise<boolean> {
  try {
    const result = await sql`
      UPDATE invoices
      SET 
        invoice_number = ${data.invoiceNumber},
        title = ${data.title},
        data = ${JSON.stringify(data)}::jsonb,
        updated_at = NOW()
      WHERE id = ${id} AND user_id = ${userId}
    `;
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    logServerError("Error updating invoice:", error);
    return false;
  }
}

/**
 * Delete an invoice with ownership verification
 * @param id - Invoice database ID
 * @param userId - User's database ID (for ownership check)
 * @returns true if deleted successfully
 */
export async function deleteInvoice(
  id: number,
  userId: number
): Promise<boolean> {
  try {
    const result = await sql`
      DELETE FROM invoices
      WHERE id = ${id} AND user_id = ${userId}
    `;
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    logServerError("Error deleting invoice:", error);
    return false;
  }
}
