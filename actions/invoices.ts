
'use server'

import { createClient } from '@/utils/supabase/server'
import { invoiceSchema, InvoiceFormValues } from '@/lib/schemas/invoice'
import { revalidatePath } from 'next/cache'

export async function getInvoices(page = 1, pageSize = 10) {
    const supabase = await createClient()
    const start = (page - 1) * pageSize
    const end = start + pageSize - 1

    const { data, error, count } = await supabase
        .from('invoices')
        .select('*', { count: 'exact' })
        .range(start, end)
        .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return { data, count }
}

export async function createInvoice(data: InvoiceFormValues) {
    const supabase = await createClient()
    const validated = invoiceSchema.parse(data)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // Get tenant
    const { data: profile } = await supabase.from('users_profile').select('tenant_id').eq('id', user.id).single()
    if (!profile) throw new Error('Profile not found')

    // 1. Create Invoice
    const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
            tenant_id: profile.tenant_id,
            invoice_number: validated.invoice_number,
            party_name: validated.party_name,
            date: validated.date.toISOString(),
            due_date: validated.due_date?.toISOString(),
            status: validated.status,
            payment_status: validated.payment_status,
            // Calculate totals
            subtotal: validated.items.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0),
            grand_total: validated.items.reduce((acc, item) => acc + item.total_amount, 0),
        })
        .select()
        .single()

    if (invoiceError) throw new Error(invoiceError.message)

    // 2. Create Invoice Items
    const items = validated.items.map(item => ({
        tenant_id: profile.tenant_id,
        invoice_id: invoice.id,
        product_id: item.product_id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        gst_rate: item.gst_rate,
        total_amount: item.total_amount,
    }))

    const { error: itemsError } = await supabase.from('invoice_items').insert(items)

    if (itemsError) {
        // Cleanup invoice if items fail? Or leave as draft.
        // Ideally RPC but this handles basic flow.
        throw new Error(itemsError.message)
    }

    // 3. Update Stock (Stock Movement)
    // Logic to insert into stock_movements for each item (if product_id exists)
    // Simple loop for now
    for (const item of items) {
        if (item.product_id) {
            await supabase.from('stock_movements').insert({
                tenant_id: profile.tenant_id,
                product_id: item.product_id,
                type: 'invoice_sent',
                quantity: item.quantity,
                reference_id: invoice.id,
                notes: 'Invoice ' + validated.invoice_number
            })
        }
    }

    revalidatePath('/dashboard/invoices')
    return invoice
}
