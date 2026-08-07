# Admin Manual

For whoever administers a Bahikhata deployment or a specific business
account — the "owner" role, and/or whoever manages the underlying
infrastructure (database, hosting, secrets).

## Roles

`UsersProfile.role` supports `owner`, `accountant`, and `sales`, but
today **the role is not actually enforced anywhere** beyond being stored
— every logged-in user can access every page and action regardless of
role. `Dashboard > Settings > Users` is a placeholder page; there is no
UI yet to invite additional users or restrict what they can do. If you
need real role-based access control, that has to be designed and built —
don't assume the `role` field currently limits anything.

## Business (tenant) administration

**Dashboard > Settings**

- **Business Profile**: name, address, GSTIN, logo — used on printed
  documents.
- **Invoice Settings / Taxes**: defaults for new invoices.
- **Recalculate Balances** (Parties page, refresh icon): recomputes every
  party's balance from their full transaction history. Use this if you
  ever suspect a balance is wrong (e.g. after directly editing data, or
  after a bug). It's read-heavy but safe — it never deletes anything, it
  only rewrites `Party.currentBalance`.

## Data management

- **Import Parties**: Dashboard > Parties > Import, from an Excel file.
  Existing parties are matched and updated by name (case-insensitive);
  unmatched rows are inserted as new.
- **Bulk product updates**: Dashboard > Utilities > Bulk GST Update.
- **Backup / Import-Export utility pages exist in the navigation but are
  not implemented yet** (placeholders) — there is no in-app export of
  your full dataset or scheduled backup. Rely on the database host's
  backup/point-in-time-recovery feature (see docs/DEPLOYMENT.md) until
  this is built.

## Security responsibilities

- **Rotate `JWT_SECRET` / `JWT_REFRESH_SECRET`** before going live with
  real users if you haven't already generated fresh values (see
  docs/ENVIRONMENT_VARIABLES.md). Rotating logs everyone out.
- **There is no rate limiting** on login or any other endpoint. If this
  deployment is internet-facing, consider a WAF/rate-limiting layer in
  front of it (e.g. Vercel's built-in DDoS mitigation covers volumetric
  attacks, but not targeted credential-stuffing against `/api/auth/login`
  specifically).
- **There is no audit log.** Deletions (invoices, purchase bills,
  payments, parties) are immediate and not tracked to a specific user
  beyond whatever the database/host logs capture at the query level.
- Every tenant's data isolation depends on `tenantId` filters in
  application code (see docs/ARCHITECTURE.md) — this was audited and
  several gaps were found and fixed (unauthenticated cross-tenant API
  routes, an unscoped dashboard query). If you commission further custom
  development, any new query touching tenant data must include a
  `tenantId` filter; there is no database-level safety net.

## Troubleshooting

| Symptom | Likely cause / fix |
|---|---|
| Party balance looks wrong | Run "Recalculate Balances" on the Parties page. |
| A report shows blank/zero data | Should not happen after this audit's fixes; if it recurs, check that the report's column keys match the actual field names returned by its server action (a recurring source of bugs — see docs/ARCHITECTURE.md). |
| Product stock went negative | The app does not currently block selling more than available stock. Adjust stock manually from the product page, or treat it as a backorder if intentional. |
| Can't record a supplier payment | Expected — Payment Out isn't implemented yet (see User Manual). |
| A user reports being logged out unexpectedly | Refresh tokens last 7 days; also check whether `JWT_REFRESH_SECRET` was recently rotated (invalidates all sessions). |
| New tenant's business name shows as "X's Business" instead of what they typed | Fixed during this audit (the signup form's Business Name field wasn't being read); make sure you're running a version after that fix. |
