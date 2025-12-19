
import { z } from "zod"

export const partySchema = z.object({
    name: z.string().min(1, "Party name is required"),
    gstin: z.string().optional(),
    phone: z.string().optional(),

    // GST & Address
    gst_type: z.string().default("Unregistered/Consumer"),
    state: z.string().optional(),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    billing_address: z.string().optional(),
    shipping_address: z.string().optional(),
    is_shipping_same: z.boolean().default(true),

    // Credit & Balance
    opening_balance: z.coerce.number().optional(),
    balance_type: z.enum(['to_pay', 'to_receive']).default('to_receive'),
    as_of_date: z.date().optional(),
    credit_limit: z.coerce.number().optional(),
    is_custom_credit_limit: z.boolean().default(false), // Logic helper

    // Additional
    description: z.string().optional(),
})

export type PartyFormValues = z.infer<typeof partySchema>
