# Architecture

## Overview

Bahikhata is a multi-tenant billing and accounting application for small
businesses (invoices, quotations, purchases, inventory, parties/ledgers,
payments, GST reports, and a basic online store).

- **Framework**: Next.js 16 (App Router, Turbopack), React 19
- **Database**: PostgreSQL (hosted on Neon), accessed via Prisma 7 with the
  `@prisma/adapter-pg` driver adapter
- **Auth**: Custom JWT (via `jose`) + bcrypt password hashing — not a
  third-party auth provider
- **Styling**: Tailwind CSS v4 + Radix UI primitives (shadcn-style
  components in `components/ui`)
- **Forms/validation**: react-hook-form + Zod
- **File uploads**: Cloudinary
- **Hosting target**: Vercel-compatible (no Dockerfile; standard Next.js
  build output)

## Multi-tenancy model

Every business using the app is a **Tenant** row. Every domain table
(`Invoice`, `Party`, `Product`, etc.) carries a `tenantId` foreign key, and
every read/write in `actions/*.ts` and `lib/services/*.ts` must filter or
scope by the authenticated user's `tenantId`. There is no separate
database or schema per tenant — isolation is enforced entirely in
application code via `tenantId` filters, so **every new query must
include a `tenantId` clause**; there is no framework-level guardrail
against forgetting one.

A `UsersProfile` belongs to exactly one `Tenant` and has a `Role`
(`owner` / `accountant` / `sales` — role-based UI/permission enforcement
beyond login is not yet built out).

## Request flow

Almost all business logic runs through **Next.js Server Actions**
(`'use server'` functions in `actions/*.ts`), called directly from React
Server/Client Components — not through the REST API routes under
`app/api/*`. Those REST routes exist from an earlier architecture
iteration and are mostly unused by the current UI (see
`app/api/products`, `app/api/parties`, `app/api/invoices`); they are kept
functional and authenticated but are not the primary code path.

Typical flow for a page like "Create Invoice":

```
InvoiceForm (client component, react-hook-form + zod)
  -> createInvoice() server action (actions/invoices.ts)
    -> requireAuth() to get { id, tenantId, role }
    -> invoiceSchema.parse(data) to validate untrusted input
    -> InvoiceService.createInvoice() (lib/services/invoice.service.ts)
      -> single prisma.$transaction: create Invoice + InvoiceItems,
         decrement Product.stockQuantity, create a Payment row if any
         amount was received, update Party.currentBalance
    -> revalidatePath('/dashboard/invoices')
```

### Layered structure

- **`actions/*.ts`** — the server action entry points called from
  components. Responsible for auth (`requireAuth()`) and input validation
  (Zod), then delegating to a service.
- **`lib/services/*.ts`** — the actual business logic and Prisma queries
  for a domain (invoices, parties, products, dashboard). Not every domain
  has a service; some actions (`quotations.ts`, `purchase.ts`,
  `sale-orders.ts`, `payment-in.ts`, `accounting.ts`, `reports.ts`,
  `store.ts`) call Prisma directly instead. This is inconsistent but
  intentional to leave as-is rather than force a rewrite — see
  `MIGRATION_SUMMARY.md` / `MIGRATION_PLAN.md` for the history (the app
  was migrated off Supabase to Prisma/Postgres, and the service layer was
  only partially built out during that migration).
- **`lib/schemas/*.ts`** — Zod schemas shared between client-side form
  validation and server-side action validation.
- **`lib/repositories/*.ts`** — a thin repository layer for
  invoice/party/product exists but is **not used anywhere** (dead code
  left over from the migration).

## Authentication

- Login/registration go through `app/api/auth/{login,register}` REST
  routes, which set an **httpOnly `refreshToken` cookie** (7-day expiry,
  `sameSite: strict`).
- The actual authorization check used everywhere in the app is
  `requireAuth()` in `lib/auth-server.ts`, which reads that same
  `refreshToken` cookie server-side, verifies it, and loads the user +
  tenant from the database on every call.
- `middleware/auth.ts` also exists but checks a Bearer token from the
  `Authorization` header — a header normal browser page navigations never
  send. It does not currently provide real route protection; the
  `app/dashboard/layout.tsx` server-side redirect and each action's
  `requireAuth()` call are what actually gate access.
- A parallel "access token" flow (`lib/jwt.ts` short-lived access token,
  `lib/api-client.ts`, `hooks/use-auth.ts`, `/api/auth/me`,
  `/api/auth/refresh`) exists but is largely unused/vestigial — the app
  does not actually maintain client-side JWT state.

## Money/ledger model

- `Party.currentBalance`: positive = receivable (customer owes the
  tenant), negative = payable (tenant owes a supplier).
- Creating an invoice increases the linked party's balance by the
  invoice's `grandTotal`; any amount received at creation time is netted
  off immediately via a `Payment` row.
- `PartyService.recalculatePartyBalance()` is the authoritative,
  from-scratch recomputation: `openingBalance` (sign-flipped for
  suppliers) + all invoices - all purchases - payments (direction
  inferred from `Party.type`, since `Payment` has no explicit direction
  field) - credit notes + debit notes.
- There is currently no "Payment Out" feature (paying a supplier) — only
  "Payment In" (receiving from a customer) is implemented end-to-end.

## Known architectural limitations

- No automated tests or CI pipeline.
- The online store (`app/store`) only supports a single hardcoded "first
  tenant in the database" — it is not yet a real per-tenant storefront.
- List pages generally fetch a capped page of records (e.g. 100) rather
  than implementing true pagination in the UI.
- No structured logging or error-tracking service is wired in
  (`console.error` only).
