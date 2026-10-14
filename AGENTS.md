# AGENTS.md - Khanos Invoice Generator

> Guidelines for AI coding agents working on this codebase.

<!-- BEGIN:nextjs-agent-rules -->
## IMPORTANT: Next.js Version Notice

This project uses **Next.js 16.3.8** with breaking changes from your training data.
Read the relevant guide in `node_modules/next/dist/docs/` before writing any code.
Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

## Project Overview

An invoice generator with public Google registration, private per-account data, real-time preview and browser print/PDF export.
- **Framework:** Next.js 16.3.8 (App Router)
- **React:** 19.2.8
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **Auth:** NextAuth (Google OAuth, JWT strategy, database-driven authorization)
- **Database:** Vercel Postgres (@vercel/postgres)
- **PDF:** react-to-print

---

## Build/Lint/Test Commands

```bash
# Development
npm run dev          # Start dev server at http://localhost:3000

# Production
npm run build        # Build for production
npm run start        # Start production server

# Linting
npm run lint         # Run ESLint (flat config, v9)
```

### Testing

**Security regression tests use the Node.js built-in test runner:** `npm test`.
They execute TypeScript with mocked imports and do not contact OAuth or the database.

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── actions/            # Server actions
│   │   └── invoice.ts      # Invoice CRUD operations
│   ├── api/
│   │   ├── auth/           # NextAuth API routes
│   │   └── user-defaults/  # User defaults API
│   ├── login/              # Login page
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main invoice page
│   └── globals.css         # Global styles + Tailwind
├── components/             # React components
│   ├── InvoiceForm.tsx
│   ├── InvoicePreview.tsx
│   ├── InvoiceSelector.tsx # Dropdown to load saved invoices
│   ├── SaveInvoiceButton.tsx
│   ├── PrintButton.tsx
│   ├── AuthProvider.tsx
│   ├── LogoutButton.tsx
│   ├── LanguageToggle.tsx
│   └── index.ts            # Barrel exports
├── lib/                    # Utilities and config
│   ├── auth.ts             # NextAuth configuration
│   ├── db.ts               # Database utilities (Vercel Postgres)
│   ├── userDefaults.ts     # Placeholder defaults
│   ├── i18n.ts             # Internationalization (EN/ES)
│   ├── utils.ts            # Helper functions
│   └── index.ts            # Barrel exports
├── types/                  # TypeScript type definitions
│   ├── invoice.ts          # Invoice interfaces
│   ├── database.ts         # Database types
│   ├── next-auth.d.ts      # NextAuth type augmentation
│   └── index.ts            # Barrel exports
└── middleware.ts           # Edge middleware (auth protection)
```

---

## Code Style Guidelines

### File Naming
- **Components:** PascalCase (`InvoiceForm.tsx`, `PrintButton.tsx`)
- **Utilities/libs:** camelCase (`utils.ts`, `auth.ts`)
- **Types:** camelCase (`invoice.ts`)

### Imports

Use path aliases with `@/` prefix:
```typescript
import { InvoiceData } from "@/types/invoice";
import { formatEUR, calculateTotal } from "@/lib/utils";
import InvoiceForm from "@/components/InvoiceForm";
```

Import order (enforced by ESLint):
1. React/Next.js imports
2. Third-party libraries
3. Internal modules (`@/` aliases)
4. Relative imports
5. Types (can be inline with source)

### Component Structure

```typescript
"use client";  // Only for client components

import { ... } from "...";

interface ComponentProps {
  data: SomeType;
  onChange: (data: SomeType) => void;
}

