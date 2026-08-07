# User Manual

A guide to using Bahikhata day-to-day. Written for the business owner or
staff member using the app, not for developers.

## Getting started

1. **Sign up** at `/signup` with your name, business name, email, and a
   password (at least 8 characters). This creates your business account
   (a "tenant") and signs you in automatically.
2. **Log in** at `/login` any time after that with your email and
   password.
3. You'll land on the **Dashboard**, which shows this month's revenue,
   receivables/payables, low-stock items, pending quotations, top
   customers, and your 5 most recent sales. Use the date filter at the
   top right to switch between this month, last month, this year, or all
   time.

## Parties (customers & suppliers)

**Dashboard > Parties**

- Click **Add Party** to create a customer or supplier — name, phone,
  GSTIN, address, and an opening balance if they already owed you (or you
  owed them) money before you started using the app.
- The list on the left is searchable by name or phone. Click a party to
  see their balance and transaction history on the right.
- Each party's balance shows **"Rec"** (green) if they owe you money, or
  **"Pay"** (red) if you owe them.
- You can bulk-import parties from an Excel file via the **Import**
  button — match your spreadsheet columns to Name, Phone, Email, GSTIN,
  Type, Opening Balance, and Address.
- If a balance ever looks wrong, use the refresh icon in the top-right of
  the Parties page to recalculate every party's balance from scratch
  based on their actual invoices, purchases, and payments.

## Products & Inventory

**Dashboard > Inventory**

- Switch between the **Products**, **Services**, **Categories**, and
  **Units** tabs.
- **Add Item** to create a product: name, SKU, HSN code, selling price,
  cost price, GST rate, and starting stock quantity.
- Products/services are searchable from the tab's search box.
- Stock quantity updates automatically as you create invoices (stock goes
  down) and purchase bills (stock goes up). You can also manually adjust
  stock (e.g. after a physical count) from a product's detail page.
- **Bulk GST Update** (Dashboard > Utilities) lets you update price, GST
  rate, or stock for many products at once from a spreadsheet-style table.

## Sales — Invoices

**Dashboard > Invoices**

- **Create Invoice**: pick a customer, add line items (pick a product or
  type a custom line), set quantity/price/discount/GST per line, and the
  totals calculate automatically. Choose **Cash** if paid in full now, or
  **Credit** to invoice on account.
- Search, filter by status, and sort from the toolbar above the list.
- Open an invoice to **Print**, **Share** (generates a link and/or
  WhatsApp message your customer can open without logging in), or
  **Download**.
- Deleting an invoice reverses its effect on stock and on the customer's
  balance.

## Sales — Quotations & Sale Orders

**Dashboard > Quotations** / **Dashboard > Invoices > Sale Order**

- Quotations (estimates) and Sale Orders work like invoices but don't
  affect stock or balances until you **Convert to Invoice**, at which
  point stock is decremented and the customer's balance updates exactly
  as if you'd created the invoice directly.

## Purchases — Purchase Bills

**Dashboard > Purchase > Bills**

- **Add Bill**: pick a supplier, add the items you received, and save.
  This increases stock and increases what you owe the supplier.
- Deleting a bill reverses both effects.
- *Payment Out (paying a supplier) is not yet available in this version*
  — bills can be recorded, but there is currently no way to log a payment
  made against a purchase bill.

## Payments

**Dashboard > Invoices > Payment In**

- **Add Payment** to record money received from a customer — pick the
  party, amount, date, and mode (cash/UPI/bank transfer/cheque/online).
  This reduces what that customer owes you.
- The Payment In list shows every payment recorded, searchable by party
  or reference number, with a delete option if one was entered in error
  (this also reverses the balance effect).

## Reports

**Dashboard > Reports**

- **Sales / Purchase / Stock / Party / GST** reports summarize your data
  with totals and a filterable table. Use the date range picker where
  available to narrow the period.
- These reports read the same underlying data as the rest of the app —
  if a number here looks wrong, it usually means the underlying
  invoice/purchase/payment record needs correcting, not the report.

## Settings

**Dashboard > Settings**

- **Profile**: your name, phone, and avatar.
- **Business Profile**: your business name, address, GSTIN, logo, and
  invoice signature — these appear on printed invoices.
- **Invoice Settings / Taxes**: defaults used when creating new invoices.

## Tips

- Every list has a search box in the top toolbar — most support live
  filtering as you type.
- Deleting anything financial (invoice, purchase bill, payment) always
  reverses its effect on stock and balances — you don't need to manually
  adjust anything afterward.
- If numbers ever look inconsistent, the "recalculate balances" action on
  the Parties page is always safe to run — it recomputes from your actual
  transaction history rather than trusting a possibly-stale cached value.
