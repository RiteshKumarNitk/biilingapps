'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { createInvoice } from './invoices'

export type SaleOrder = {
    id: string
    order_number: string
    date: string
    due_date: string | null
    party_id: string
    party_name: string
    status: 'open' | 'overdue' | 'converted' | 'cancelled'
    grand_total: number
    created_at: string
}

export type SaleOrderItem = {
    product_id: string | null
    description: string
    quantity: number
    unit_price: number
    gst_rate: number
    tax_amount: number
    total_amount: number
}

export type CreateSaleOrderData = {
    party_id: string
    order_number: string
    date: Date
    due_date?: Date
    notes?: string
    items: SaleOrderItem[]
}

export async function getSaleOrders(search: string = '') {
    const supabase = await createClient()

    let query = supabase
        .from('sale_orders')
        .select(`
            *,
            parties (name)
        `)
        .order('created_at', { ascending: false })

    if (search) {
        // Simple search on order number or party name if possible
        // Note: searching related table 'parties.name' is hard in simple syntax, so filtering in memory or complex query.
        // We will stick to order number search for simplicity on server side or just fetch all and filter client side if small.
        query = query.ilike('order_number', `%${search}%`)
    }

    const { data: rawData, error } = await query

    if (error) {
        console.error('Error fetching sale orders:', error)
        return []
    }

    // Process status (check overdue)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const orders = rawData.map((order: any) => {
        let status = order.status
        if (status === 'open' && order.due_date) {
            const due = new Date(order.due_date)
            if (due < today) {
                status = 'overdue'
            }
        }

        return {
            ...order,
            status,
            party_name: order.parties?.name || order.party_name || 'Unknown'
        }
    })

    return orders
}

export async function createSaleOrder(data: CreateSaleOrderData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // Get tenant
    const { data: profile } = await supabase.from('users_profile').select('tenant_id').eq('id', user.id).single()
    if (!profile) throw new Error('Profile not found')

    // 1. Calculate Totals
    const subtotal = data.items.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0)
    const totalDetails = data.items.reduce((acc, item) => ({
        gst: acc.gst + item.tax_amount,
        total: acc.total + item.total_amount
    }), { gst: 0, total: 0 })

    // 2. Insert Order
    const { data: order, error: orderError } = await supabase
        .from('sale_orders')
        .insert({
            tenant_id: profile.tenant_id,
            order_number: data.order_number,
            date: data.date.toISOString(),
            due_date: data.due_date?.toISOString(),
            party_id: data.party_id,
            notes: data.notes,
            status: 'open',
            subtotal: subtotal,
            total_gst: totalDetails.gst,
            grand_total: totalDetails.total
        })
        .select()
        .single()

    if (orderError) throw new Error(orderError.message)

    // 3. Insert Items
    const items = data.items.map(item => ({
        tenant_id: profile.tenant_id,
        sale_order_id: order.id,
        product_id: item.product_id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        gst_rate: item.gst_rate,
        tax_amount: item.tax_amount,
        total_amount: item.total_amount
    }))

    const { error: itemsError } = await supabase.from('sale_order_items').insert(items)

    if (itemsError) throw new Error('Failed to save order items')

    revalidatePath('/dashboard/invoices/sale-order')
    return order
}

export async function deleteSaleOrder(id: string) {
    const supabase = await createClient()

    // Check status first
    const { data: order } = await supabase.from('sale_orders').select('status').eq('id', id).single()
    if (order && order.status === 'converted') {
        throw new Error('Cannot delete a converted Sale Order')
    }

    const { error } = await supabase.from('sale_orders').delete().eq('id', id)
    if (error) throw new Error(error.message)
    revalidatePath('/dashboard/invoices/sale-order')
}

export async function convertOrdersToInvoice(orderIds: string[]) {
    const supabase = await createClient()

    for (const id of orderIds) {
        // 1. Fetch Order & Items
        const { data: order } = await supabase
            .from('sale_orders')
            .select(`*, sale_order_items(*)`)
            .eq('id', id)
            .single()

        if (!order) continue
        if (order.status === 'converted') continue

        // 2. Create Invoice
        // We need a new Invoice Number. 
        // For simplicity, generate one or append -INV. 
        // In real app, we should fetch next number.
        const invNum = `${order.order_number}-INV`

        try {
            await createInvoice({
                invoice_number: invNum,
                party_id: order.party_id,
                party_name: order.party_name || 'Unknown',
                date: new Date(), // Invoice Date = Now
                due_date: order.due_date ? new Date(order.due_date) : undefined,
                status: 'generated',
                payment_status: 'unpaid',
                received_amount: 0, // Force redeploy
                items: order.sale_order_items.map((item: any) => ({
                    product_id: item.product_id,
                    description: item.description,
                    unit: 'pcs',
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    discount: 0,
                    gst_rate: item.gst_rate,
                    tax_amount: item.tax_amount,
                    total_amount: item.total_amount
                }))
            })

            // 3. Mark Order as Converted
            await supabase
                .from('sale_orders')
                .update({ status: 'converted' })
                .eq('id', id)

        } catch (e) {
            console.error(`Failed to convert order ${id}`, e)
            throw new Error(`Failed to convert order ${order.order_number}`)
        }
    }

    revalidatePath('/dashboard/invoices/sale-order')
    revalidatePath('/dashboard/invoices')
}

export async function getNextSaleOrderRef() {
    const supabase = await createClient()
    const { count } = await supabase.from('sale_orders').select('*', { count: 'exact', head: true })
    return `ORD-${(count || 0) + 1}`
}
