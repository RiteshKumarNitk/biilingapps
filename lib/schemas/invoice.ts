
import * as z from 'zod'

export const invoiceItemSchema = z.object({
    product_id: z.string().optional(),
    description: z.string().min(1, 'Description is required'),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    unit_price: z.number().min(0),
    gst_rate: z.number().min(0),
    total_amount: z.number().min(0),
})

export const invoiceSchema = z.object({
    party_name: z.string().min(1, 'Customer Name is required'),
    invoice_number: z.string().min(1, 'Invoice Number is required'),
    date: z.date(),
    due_date: z.date().optional(),
    items: z.array(invoiceItemSchema).min(1, 'Add at least one item'),
    status: z.enum(['draft', 'generated', 'paid', 'overdue', 'cancelled']),
    payment_status: z.enum(['unpaid', 'partial', 'paid']),
})

export type InvoiceFormValues = z.infer<typeof invoiceSchema>
export type InvoiceItemValues = z.infer<typeof invoiceItemSchema>
