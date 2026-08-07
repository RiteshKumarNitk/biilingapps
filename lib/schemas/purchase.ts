
import * as z from 'zod'

export const purchaseItemSchema = z.object({
    product_id: z.string().optional(),
    description: z.string().min(1, 'Description is required'),
    unit: z.string().optional(),
    quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
    unit_price: z.number().min(0),
    discount: z.number().min(0).optional().default(0),
    gst_rate: z.number().min(0).optional().default(0),
    tax_amount: z.number().min(0).optional().default(0),
    total_amount: z.number().min(0),
    hsn_code: z.string().optional(),
})

export const purchaseBillSchema = z.object({
    bill_number: z.string().min(1, 'Bill Number is required'),
    party_id: z.string().min(1, 'Party is required'),
    party_name: z.string().optional(),
    date: z.date(),
    grand_total: z.number().min(0),
    notes: z.string().optional(),
    payment_status: z.enum(['paid', 'unpaid']).optional(),
    items: z.array(purchaseItemSchema).min(1, 'Add at least one item'),
})

export type PurchaseBillFormValues = z.infer<typeof purchaseBillSchema>
