
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createPurchaseBill(data: any) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // Get tenant
    const { data: profile } = await supabase.from('users_profile').select('tenant_id').eq('id', user.id).single()
    if (!profile) throw new Error('Profile not found')

    // 1. Create Purchase Order (Bill)
    // Mapping payload to DB Schema
    // Note: Schema uses 'po_items' and 'purchase_orders'
    const { data: po, error: poError } = await supabase
        .from('purchase_orders')
        .insert({
            tenant_id: profile.tenant_id,
            po_number: data.bill_number,
            party_id: data.party_id, // We need party_id. If name only, we might fail or need lookup.
            party_name: data.party_name,
            date: data.date,
            status: 'received', // Bill implies received?
            grand_total: data.grand_total,
            notes: data.notes
        })
        .select()
        .single()

    if (poError) throw new Error(poError.message)

    // 2. Create PO Items
    const items = data.items.map((item: any) => ({
        tenant_id: profile.tenant_id,
        po_id: po.id,
        product_id: item.product_id,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unit_price: item.unit_price,
        gst_rate: item.gst_rate || 0,
        tax_amount: item.tax_amount || 0,
        discount: item.discount || 0,
        total_amount: item.total_amount,
        hsn_code: item.hsn_code
    }))

    const { error: itemsError } = await supabase.from('po_items').insert(items)

    if (itemsError) throw new Error(itemsError.message)

    // 3. Update Stock (Increase)
    for (const item of items) {
        if (item.product_id) {
            // Record movement
            await supabase.from('stock_movements').insert({
                tenant_id: profile.tenant_id,
                product_id: item.product_id,
                type: 'purchase_received',
                quantity: item.quantity,
                reference_id: po.id,
                description: 'Purchase Bill ' + data.bill_number
            })

            // Update Product Stock
            // Fetch current first to be safe or use increment rpc if available.
            // Using RPC is better for concurrency, but simple update for now:
            const { data: currentProd } = await supabase.from('products').select('stock_quantity').eq('id', item.product_id).single()
            if (currentProd) {
                await supabase.from('products')
                    .update({ stock_quantity: currentProd.stock_quantity + item.quantity })
                    .eq('id', item.product_id)
            }
        }
    }

    // 4. Update Party Ledger (Payable)
    if (data.party_id) {
        try {
            const { recalculatePartyBalance } = await import('@/actions/parties')
            await recalculatePartyBalance(data.party_id)
        } catch (e) {
            console.error("Failed to sync party balance (purchase):", e)
        }
    }

    revalidatePath('/dashboard/purchase/bills')
    return po
}

export async function getPurchaseStats(filters?: { search?: string; startDate?: Date; endDate?: Date; status?: string }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase.from('users_profile').select('tenant_id').eq('id', user?.id).single()
    if (!profile) return { total: 0, count: 0 }

    let query = supabase.from('purchase_orders')
        .select('grand_total, status')
        .eq('tenant_id', profile.tenant_id)

    if (filters?.search) query = query.ilike('party_name', `%${filters.search}%`)
    if (filters?.startDate) query = query.gte('date', filters.startDate.toISOString())
    if (filters?.endDate) query = query.lte('date', filters.endDate.toISOString())
    if (filters?.status) query = query.eq('status', filters.status)

    const { data, error } = await query

    if (error || !data) return { total: 0, count: 0 }

    const total = data.reduce((sum, bill) => sum + (bill.grand_total || 0), 0)

    return { total, count: data.length }
}

export async function getPurchaseBills(page = 1, pageSize = 10, filters?: { search?: string; startDate?: Date; endDate?: Date }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase.from('users_profile').select('tenant_id').eq('id', user?.id).single()
    if (!profile) return { data: [], total: 0 }

    const start = (page - 1) * pageSize
    const end = start + pageSize - 1

    let query = supabase
        .from('purchase_orders')
        .select('*', { count: 'exact' })
        .eq('tenant_id', profile.tenant_id)
        .range(start, end)
        .order('date', { ascending: false })

    if (filters?.search) {
        query = query.ilike('party_name', `%${filters.search}%`)
    }
    if (filters?.startDate) {
        query = query.gte('date', filters.startDate.toISOString())
    }
    if (filters?.endDate) {
        query = query.lte('date', filters.endDate.toISOString())
    }

    const { data, error, count } = await query

    if (error) {
        console.error('Error fetching purchase bills:', error)
        throw new Error(error.message)
    }

    return { data, total: count || 0 }
}

export async function deletePurchaseBill(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // 1. Get PO Details
    const { data: po, error: poError } = await supabase
        .from('purchase_orders')
        .select(`*, po_items(*)`)
        .eq('id', id)
        .single()

    if (poError || !po) throw new Error('Purchase Bill not found')

    // 2. Reverse Stock (Decrease)
    if (po.po_items && po.po_items.length > 0) {
        for (const item of po.po_items) {
            if (item.product_id) {
                const { data: prod } = await supabase
                    .from('products')
                    .select('stock_quantity')
                    .eq('id', item.product_id)
                    .single()

                if (prod) {
                    // Decrease stock
                    await supabase.from('products')
                        .update({ stock_quantity: Math.max(0, prod.stock_quantity - item.quantity) })
                        .eq('id', item.product_id)

                    // Record Movement
                    await supabase.from('stock_movements').insert({
                        tenant_id: po.tenant_id,
                        product_id: item.product_id,
                        type: 'purchase_deleted',
                        quantity: item.quantity,
                        reference_id: id,
                        description: `Purchase Bill ${po.po_number} Deleted`
                    })
                }
            }
        }
    }

    // 3. Delete PO
    const { error: delError } = await supabase.from('purchase_orders').delete().eq('id', id)
    if (delError) throw new Error(delError.message)

    // 4. Update Party Balance
    if (po.party_id) {
        try {
            const { recalculatePartyBalance } = await import('@/actions/parties')
            await recalculatePartyBalance(po.party_id)
        } catch (e) {
            console.error("Failed to sync balance after delete:", e)
        }
    }

    revalidatePath('/dashboard/purchase/bills')
    revalidatePath('/dashboard/parties')
    return { success: true }
}

export async function getLastPurchaseBillNumber() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: profile } = await supabase.from('users_profile').select('tenant_id').eq('id', user.id).single()
    if (!profile) return null

    const { data: lastPO } = await supabase
        .from('purchase_orders')
        .select('po_number')
        .eq('tenant_id', profile.tenant_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

    if (lastPO && lastPO.po_number) {
        // Try to parse number
        const parts = lastPO.po_number.split('-')
        if (parts.length > 1) {
            const num = parseInt(parts[parts.length - 1])
            if (!isNaN(num)) {
                return `${parts[0]}-${String(num + 1).padStart(4, '0')}`
            }
        }
    }

    return 'BILL-0001'
}

export async function getPurchaseBillDetails(id: string) {
    const supabase = await createClient()

    // 1. Get PO with Party Details
    const { data: bill, error: billError } = await supabase
        .from('purchase_orders')
        .select(`
            *,
            parties (
                name,
                address,
                email,
                phone,
                gstin,
                shipping_address,
                city,
                state,
                pincode,
                pan_number
            )
        `)
        .eq('id', id)
        .single()

    if (billError) throw new Error(billError.message)

    // 2. Get Items
    const { data: items, error: itemsError } = await supabase
        .from('po_items')
        .select(`
            *,
            products (
                name,
                hsn_code
            )
        `)
        .eq('po_id', id)

    if (itemsError) throw new Error(itemsError.message)

    // 3. Get Tenant
    const { data: tenant } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', bill.tenant_id)
        .single()

    return { bill, items, tenant }
}
