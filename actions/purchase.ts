
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
        unit_price: item.unit_price,
        total_amount: item.total_amount,
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
    // Ideally done via trigger or separate ledger service
    // For now assuming existing backend logic or we just record the payment if any.
    if (data.payment_status !== 'paid') {
        // Record payable?
        // Check partying mapping.
    }

    revalidatePath('/dashboard/purchase/bills')
    return po
}
