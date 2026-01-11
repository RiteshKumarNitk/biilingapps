
'use server'

import { createClient } from '@/utils/supabase/server'
import { invoiceSchema, InvoiceFormValues } from '@/lib/schemas/invoice'
import { revalidatePath } from 'next/cache'

export async function getInvoiceStats(filters?: { search?: string; startDate?: Date; endDate?: Date; status?: string }) {
    const supabase = await createClient()

    // Query for stats - We need to fetch all matching rows to aggregate
    // Ideally this should be an RPC or .csv aggregation for performance on huge data, 
    // but for <10k rows JS reduce is fine.
    let query = supabase.from('invoices').select('grand_total, payment_status, date, party_name')

    if (filters?.search) query = query.ilike('party_name', `%${filters.search}%`)
    if (filters?.startDate) query = query.gte('date', filters.startDate.toISOString())
    if (filters?.endDate) query = query.lte('date', filters.endDate.toISOString())
    if (filters?.status) {
        // Handle explicit status filtering if passed
        // For 'unpaid', usually means status != 'paid'
        if (filters.status === 'unpaid') query = query.neq('payment_status', 'paid')
        else query = query.eq('payment_status', filters.status)
    }

    const { data, error } = await query

    if (error || !data) {
        console.error("Stats error", error)
        return { totalSales: 0, received: 0, balance: 0 }
    }

    const totalSales = data.reduce((sum, inv) => sum + (inv.grand_total || 0), 0)
    const received = data.reduce((sum, inv) => inv.payment_status === 'paid' ? sum + (inv.grand_total || 0) : sum, 0)
    const balance = data.reduce((sum, inv) => inv.payment_status !== 'paid' ? sum + (inv.grand_total || 0) : sum, 0)

    return { totalSales, received, balance }
}

export async function getInvoices(page = 1, pageSize = 10, filters?: { search?: string; startDate?: Date; endDate?: Date; status?: string }) {
    const supabase = await createClient()
    const start = (page - 1) * pageSize
    const end = start + pageSize - 1

    let query = supabase
        .from('invoices')
        .select('*', { count: 'exact' })
        .range(start, end)
        .order('created_at', { ascending: false })

    if (filters?.search) {
        query = query.ilike('party_name', `%${filters.search}%`)
    }

    if (filters?.startDate && filters?.endDate) {
        query = query.gte('date', filters.startDate.toISOString()).lte('date', filters.endDate.toISOString())
    }

    // Status filter if needed, though not explicitly in UI requirement "This Month" covers date.

    const { data, error, count } = await query

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
    // We explicitly set received_amount to 0 for the Invoice Record, 
    // and create a separate Payment Transaction for the ledger.
    // This ensures distinct ledger entries (Sale vs Receipt) "Just like Purchase".
    const actualReceivedAmount = validated.received_amount || 0

    const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
            tenant_id: profile.tenant_id,
            invoice_number: validated.invoice_number,
            party_id: validated.party_id,
            party_name: validated.party_name,
            date: validated.date.toISOString(),
            due_date: validated.due_date?.toISOString(),
            status: validated.status,
            payment_status: validated.payment_status,
            // Calculate totals
            subtotal: validated.items.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0),
            grand_total: validated.items.reduce((acc, item) => acc + item.total_amount, 0),
            // received_amount: 0, // Removed to fix missing column error
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
        unit: item.unit,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount: item.discount || 0,
        gst_rate: item.gst_rate,
        tax_amount: item.tax_amount || 0,
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

    // 4. Create Payment Record (Transactions)
    if (actualReceivedAmount > 0 && validated.party_id) {
        const { error: paymentError } = await supabase.from('payments').insert({
            tenant_id: profile.tenant_id,
            party_id: validated.party_id,
            amount: actualReceivedAmount,
            mode: 'cash', // Default to cash as schema specific mode is missing
            type: 'in',
            transaction_ref: validated.invoice_number,
            created_at: validated.date.toISOString(), // Match invoice date
            notes: 'Payment for Invoice ' + validated.invoice_number
        })

        if (paymentError) {
            console.error("Failed to create linked payment:", paymentError)
        }
    }

    // 5. Update Party Balance
    if (validated.party_id) {
        try {
            const { recalculatePartyBalance } = await import('@/actions/parties')
            await recalculatePartyBalance(validated.party_id)
        } catch (e) {
            console.error("Failed to sync party balance:", e)
        }
    }

    revalidatePath('/dashboard/invoices')
    revalidatePath('/dashboard/parties')
    return invoice
}

