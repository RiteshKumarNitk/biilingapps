
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const orderSchema = z.object({
    customerName: z.string().min(1, 'Name is required'),
    customerPhone: z.string().min(10, 'Valid phone required'),
    customerAddress: z.string().min(1, 'Address is required'),
    items: z.array(z.object({
        productId: z.string(),
        name: z.string(),
        quantity: z.number().min(1),
        price: z.number(),
    })).min(1, 'Cart is empty'),
    totalAmount: z.number(),
    // For demo, we are assuming all orders go to a single tenant or tenant_id is passed.
    // Since we don't have a dynamic tenant context in public store yet, we'll fetch the first tenant or need a hidden field.
    // We will assume the demo runs for ONE main tenant for now, or the product carries tenant_id.
})

export async function submitOrder(data: any) {
    const supabase = await createClient()
    const validated = orderSchema.parse(data)

    // 1. Get Tenant ID (Ideally from the product or hidden field). 
    // We will grab the first tenant for this demo since we are in a single-domain context locally.
    const { data: tenant } = await supabase.from('tenants').select('id').limit(1).single()
    if (!tenant) throw new Error('Store unavailable')

    // 2. Insert Order
    const { error } = await supabase.from('online_orders').insert({
        tenant_id: tenant.id,
        customer_name: validated.customerName,
        customer_phone: validated.customerPhone,
        customer_address: validated.customerAddress,
        total_amount: validated.totalAmount,
        items: validated.items, // JSONB
        status: 'new'
    })

    if (error) {
        console.error(error)
        throw new Error('Failed to place order')
    }

    revalidatePath('/dashboard/orders')
    return { success: true }
}

export async function getOnlineOrders() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('online_orders')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data
}

export async function updateOrderStatus(id: string, status: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('online_orders').update({ status }).eq('id', id)
    if (error) throw new Error(error.message)
    revalidatePath('/dashboard/orders')
}
