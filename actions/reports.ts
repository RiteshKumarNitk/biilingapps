'use server'

import { createClient } from '@/utils/supabase/server'

export async function getSalesReport(startDate?: string, endDate?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase.from('users_profile').select('tenant_id').eq('id', user?.id).single()
    if (!profile) return []

    let query = supabase.from('invoices')
        .select('*')
        .eq('tenant_id', profile.tenant_id)
        .neq('status', 'cancelled')
        .order('date', { ascending: false })

    if (startDate) query = query.gte('date', startDate)
    if (endDate) query = query.lte('date', endDate)

    const { data, error } = await query
    if (error) throw new Error(error.message)
    return data
}

export async function getPurchaseReport(startDate?: string, endDate?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase.from('users_profile').select('tenant_id').eq('id', user?.id).single()
    if (!profile) return []

    let query = supabase.from('purchase_orders')
        .select('*')
        .eq('tenant_id', profile.tenant_id)
        .order('date', { ascending: false })

    if (startDate) query = query.gte('date', startDate)
    if (endDate) query = query.lte('date', endDate)

    const { data, error } = await query
    if (error) throw new Error(error.message)
    return data
}

export async function getStockReport() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase.from('users_profile').select('tenant_id').eq('id', user?.id).single()
    if (!profile) return []

    const { data, error } = await supabase.from('products')
        .select('*')
        .eq('tenant_id', profile.tenant_id)
        .order('name', { ascending: true })

    if (error) throw new Error(error.message)
    return data
}

export async function getPartyReport() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase.from('users_profile').select('tenant_id').eq('id', user?.id).single()
    if (!profile) return []

    const { data, error } = await supabase.from('parties')
        .select('*')
        .eq('tenant_id', profile.tenant_id)
        .order('name', { ascending: true })

    if (error) throw new Error(error.message)
    return data
}

export async function getGSTReport(startDate?: string, endDate?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase.from('users_profile').select('tenant_id').eq('id', user?.id).single()
    if (!profile) return { sales: [], purchases: [] }

    // Sales Data (GSTR-1)
    let salesQuery = supabase.from('invoice_items').select(`
        *,
        invoices!inner (
            invoice_number,
            date,
            party_name,
            total_gst,
            grand_total
        )
    `).eq('tenant_id', profile.tenant_id)

    // Note: Filtering on joined table columns via !inner requires the filter to be applied on the returned data or via complex filter syntax.
    // Supabase JS filter on joined table: .gte('invoices.date', ...) works if relationship is correct.

    if (startDate) salesQuery = salesQuery.gte('invoices.date', startDate)
    if (endDate) salesQuery = salesQuery.lte('invoices.date', endDate)

    const { data: sales, error: salesError } = await salesQuery
    if (salesError) console.error("GST Sales Error", salesError)

    return {
        sales: sales || [],
        purchases: [] // Purchase GST not fully tracked at item level yet
    }
}
