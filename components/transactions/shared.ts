
export type TransactionType = 'sale' | 'purchase'

export interface TransactionItem {
    id?: string
    rowId: string // internal FE id
    productId: string
    description: string
    quantity: number
    unit: string
    price: number
    taxType: 'inclusive' | 'exclusive'
    discountValue: number
    discountType: 'percentage' | 'flat'
    gstRate: number

    // Calculated
    taxAmount: number
    amount: number
}

export interface TransactionFormValues {
    type: TransactionType
    partyId: string
    partyName: string
    billNumber: string
    billDate: Date
    stateOfSupply: string
    items: TransactionItem[]

    // Payment
    paymentType: 'cash' | 'bank' | 'upi' | 'credit'
    roundOff: number
    paidAmount: number

    // Read only totals
    totalQuantity: number
    totalDiscount: number
    totalTax: number
    grandTotal: number
    balanceDue: number
}

// Re-exported from lib/constants.ts (the single source of truth) so
// existing imports from this file keep working.
export { INDIAN_STATES as STATES, GST_SLABS } from '@/lib/constants'
