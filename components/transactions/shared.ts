
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

export const STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
    "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
    "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
    "West Bengal", "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry"
]

export const GST_SLABS = [0, 5, 12, 18, 28]
