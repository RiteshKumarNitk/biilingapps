
export interface InvoiceTheme {
    id: string
    name: string
    group: 'Classic' | 'Tally' | 'GST' | 'Vintage'
    colors: {
        primary: string
        secondary: string
        text: string
        border: string
        background: string
        tableHeaderBg: string
        tableHeaderText: string
        accent: string
    }
    typography: {
        fontFamily: string
        headingSize: string
        textSize: string
    }
    layout: {
        headerStyle: 'standard' | 'centered' | 'minimal' | 'left-aligned'
        tableStyle: 'grid' | 'clean' | 'striped'
        borderStyle: 'none' | 'thin' | 'thick' | 'double'
        compactMode: boolean
    }
}

export interface InvoiceItem {
    id: string
    name: string
    hsn?: string
    quantity: number
    unit: string
    rate: number
    gst_rate?: number
    tax_amount?: number
    discount_amount?: number
    amount: number
    [key: string]: any
}

export interface TaxBreakup {
    rate: number
    taxable_amount: number
    cgst: number
    sgst: number
    igst: number
    cess: number
    total: number
}

export interface InvoiceData {
    id: string
    documentTitle: string // e.g. "Proforma Invoice"
    documentNumber: string
    date: string
    dueDate?: string

    // Parties
    company: {
        name: string
        address?: string
        phone?: string
        email?: string
        gstin?: string
        logoUrl?: string
    }
    billTo: {
        name: string
        address?: string
        phone?: string
        email?: string
        gstin?: string
    }
    shipTo?: {
        name: string
        address?: string
    }

    // Line Items
    items: InvoiceItem[]

    // Totals
    subTotal: number
    discountTotal: number
    taxTotal: number
    roundOff?: number
    grandTotal: number
    amountInWords?: string

    // Other
    notes?: string
    terms?: string
    bankDetails?: {
        bankName: string
        accountNumber: string
        ifsc: string
        branch?: string
    }
    signature?: {
        label: string
        imageUrl?: string
        signatoryName?: string
    }

    // Config flags specific to this document instance
    showGstColumns?: boolean
}
