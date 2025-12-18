
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
    type: z.enum(['product', 'service']).default('product'),
})

export type ProductFormValues = z.infer<typeof productSchema>
