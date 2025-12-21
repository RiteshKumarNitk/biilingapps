'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getQuotations(type: 'estimate' | 'proforma' = 'estimate') {
    const supabase = await createClient()

    // Fetch all quotations ordered by date
    // Note: Assuming 'type' column exists. If migration wasn't run, this might fail unless column exists.
    // If column doesn't exist yet, we only filter if it exists (dynamically? No, let's assume it exists or fallback).
    // For safety since migration might have been skipped/failed, we try-catch or just select * first.
    // But correct way is to trust the schema update.

    const { data, error } = await supabase
        .from('quotations')
        .select('*')
        .eq('type', type)
        .order('date', { ascending: false })

    if (error) throw new Error(error.message)

    // Calculate Summary Stats
    const summary = {
        total: 0,
        converted: 0,
        open: 0
    }

    data?.forEach(q => {
        const amount = q.grand_total || 0
        summary.total += amount
        if (q.status === 'converted') {
            summary.converted += amount
        } else if (q.status === 'open' || q.status === 'sent') { // Treat 'sent' as Open
            summary.open += amount
        }
        // Closed?
    })

    return { data, summary }
}

export async function createQuotation(data: any) {
    const supabase = await createClient()

    const { data: tenantData } = await supabase.rpc('get_my_tenant_id')

    // 1. Create Header
    const { data: quotation, error: qError } = await supabase
        .from('quotations')
        .insert({
            quotation_number: data.quotation_number,
            date: new Date(data.date).toISOString(), // Ensure string
            valid_until: data.valid_until, // Optional
            party_id: data.party_id,
            party_name: data.party_name,
            subtotal: data.subtotal,
            total_gst: data.total_gst,
            discount_amount: data.discount_amount,
            grand_total: data.grand_total,
            notes: data.notes,
            status: 'sent', // Default to sent/draft
            type: data.type || 'estimate', // 'estimate' or 'proforma'
            tenant_id: tenantData
        })
        .select()
        .single()

    if (qError) throw new Error(qError.message)

    // 2. Create Items
    if (data.items && data.items.length > 0) {
        const itemsToInsert = data.items.map((item: any) => ({
            quotation_id: quotation.id,
            product_id: item.product_id,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            gst_rate: item.gst_rate,
            tax_amount: (item.quantity * item.unit_price) * ((item.gst_rate || 0) / 100), // Calculate explicitly
            total_amount: item.total_amount,
            tenant_id: tenantData
        }))

        const { error: iError } = await supabase.from('quotation_items').insert(itemsToInsert)
        if (iError) throw new Error(iError.message)
    }

    revalidatePath('/dashboard/quotations')
    return quotation
}

export async function convertQuotationToInvoice(quotationId: string) {
    const supabase = await createClient()

    // 1. Fetch Quotation
    const { data: q, error: qError } = await supabase
        .from('quotations')
        .select(`*, items:quotation_items(*)`)
        .eq('id', quotationId)
        .single()

    if (qError || !q) throw new Error('Quotation not found')

    // 2. Generate Invoice Number (Simple Auto-Increment Logic or Random for now)
    // Ideally fetch last invoice number and increment
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`

    // 3. Create Invoice Record
    const { data: inv, error: invError } = await supabase.from('invoices').insert({
        invoice_number: invoiceNumber,
        date: new Date().toISOString(),
        party_id: q.party_id,
        party_name: q.party_name,
        subtotal: q.subtotal,
        total_gst: q.total_gst,
        discount_amount: q.discount_amount,
        grand_total: q.grand_total,
        status: 'generated',
        notes: `Converted from Quotation ${q.quotation_number}`
    }).select().single()

    if (invError) throw new Error(invError.message)

    // 4. Create Invoice Items
    const items = q.items.map((item: any) => ({
        invoice_id: inv.id,
        product_id: item.product_id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        gst_rate: item.gst_rate,
        tax_amount: item.tax_amount,
        total_amount: item.total_amount
    }))

    const { error: itemsError } = await supabase.from('invoice_items').insert(items)
    if (itemsError) throw new Error(itemsError.message)

    // 5. Update Quotation Status
    await supabase.from('quotations').update({ status: 'converted' }).eq('id', quotationId)

    // 6. Impact Stock? 
    // Usually Invoice creation trigger handles stock deduction. 
    // Since we insert into 'invoices'/'invoice_items', we need to check if we have triggers for stock.
    // Our 'stock_movements' logic might need manual trigger or auto.
    // Currently, we don't have an auto-trigger on 'invoice_items' insert to 'stock_movements'.
    // We relied on 'createInvoice' server action to add stock movement.
    // So we must ADD STOCK MOVEMENT here manually.

    // 6b. Add Stock Movement (OUT)
    const movements = q.items.map((item: any) => ({
        product_id: item.product_id,
        type: 'invoice_sent',
        quantity: item.quantity,
        reference_id: inv.id,
        notes: `Invoice ${invoiceNumber} (Converted from Quote)`
    }))

    await supabase.from('stock_movements').insert(movements)

    revalidatePath('/dashboard/invoices')
    revalidatePath('/dashboard/quotations')
    return inv
}
