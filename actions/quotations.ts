'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getQuotations(
    type: 'estimate' | 'proforma' = 'estimate',
    page: number = 1,
    limit: number = 100,
    filters?: {
        search?: string
        startDate?: Date
        endDate?: Date
    }
) {
    const supabase = await createClient()

    let query = supabase
        .from('quotations')
        .select('*', { count: 'exact' })
        .eq('type', type)
        .order('date', { ascending: false })

    // Apply Filters
    if (filters?.search) {
        query = query.ilike('party_name', `%${filters.search}%`)
    }
    if (filters?.startDate) {
        query = query.gte('date', filters.startDate.toISOString())
    }
    if (filters?.endDate) {
        query = query.lte('date', filters.endDate.toISOString())
    }

    // Pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data, count, error } = await query

    if (error) throw new Error(error.message)

    // Calculate Summary Stats (This should ideally be a separate optimized query if dataset is huge)
    // For now we calculate simply based on ALL DATA (not just paginated) to show correct topline?
    // Doing aggregate query is better.

    // Stats Query:
    let statsQuery = supabase
        .from('quotations')
        .select('grand_total, status')
        .eq('type', type)

    // Apply time filters to stats too so they match view? 
    // Usually stats show "Total" independent of search, BUT if date range is selected, stats should reflect that range.
    if (filters?.startDate) statsQuery = statsQuery.gte('date', filters.startDate.toISOString())
    if (filters?.endDate) statsQuery = statsQuery.lte('date', filters.endDate.toISOString())

    const { data: statsData } = await statsQuery

    const summary = {
        total: 0,
        converted: 0,
        open: 0
    }

    statsData?.forEach(q => {
        const amount = q.grand_total || 0
        summary.total += amount
        if (q.status === 'converted') {
            summary.converted += amount
        } else if (q.status === 'open' || q.status === 'sent' || q.status === 'draft') {
            summary.open += amount
        }
    })

    return { data, count, summary }
}

export async function getQuotation(id: string) {
    const supabase = await createClient()

    // 1. Get Quotation
    const { data: quotation, error: argError } = await supabase
        .from('quotations')
        .select('*')
        .eq('id', id)
        .single()

    if (argError) throw new Error(argError.message)

    // 2. Get Items
    const { data: items, error: itemsError } = await supabase
        .from('quotation_items')
        .select(`
            *,
            products (
                name,
                hsn_code
            )
        `)
        .eq('quotation_id', id)

    if (itemsError) throw new Error(itemsError.message)

    // 3. Get Tenant
    const { data: tenant } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', quotation.tenant_id)
        .single()

    return { quotation, items, tenant }
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
            party_address: data.party_address, // NEW
            shipping_address: data.shipping_address, // NEW
            party_phone: data.party_phone, // NEW
            party_email: data.party_email, // NEW
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
            discount: item.discount, // Include discount
            tax_amount: item.tax_amount || ((item.quantity * item.unit_price) - (item.discount || 0)) * ((item.gst_rate || 0) / 100),
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
        notes: `Converted from Quotation ${q.quotation_number}`,
        tenant_id: q.tenant_id
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
        total_amount: item.total_amount,
        tenant_id: q.tenant_id
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
        notes: `Invoice ${invoiceNumber} (Converted from Quote)`,
        tenant_id: q.tenant_id
    }))

    await supabase.from('stock_movements').insert(movements)

    revalidatePath('/dashboard/invoices')
    revalidatePath('/dashboard/quotations')
    revalidatePath('/dashboard/quotations')
    return inv
}

export async function getLastQuotationNumber(type: 'estimate' | 'proforma' = 'estimate') {
    const supabase = await createClient()
    const prefix = type === 'estimate' ? 'EST' : 'PRO'

    // Get the last created quotation of this type to determine next number
    // We sort by creation date desc to get the latest one.
    const { data } = await supabase
        .from('quotations')
        .select('quotation_number')
        .eq('type', type)
        .ilike('quotation_number', `${prefix}-%`) // Only check standard formatted ones
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

    if (!data || !data.quotation_number) {
        return `${prefix}-1`
    }

    // safe logic: extract last number
    const parts = data.quotation_number.split('-')
    const lastNumStr = parts[parts.length - 1]
    const lastNum = parseInt(lastNumStr, 10)

    if (!isNaN(lastNum)) {
        return `${prefix}-${lastNum + 1}`
    }

    // fallback
    return `${prefix}-${Date.now().toString().slice(-4)}`
}
