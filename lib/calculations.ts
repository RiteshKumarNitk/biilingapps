/**
 * Shared line-item and document total math.
 *
 * Previously this exact formula was reimplemented independently in
 * components/invoices/invoice-form.tsx, components/quotations/quotation-form.tsx,
 * components/transactions/transaction-table.tsx (with the additional
 * inclusive/percentage-discount variants folded in here), and
 * lib/services/invoice.service.ts (the server-side recompute). Keeping this
 * in one place is what prevents the client preview and the server's
 * authoritative recalculation from ever silently disagreeing again.
 */

export type TaxType = 'inclusive' | 'exclusive'
export type DiscountType = 'flat' | 'percentage'

export interface LineItemCalcInput {
    quantity: number
    unitPrice: number
    gstRate: number
    /** Absolute amount if discountType is 'flat' (default), or a percentage 0-100 if 'percentage'. */
    discountValue?: number
    discountType?: DiscountType
    /** 'exclusive' (default): GST is added on top. 'inclusive': unitPrice already includes GST. */
    taxType?: TaxType
}

export interface LineItemCalcResult {
    /** Resolved absolute discount amount, regardless of discountType. */
    discountAmount: number
    /** Value after discount, excluding GST. */
    taxableAmount: number
    taxAmount: number
    /** Final line total, including GST. */
    totalAmount: number
}

export function round2(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100
}

export function calculateLineItem(input: LineItemCalcInput): LineItemCalcResult {
    const {
        quantity,
        unitPrice,
        gstRate,
        discountValue = 0,
        discountType = 'flat',
        taxType = 'exclusive',
    } = input

    const baseAmount = quantity * unitPrice
    const discountAmount = discountType === 'percentage'
        ? baseAmount * (discountValue / 100)
        : discountValue
    const valueAfterDiscount = baseAmount - discountAmount

    let taxableAmount: number
    let taxAmount: number
    let totalAmount: number

    if (taxType === 'inclusive') {
        totalAmount = valueAfterDiscount
        taxAmount = totalAmount - (totalAmount / (1 + gstRate / 100))
        taxableAmount = totalAmount - taxAmount
    } else {
        taxableAmount = valueAfterDiscount
        taxAmount = taxableAmount * (gstRate / 100)
        totalAmount = taxableAmount + taxAmount
    }

    return {
        discountAmount: round2(discountAmount),
        taxableAmount: round2(taxableAmount),
        taxAmount: round2(taxAmount),
        totalAmount: round2(totalAmount),
    }
}

export interface DocumentTotals {
    subtotal: number
    totalDiscount: number
    totalGst: number
    grandTotal: number
}

/** Sums a set of already-calculated line items into document-level totals. */
export function calculateDocumentTotals(
    items: Array<Pick<LineItemCalcResult, 'taxableAmount' | 'taxAmount' | 'totalAmount'> & { discountAmount?: number }>
): DocumentTotals {
    return {
        subtotal: round2(items.reduce((sum, i) => sum + i.taxableAmount, 0)),
        totalDiscount: round2(items.reduce((sum, i) => sum + (i.discountAmount || 0), 0)),
        totalGst: round2(items.reduce((sum, i) => sum + i.taxAmount, 0)),
        grandTotal: round2(items.reduce((sum, i) => sum + i.totalAmount, 0)),
    }
}

/** Formats a number as Indian Rupees, e.g. formatCurrency(151630) -> "₹1,51,630.00". */
export function formatCurrency(amount: number | null | undefined, options?: { decimals?: number }): string {
    const value = amount ?? 0
    const decimals = options?.decimals ?? 2
    return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`
}
