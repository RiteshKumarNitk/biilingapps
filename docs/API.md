# API Documentation

Bahikhata has two API surfaces:

1. **Server Actions** (`actions/*.ts`) — the primary interface. Called
   directly from React components; not reachable as plain HTTP endpoints.
2. **REST routes** (`app/api/**`) — a small set of authenticated JSON
   endpoints, mostly a legacy layer from an earlier architecture that the
   current UI doesn't call (except `/api/auth/*` and `/api/upload`, which
   are actively used).

All of both surfaces require an authenticated session (the `refreshToken`
httpOnly cookie set at login) except where noted as public.

## REST routes

### Auth — `app/api/auth/*` (public)

| Route | Method | Body | Notes |
|---|---|---|---|
| `/api/auth/register` | POST | `{ email, password, fullName, businessName?, role? }` | Creates a new Tenant + owner user. Password must be ≥8 chars, email must be valid. Sets `refreshToken` cookie. |
| `/api/auth/login` | POST | `{ email, password }` | Sets `refreshToken` cookie, returns `{ user, accessToken }`. |
| `/api/auth/logout` | POST | — | Clears cookies. (The UI actually calls the `logout()` server action instead — see below.) |
| `/api/auth/refresh` | POST | — (uses cookie) | Issues a new token pair. Not currently called by the UI. |
| `/api/auth/me` | GET | — (`Authorization: Bearer`) | Not currently called by the UI. |

### Invoices — `app/api/invoices` (authenticated)

- `GET /api/invoices?page=&limit=` — list invoices for the caller's tenant.
- `POST /api/invoices` — create an invoice (body validated against
  `invoiceSchema` from `lib/schemas/invoice.ts`).

### Products — `app/api/products`, `app/api/products/[id]` (authenticated)

- `GET /api/products?search=&page=&limit=&sortBy=&sortOrder=`
- `POST /api/products` — create
- `GET/PUT/DELETE /api/products/[id]`

### Parties — `app/api/parties` (authenticated)

- `GET /api/parties?search=&type=&page=&limit=`
- `POST /api/parties`, `PUT /api/parties` (body includes `id`),
  `DELETE /api/parties?id=`

### Upload — `app/api/upload` (authenticated)

- `POST /api/upload` — multipart form with a `file` field. Max 5MB.
  Uploads to Cloudinary (folder `billingapp`) and returns `{ url }`.

> All of the above tenant-scoped routes derive `tenantId` from the
> authenticated session (`requireAuth()`), never from a client-supplied
> parameter — this was a critical fix made during the audit; don't
> reintroduce a `tenantId` request parameter/header as a trust boundary.

## Server Actions by domain

These are `async function`s exported from `actions/*.ts` with `'use
server'`. Call them directly from components; Next.js handles the
RPC wire format. All require a valid session unless noted.

| File | Key exports |
|---|---|
| `actions/auth.ts` | `logout()` |
| `actions/user.ts` | `getUserProfile()`, `updateUserProfile()`, `updateTenantSettings()` |
| `actions/parties.ts` | `getParties()`, `getParty()`, `createParty()`, `updateParty()`, `deleteParty()`, `importPartiesBulk()`, `getPartyLedger()`, `recalculatePartyBalance()`, `recalculateAllParties()` |
| `actions/inventory.ts` | `getProducts()`, `createProduct()`, `updateProduct()`, `deleteProduct()`, `adjustStock()`, `bulkUpdateProducts()`, `bulkAdjustStock()`, category/unit helpers |
| `actions/invoices.ts` | `getInvoices()`, `getInvoiceDetails()`, `createInvoice()`, `deleteInvoice()`, `getLastInvoiceNumber()` |
| `actions/quotations.ts` | `getQuotations()`, `getQuotation()`, `createQuotation()`, `convertQuotationToInvoice()`, `getLastQuotationNumber()` |
| `actions/sale-orders.ts` | `getSaleOrders()`, `getSaleOrder()`, `createSaleOrder()`, `updateSaleOrder()`, `deleteSaleOrder()`, `convertOrdersToInvoice()` |
| `actions/purchase.ts` | `getPurchaseBills()`, `getPurchaseBillDetails()`, `createPurchaseBill()`, `deletePurchaseBill()`, `getLastPurchaseBillNumber()` |
| `actions/payment-in.ts` | `getPayments()`, `createPaymentIn()`, `deletePaymentIn()`, `getNextPaymentRef()` |
| `actions/accounting.ts` | `createExpense()`, `getExpenses()`, `getCashbook()` |
| `actions/reports.ts` | `getSalesReport()`, `getPurchaseReport()`, `getStockReport()`, `getPartyReport()`, `getGSTReport()` |
| `actions/dashboard.ts` | `getDashboardStats()`, `getInventoryStats()`, `getFinancialStats()`, `getCustomerStats()`, `getOperationsStats()`, `getRecentSales()`, `getOverviewChartData()`, `getSalesByCategory()` |
| `actions/settings.ts` | `updateTenantProfile()` |
| `actions/invoice-settings.ts` | `updateInvoiceSettings()` |
| `actions/store.ts` | `submitOrder()` (public — no auth, used by the customer storefront), `getOnlineOrders()`, `updateOrderStatus()` |
| `actions/public/invoice.ts` | `getPublicInvoice(token)` (public — powers the `/invoice/[token]` share link) |

### Conventions to follow when adding a new action

1. Call `requireAuth()` first (unless it's genuinely public, like
   `submitOrder` or `getPublicInvoice`), and scope every Prisma query by
   the returned `tenantId`.
2. Validate the input with a Zod schema (`lib/schemas/*.ts` or inline) —
   never trust the shape of `data: unknown`/`data: any` without parsing
   it. Several actions were found writing straight to Prisma without this
   during the audit; all were fixed, but keep the pattern for new code.
3. Recompute money fields (totals, tax) server-side from the line items
   rather than trusting a client-submitted total.
4. If money moves between the tenant and a party, update
   `Party.currentBalance` consistently — either inline within the same
   `prisma.$transaction` (see `InvoiceService.createInvoice`) or by
   calling `PartyService.recalculatePartyBalance()` afterward (see
   `payment-in.ts`, `purchase.ts`). Don't invent a third formula.
