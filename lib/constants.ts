/**
 * Shared, hardcoded reference data used across forms and calculations.
 * Single source of truth - previously duplicated independently in
 * components/transactions/shared.ts, components/inventory/product-form.tsx,
 * and components/parties/party-form.tsx.
 */

export const GST_SLABS: number[] = [0, 5, 12, 18, 28]

export const INDIAN_STATES: string[] = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
    "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
    "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
    "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
]

export const DEFAULT_UNITS: string[] = ["pcs", "box", "kg", "ltr", "mtr", "g", "ml", "dz"]

export const DEFAULT_PRODUCT_CATEGORIES: string[] = ["General", "Electronics", "Groceries", "Services", "Hardware"]

export const PAYMENT_MODES = [
    { value: 'cash', label: 'Cash' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'upi', label: 'UPI' },
    { value: 'online', label: 'Online' },
    { value: 'cheque', label: 'Cheque' },
] as const

/** Invoice payment status options, as used by lowercase-form-value schemas. */
export const PAYMENT_STATUS_OPTIONS = [
    { value: 'unpaid', label: 'Unpaid' },
    { value: 'partial', label: 'Partial' },
    { value: 'paid', label: 'Paid' },
] as const

/** Invoice document status options, as used by lowercase-form-value schemas. */
export const INVOICE_STATUS_OPTIONS = [
    { value: 'draft', label: 'Draft' },
    { value: 'generated', label: 'Generated' },
    { value: 'paid', label: 'Paid' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'cancelled', label: 'Cancelled' },
] as const

export const ONLINE_ORDER_STATUS_OPTIONS = [
    { value: 'new', label: 'New' },
    { value: 'processing', label: 'Processing' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
] as const
