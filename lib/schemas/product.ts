
import * as z from 'zod'

export const productSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    sku: z.string().optional(),
    hsn_code: z.string().optional(),
    price: z.number().min(0, 'Price must be positive'),
    cost_price: z.number().min(0).default(0),
    gst_rate: z.number().min(0).max(100).default(0),
    stock_quantity: z.number().default(0),
    low_stock_threshold: z.number().default(5),
    unit: z.string().default('pcs'),
    barcode: z.string().optional(),
    image_url: z.string().optional(),
    category: z.string().optional(),
    tax_mode: z.enum(['exclusive', 'inclusive']).default('exclusive'),
    discount_value: z.number().min(0).default(0),
    discount_type: z.enum(['percentage', 'amount']).default('percentage'),
    wholesale_price: z.number().min(0).default(0), // Keeping backward compatibility if needed, or remove.
    wholesale_prices: z.array(z.object({
        min_quantity: z.number().min(1, "Min Qty must be at least 1"),
        price: z.number().min(0, "Price must be non-negative"),
        tax_mode: z.enum(['exclusive', 'inclusive']).default('exclusive')
    })).optional().default([]),
    as_of_date: z.date().optional(),
    type: z.enum(['product', 'service']).default('product'),
})

export type ProductFormValues = z.infer<typeof productSchema>
