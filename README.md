# Khanos Invoice

An invoice editor with English/Spanish controls, live A4 preview, browser print/PDF export, Google sign-in, personalized defaults and saved invoices in Postgres.

## Local setup

1. Install Node.js 22.13 or newer (required for the security test runner).
2. Run `npm ci`.
3. Copy `.env.example` to `.env.local` and configure Google OAuth, a strong `NEXTAUTH_SECRET`, the application URL and a Postgres connection. Generate your own secret with `openssl rand -base64 32`.
4. Configure the Google OAuth callback URL as `<application URL>/api/auth/callback/google`.
5. Run `schema.sql` against your own database and add authorized users privately. Only active users in the `users` table can access invoice operations.
6. Run `npm run dev` and open http://localhost:3000.

Credentials and personal invoice defaults belong in private environment configuration and the database. The committed schema and examples contain placeholder data only.

## Commands

```bash
npm test
npm run lint
npm run build
npm audit
npm run start
```

The security tests execute TypeScript with synthetic auth/database/storage imports. They check revoked-user access, owner-scoped operations, bounded write validation, totals, draft migration and safe error logging. They do not call Google or a database; deployed sign-in and database smoke checks remain necessary before release.

## Privacy behavior

- Each protected operation verifies that the current database user is still active and matches the session identity.
- Invoice/default writes validate known fields and recalculate totals from line items.
- Unsaved drafts live in `sessionStorage`, scoped to the user ID, and expire with the tab. Use **Save invoice** to retain work in the database.
- Logout clears invoice draft keys from both local and session storage, including legacy keys. It leaves unrelated preferences intact.
- An email-scoped legacy draft is moved into the current account's tab storage only after that write succeeds. Unscoped legacy drafts are not loaded because ownership cannot be established.
- Server logs retain operation labels and validated database error codes, not raw records or connection messages.

This public repository starts from a sanitized source snapshot with fresh Git history. Credentials, personal defaults, invoice records and deployment configuration are not included.

See [the privacy rollout guide](docs/privacy-rollout.md) before deploying the app or upgrading an existing installation.
