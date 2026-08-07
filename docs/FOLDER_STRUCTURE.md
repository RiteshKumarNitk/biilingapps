# Folder Structure Guide

```
app/                     Next.js App Router pages
  (auth)/                 Route group: /login, /signup (no /auth prefix in URL)
  api/                     REST routes (see docs/API.md)
  dashboard/               The authenticated app, gated by dashboard/layout.tsx
    invoices/, quotations/, purchase/, parties/, inventory/,
    accounting/, reports/, settings/, utilities/, store/, orders/, profile/
  invoice/[token]/         Public, unauthenticated shared-invoice view
  print/                   Print-friendly, authenticated views (invoices,
                            purchase bills, quotations, sale orders)
  store/                   Public customer-facing storefront
  layout.tsx, error.tsx, not-found.tsx   Root-level boundaries
  dashboard/layout.tsx, loading.tsx, error.tsx, not-found.tsx
                            Dashboard-level boundaries (auth redirect lives
                            in dashboard/layout.tsx)

actions/                 Server Actions ('use server') — the main API
                          surface called from components. One file per
                          domain (invoices.ts, parties.ts, purchase.ts...).

lib/
  auth.ts                  AuthService (register/login/refresh) - used by
                            app/api/auth/* routes
  auth-server.ts           requireAuth() - the actual per-request auth
                            check used by every action
  jwt.ts                   Token signing/verification (jose)
  prisma.ts                Prisma Client singleton (pg driver adapter)
  utils.ts                 cn() Tailwind class helper
  schemas/                 Zod schemas shared by forms and server actions
  services/                Business logic + Prisma queries for domains
                            that have a service layer (invoice, party,
                            product, dashboard). Not every domain has one;
                            others query Prisma directly from actions/.
  repositories/            Unused/dead - not imported anywhere.
  invoice-engine/          Invoice print theme/type definitions.

components/
  ui/                      Generic primitives (button, input, table,
                            dialog...) — shadcn/Radix-based, mostly
                            boilerplate, low churn.
  dashboard/                Dashboard shell, nav, charts, stat widgets
  invoices/, quotations/, sale-order/, purchase/, payment-in/, parties/,
  inventory/, accounting/, settings/, store/, utilities/, transactions/
                            Feature-specific forms, tables, and views,
                            one folder per domain, mirroring actions/.
  providers/                React context providers (e.g. LoadingProvider)

prisma/
  schema.prisma             The single source of truth for the DB shape
  seed.ts                   Minimal demo-data seed (1 tenant, a few rows)
  seed-qa-data.ts           Bulk realistic-data seed for load testing,
                            writes to an isolated 'qa-load-test' tenant

hooks/                   Small reusable React hooks (use-debounce, and a
                          largely-unused use-auth)

utils/                   Misc utilities (export.ts - Excel export via xlsx)

middleware.ts / middleware/auth.ts
                          Edge middleware. Currently does not provide real
                          route protection (see docs/ARCHITECTURE.md) -
                          don't rely on it for security; use requireAuth()
                          in the action/page instead.

docs/                    This documentation set.
```

## Where to add things

- **New domain feature** (e.g. "Debit Notes" UI): add
  `actions/debit-notes.ts` (or extend `purchase.ts` if tightly coupled),
  a Zod schema in `lib/schemas/`, and a `components/debit-notes/` folder
  for the form/table, following the `quotations` domain as the cleanest
  existing example of the intended pattern (validated action -> service
  call -> revalidatePath).
- **New shared UI primitive**: `components/ui/`.
- **New Prisma model/field**: edit `prisma/schema.prisma`, then
  `npx prisma db push && npx prisma generate`. There's no migration
  history to update.
- **New REST endpoint**: only add one if something outside the Next.js
  app itself needs to call it (a mobile app, a webhook receiver, etc.) —
  otherwise prefer a Server Action.
