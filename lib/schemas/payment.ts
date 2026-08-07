
import * as z from 'zod'

export const paymentInSchema = z.object({
    party_id: z.string().min(1, 'Party is required'),
    amount: z.number().min(0.01, 'Amount must be greater than 0'),
    date: z.date(),
    mode: z.enum(['cash', 'bank_transfer', 'upi', 'online', 'cheque']),
    payment_number: z.string().optional(),
    transaction_ref: z.string().optional(),
    notes: z.string().optional(),
    image_url: z.string().optional(),
})

export type PaymentInFormValues = z.infer<typeof paymentInSchema>