export async function getInvoiceDetails(id: string) {
    const supabase = await createClient()

    // 1. Get Invoice
    const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', id)
        .single()

    if (invoiceError) throw new Error(invoiceError.message)

    // 2. Get Items
    const { data: items, error: itemsError } = await supabase
        .from('invoice_items')
        .select(`
            *,
            products (
                name,
                hsn_code
            )
        `)
        .eq('invoice_id', id)

    if (itemsError) throw new Error(itemsError.message)

    // 3. Get Tenant
    const { data: tenant } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', invoice.tenant_id)
        .single()

    return { invoice, items, tenant }
}



export async function getLastInvoiceNumber() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: profile } = await supabase.from('users_profile').select('tenant_id').eq('id', user.id).single()
    if (!profile) return null

    const { data: lastInvoice } = await supabase
        .from('invoices')
        .select('invoice_number')
        .eq('tenant_id', profile.tenant_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

    if (lastInvoice && lastInvoice.invoice_number) {
        // Try to parse number
        const parts = lastInvoice.invoice_number.split('-')
        if (parts.length > 1) {
            const num = parseInt(parts[parts.length - 1])
            if (!isNaN(num)) {
                return `${parts[0]}-${String(num + 1).padStart(4, '0')}`
            }
        }
    }

    return 'INV-0001'
}

export async function deleteInvoice(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // 1. Get Invoice Details
    const { data: invoice, error: invError } = await supabase
        .from('invoices')
        .select(`
            *,
            invoice_items (
                product_id,
                quantity
            )
        `)
        .eq('id', id)
        .single()

    if (invError || !invoice) throw new Error('Invoice not found')

    // 2. Reverse Stock
    const { invoice_items } = invoice
    if (invoice_items && invoice_items.length > 0) {
        for (const item of invoice_items) {
            if (item.product_id) {
                // Fetch current stock
                const { data: prod } = await supabase
                    .from('products')
                    .select('stock_quantity')
                    .eq('id', item.product_id)
                    .single()

                if (prod) {
                    // Update Stock (Add back)
                    await supabase.from('products')
                        .update({ stock_quantity: prod.stock_quantity + item.quantity })
                        .eq('id', item.product_id)

                    // Record Movement
                    await supabase.from('stock_movements').insert({
                        tenant_id: invoice.tenant_id,
                        product_id: item.product_id,
                        type: 'invoice_deleted',
                        quantity: item.quantity,
                        reference_id: id,
                        notes: `Invoice ${invoice.invoice_number} Deleted`
                    })
                }
            }
        }
    }

    // 3. Delete Linked Payment (if any)
    if (invoice.invoice_number) {
        await supabase
            .from('payments')
            .delete()
            .eq('transaction_ref', invoice.invoice_number)
            .eq('type', 'in')
    }

    // 4. Delete Invoice
    const { error: delError } = await supabase.from('invoices').delete().eq('id', id)
    if (delError) throw new Error(delError.message)

    // 5. Recalculate Balance
    if (invoice.party_id) {
        try {
            const { recalculatePartyBalance } = await import('@/actions/parties')
            await recalculatePartyBalance(invoice.party_id)
        } catch (e) {
            console.error("Failed to sync balance after delete:", e)
        }
    }

    revalidatePath('/dashboard/invoices')
    revalidatePath('/dashboard/parties')
    return { success: true }
}
