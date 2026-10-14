-- ============================================
-- Khanos Invoice - Database Schema
-- ============================================
-- Run this SQL in your Vercel Postgres database
-- to set up the required tables.
-- ============================================

-- ============================================
-- USERS TABLE (Authorization)
-- ============================================
-- Stores authorized users who can access the app
-- Only users in this table with is_active=true can log in

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast email lookups during authentication
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================
-- USER DEFAULTS TABLE (Invoice Personalization)
-- ============================================
-- Stores personalized invoice defaults for each user
-- Each user can have one set of defaults

CREATE TABLE IF NOT EXISTS user_defaults (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  defaults_json JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================
-- INVOICES TABLE (Invoice Storage)
-- ============================================
-- Stores saved invoices with full data as JSONB
-- User isolation enforced via user_id

CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL,
  title TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at DESC);

-- ============================================
-- SEED DATA (Initial User)
-- ============================================
-- Replace with your actual user email before running

-- Example: Insert initial admin user
-- INSERT INTO users (email, name, role, is_active)
-- VALUES ('your-email@example.com', 'Your Name', 'admin', true);

-- Example: Insert personalized defaults for the user
-- INSERT INTO user_defaults (user_id, defaults_json)
-- SELECT id, '{
--   "title": "FACTURA",
--   "invoiceNumber": "2026-01-001",
--   ...
-- }'::jsonb
-- FROM users
-- WHERE email = 'your-email@example.com';