export default function ComponentName({ data, onChange }: ComponentProps) {
  // Hooks first
  const [state, setState] = useState(...);

  // Handler functions
  const handleAction = () => { ... };

  // Return JSX
  return (
    <div className="...">
      {/* ... */}
    </div>
  );
}
```

### TypeScript

- Use `interface` for object shapes (preferred over `type` for extensibility)
- Export interfaces from `src/types/` with barrel exports
- Use generics for reusable update functions:
  ```typescript
  const updateField = <K extends keyof InvoiceData>(
    field: K,
    value: InvoiceData[K]
  ) => { ... };
  ```
- Avoid `any`; use proper types or `unknown` with type guards

### Naming Conventions

- **Functions:** camelCase, verb-prefixed (`calculateTotal`, `formatDate`, `handleClick`)
- **Components:** PascalCase (`InvoiceForm`, `PrintButton`)
- **Interfaces:** PascalCase, descriptive (`InvoiceData`, `LineItem`, `SellerInfo`)
- **Constants:** SCREAMING_SNAKE_CASE for true constants, camelCase for config
- **Boolean props/vars:** `is`, `has`, `should` prefix (`isPublicPath`, `hasToken`)

### Formatting

- **Indentation:** 2 spaces
- **Quotes:** Double quotes for strings
- **Semicolons:** Required
- **Trailing commas:** Yes (ES5 style)
- **Line length:** ~80-100 chars (soft limit)
- **JSX:** Multi-line for 2+ props

### Error Handling

- Use try-catch for parsing/async operations
- Log errors with `console.error()`
- Provide user-facing fallbacks via conditional rendering
- Guard against null/undefined with early returns

```typescript
try {
  const saved = localStorage.getItem("invoiceData");
  if (saved) {
    setData(JSON.parse(saved));
  }
} catch (error) {
  console.error("Failed to load saved data:", error);
}
```

### Tailwind CSS

- Use utility classes inline (no separate CSS files)
- Print styles: `print:` prefix
- Responsive: `sm:`, `md:`, `lg:`, `xl:` prefixes
- Accent color: cyan (`bg-cyan-500`, `text-cyan-600`, `focus:ring-cyan-500`)
- Common patterns:
  ```tsx
  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500"
  ```

---

## Authentication

- **Provider:** Google OAuth via NextAuth
- **Strategy:** JWT (stateless sessions, user data stored in database)
- **Authorization:** Database-driven (`users` table with `is_active` flag)
- **Protected routes:** Everything except `/login` and `/api/auth/*`

### Authorization Flow
1. User signs in with Google
2. `signIn` verifies Google's email and registers new accounts in `users`
3. Existing identities and roles are preserved; disabled accounts remain blocked
4. JWT token is enriched with `userId` and `role` from database
5. Session contains user info without requiring additional DB calls

### Environment Variables

Required in `.env.local`:
```
# Auth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000

# Database (provided by Vercel when Postgres is linked)
POSTGRES_URL=...
POSTGRES_PRISMA_URL=...
POSTGRES_URL_NON_POOLING=...
POSTGRES_USER=...
POSTGRES_HOST=...
POSTGRES_PASSWORD=...
POSTGRES_DATABASE=...
```

---

## Database

### Schema

The app uses Vercel Postgres with three tables:

1. **`users`** - Authorization and user info
   - `id`, `email`, `name`, `role`, `is_active`, `created_at`
   
2. **`user_defaults`** - Personalized invoice defaults
   - `id`, `user_id`, `defaults_json` (JSONB), `created_at`, `updated_at`
   
3. **`invoices`** - Saved invoices
   - `id`, `user_id`, `invoice_number`, `title`, `data` (JSONB), `created_at`, `updated_at`

See `schema.sql` for full SQL schema.

### Database Utilities (`src/lib/db.ts`)

```typescript
// User functions
getUserByEmail(email)        // Get user by email
getOrCreateGoogleUser(email, name) // Register or reuse a verified Google account
isUserAllowed(email)         // Check if user can log in
getUserById(id)              // Get user by ID

// User defaults functions
getUserDefaultsFromDb(userId)  // Get personalized defaults
saveUserDefaults(userId, data) // Save/update defaults

// Invoice functions
getInvoicesByUser(userId)      // List user's invoices
getInvoiceById(id, userId)     // Get single invoice
createInvoice(userId, data)    // Create new invoice
updateInvoice(id, userId, data) // Update invoice
deleteInvoice(id, userId)      // Delete invoice
```

### Security
- All queries use parameterized SQL (via tagged templates)
- User isolation enforced at query level (all queries include `user_id`)
- Session checked in every server action
- Defaults are loaded and saved using the authenticated account ID. Accounts without saved defaults start with empty text; personal templates belong only in that account's `user_defaults` record.

---

## Server Actions

Invoice operations use Next.js Server Actions (`src/app/actions/invoice.ts`):

```typescript
// Save invoice (create or update)
saveInvoiceAction(data, existingId?)

// Get user's invoice list (summaries)
getInvoicesAction()

// Load full invoice data
loadInvoiceAction(id)

// Delete invoice
deleteInvoiceAction(id)
```

---

## Key Patterns

### State Management
- Local state with `useState`
- Persistence via tab-local `sessionStorage` (for in-progress work; cleared on logout)
- Database persistence for saved invoices
- Session via NextAuth `useSession()`

### Export Patterns
- Components: default export, barrel re-export
- Utils/types: named exports, barrel re-export with `export * from`

### Ref Forwarding (for print)
```typescript
const InvoicePreview = forwardRef<HTMLDivElement, Props>((props, ref) => {
  return <div ref={ref}>...</div>;
});
```

---

## ESLint Configuration

Uses ESLint v9 flat config with:
- `eslint-config-next/core-web-vitals`
- `eslint-config-next/typescript`

Ignored paths: `.next/`, `out/`, `build/`, `next-env.d.ts`
