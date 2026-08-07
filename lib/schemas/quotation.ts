
import * as z from 'zod'

export const quotationItemSchema = z.object({
    product_id: z.string().optional(),
    description: z.string().min(1, 'Description is required'),
    quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
    unit_price: z.number().min(0),
    discount: z.number().min(0).optional().default(0),
    gst_rate: z.number().min(0),
    tax_amount: z.number().min(0).optional(),
    total_amount: z.number().min(0),
})

export const quotationSchema = z.object({
    quotation_number: z.string().min(1, 'Quotation Number is required'),
    date: z.date(),
    valid_until: z.date().optional(),
    party_id: z.string().optional(),
    party_name: z.string().min(1, 'Customer Name is required'),
    party_address: z.string().optional(),
    shipping_address: z.string().optional(),
    party_phone: z.string().optional(),
    party_email: z.string().optional(),
    subtotal: z.number().min(0),
    total_gst: z.number().min(0),
    discount_amount: z.number().min(0).optional().default(0),
    grand_total: z.number().min(0),
    notes: z.string().optional(),
    type: z.enum(['estimate', 'proforma']).optional().default('estimate'),
    items: z.array(quotationItemSchema).min(1, 'Add at least one item'),
})

export type QuotationFormValues = z.infer<typeof quotationSchema>
export type QuotationItemValues = z.infer<typeof quotationItemSchema>
