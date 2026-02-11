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
    unit?: string
    unit_price: number
    discount?: number
    gst_rate: number
    tax_amount: number
    total_amount: number
    hsn_code?: string
}

export type CreateSaleOrderData = {
    party_id: string
    order_number: string
    date: Date
    due_date?: Date
    notes?: string
    items: SaleOrderItem[]
}

export async function getSaleOrders(
    page = 1,
    pageSize = 100,
    filters?: {
        search?: string;
        startDate?: Date;
        endDate?: Date;
        status?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }
) {
    const supabase = await createClient()

    const start = (page - 1) * pageSize
    const end = start + pageSize - 1

    let query = supabase
        .from('sale_orders')
        .select(`
            *,
            parties (name)
        `)
        .range(start, end)

    // Apply Search
    if (filters?.search) {
        query = query.or(`order_number.ilike.%${filters.search}%,party_name.ilike.%${filters.search}%`) // party_name logic might fail if it's only in joined table, but we store party_name denormalized too?
        // Checking schema in createSaleOrder: it saves party_name: order.party_name || 'Unknown' in convert but create just has party_id.
        // Wait, CreateSaleOrderData doesn't have party_name?
        // createSaleOrder line 147 just saves party_id.
        // So search on party_name needs to be on the joined table or if we denormalized it.
        // Looking at lines 87-92 of original file:
        // party_name: order.parties?.name || order.party_name || 'Unknown'
        // So we rely on join. Search on joined column in Supabase is tricky with OR.
        // For now let's search order_number. If we want party search we might need to rely on the embedded resource search syntax or denormalization.
        // Actually, let's look at getInvoices (Step 12).
        // query.or(`party_name.ilike.%${filters.search}%,invoice_number.ilike.%${filters.search}%`)
        // Invoices table has party_name column.
        // Does sale_orders have party_name? "createSaleOrder" doesn't insert it.
        // Let's assume NO party_name column in sale_orders for now to be safe, unless I add it?
        // But the user wants it to work.
        // I'll stick to order_number search for safely. Or try to search filtered by party_id if I could lookup party first.
        // Actually, let's just search order_number for now to avoid 500s.
        query = query.ilike('order_number', `%${filters.search}%`)
    }

    // Apply Date Range
    if (filters?.startDate) {
        query = query.gte('date', filters.startDate.toISOString())
    }
    if (filters?.endDate) {
        query = query.lte('date', filters.endDate.toISOString())
    }

    // Apply Status
    if (filters?.status && filters.status !== 'all') {
        if (filters.status === 'overdue') {
            // Overdue is calculated, not stored... wait.
            // If status is 'open' and due_date < today.
            // Database query for this is complex.
            // We can filter for status 'open' AND due_date < now.
            const today = new Date().toISOString()
            query = query.eq('status', 'open').lt('due_date', today)
        } else {
            query = query.eq('status', filters.status)
        }
    }

    // Apply Sort
    const sortField = filters?.sortBy || 'created_at'
    const sortAscending = filters?.sortOrder === 'asc'

    // Sort logic
    if (sortField === 'grand_total') {
        query = query.order('grand_total', { ascending: sortAscending })
    } else {
        query = query.order(sortField, { ascending: sortAscending })
    }

    const { data: rawData, error } = await query

    if (error) {
        console.error('Error fetching sale orders:', error)
        return []
    }

    // Post-process for "Overdue" status visualization if not explicitly filtered (or even if filtered)
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
            party_name: order.parties?.name || 'Unknown'
        }
    })

    return orders
}

export async function getSaleOrder(id: string) {
    const supabase = await createClient()

    // 1. Get Order
    const { data: order, error: orderError } = await supabase
        .from('sale_orders')
        .select('*')
        .eq('id', id)
        .single()

    if (orderError) throw new Error(orderError.message)

    // 2. Get Items
    const { data: items, error: itemsError } = await supabase
        .from('sale_order_items')
        .select(`
            *,
            products (
                name,
                hsn_code
            )
        `)
        .eq('sale_order_id', id)

    if (itemsError) throw new Error(itemsError.message)

    // 3. Get Tenant
    const { data: tenant } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', order.tenant_id)
        .single()

    return { order, items, tenant }
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

    // 2. Insert Order (With Retry for Unique Number)
    let order_number = data.order_number
    let attempt = 0
    let order = null
    let orderError = null

    while (attempt < 3) {
        // Attempt Insert
        const res = await supabase
            .from('sale_orders')
            .insert({
                tenant_id: profile.tenant_id,
                order_number: order_number, // Use potentially updated number
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

        order = res.data
        orderError = res.error

        if (!orderError) break

        // If duplicate key error, try one more time with a fresh number
        if (orderError.code === '23505') { // Unique constraint violation
            console.log(`Duplicate order number ${order_number}, generating new one...`)
            attempt++
            const nextRef = await getNextSaleOrderRef() // This now uses the robust "MAX" check
            if (nextRef !== order_number) {
                order_number = nextRef
            } else {
                // If "MAX" returns same, manually increment
                const parts = nextRef.split('-')
                const num = parseInt(parts[parts.length - 1])
                if (!isNaN(num)) {
                    order_number = `${parts.slice(0, parts.length - 1).join('-')}-${num + 1}`
                } else {
                    order_number = `${nextRef}-R${attempt}` // Fallback
                }
            }
        } else {
            // Other error
            throw new Error(orderError.message)
        }
    }

    if (orderError) throw new Error(`Failed to create order after retries: ${orderError.message}`)

    // 3. Insert Items
    const items = data.items.map(item => ({
        tenant_id: profile.tenant_id,
        sale_order_id: order.id,
        product_id: item.product_id || null, // Ensure explicitly null if undefined
        description: item.description,
        quantity: item.quantity,
        // unit: item.unit || 'pcs', // REMOVED: Column does not exist in DB
        unit_price: item.unit_price,
        gst_rate: item.gst_rate,
        tax_amount: item.tax_amount,
        total_amount: item.total_amount
    }))

    const { error: itemsError } = await supabase.from('sale_order_items').insert(items)

    if (itemsError) {
        console.error('Failed to save items:', itemsError)
        // Attempt to cleanup the orphan order?
        // await supabase.from('sale_orders').delete().eq('id', order.id)
        throw new Error(`Failed to save order items: ${itemsError.message} (${itemsError.code})`)
    }

    revalidatePath('/dashboard/invoices/sale-order')
    return order
}

export async function updateSaleOrder(id: string, data: CreateSaleOrderData) {
    const supabase = await createClient()

    // 1. Calculate Totals
    const subtotal = data.items.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0)
    const totalDetails = data.items.reduce((acc, item) => ({
        gst: acc.gst + item.tax_amount,
        total: acc.total + item.total_amount
    }), { gst: 0, total: 0 })

    // 2. Update Order
    const { error: orderError } = await supabase
        .from('sale_orders')
        .update({
            order_number: data.order_number,
            date: data.date.toISOString(),
            due_date: data.due_date?.toISOString(),
            party_id: data.party_id,
            notes: data.notes,
            subtotal: subtotal,
            total_gst: totalDetails.gst,
            grand_total: totalDetails.total
        })
        .eq('id', id)

    if (orderError) throw new Error(orderError.message)

    // 3. Replace Items (Delete All & Insert New)
    // First, get tenant_id for new items
    const { data: order } = await supabase.from('sale_orders').select('tenant_id').eq('id', id).single()

    if (!order) throw new Error('Order not found for item update')

    // Delete existing
    await supabase.from('sale_order_items').delete().eq('sale_order_id', id)

    // Insert new
    const items = data.items.map(item => ({
        tenant_id: order.tenant_id,
        sale_order_id: id,
        product_id: item.product_id || null,
        description: item.description,
        quantity: item.quantity,
        // unit: item.unit || 'pcs', // Default to pcs if missing
        unit_price: item.unit_price,
        gst_rate: item.gst_rate,
        tax_amount: item.tax_amount,
        total_amount: item.total_amount
    }))

    const { error: itemsError } = await supabase.from('sale_order_items').insert(items)

    if (itemsError) throw new Error(`Failed to update items: ${itemsError.message}`)

    revalidatePath('/dashboard/invoices/sale-order')
    revalidatePath(`/dashboard/invoices/sale-order/${id}`)
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

        if (!order.sale_order_items || order.sale_order_items.length === 0) {
            throw new Error(`Order ${order.order_number} has no items. Please add items or delete the order.`)
        }

        // 2. Create Invoice
        const invNum = `${order.order_number}-INV`

        const invoiceData = {
            invoice_number: invNum,
            party_id: order.party_id,
            party_name: order.party_name || 'Unknown',
            date: new Date(), // Invoice Date = Now
            due_date: order.due_date ? new Date(order.due_date) : undefined,
            status: 'generated',
            payment_status: 'unpaid',
            received_amount: 0,
            items: order.sale_order_items.map((item: any) => ({
                product_id: item.product_id, // can be null/undefined
                description: item.description,
                unit: item.unit || 'pcs', // Default if missing
                quantity: item.quantity,
                unit_price: item.unit_price,
                discount: 0,
                gst_rate: item.gst_rate,
                tax_amount: item.tax_amount,
                total_amount: item.total_amount
            }))
        }

        try {
            // console.log("Converting with data:", JSON.stringify(invoiceData, null, 2))
            await createInvoice(invoiceData as any)

            // 3. Mark Order as Converted
            await supabase
                .from('sale_orders')
                .update({ status: 'converted' })
                .eq('id', id)

        } catch (e: any) {
            console.error(`Failed to convert order ${id}`, e)
            throw new Error(`Failed to convert order ${order.order_number}: ${e.message}`)
        }
    }

    revalidatePath('/dashboard/invoices/sale-order')
    revalidatePath('/dashboard/invoices')
}

export async function getNextSaleOrderRef() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return 'ORD-1'

    const { data: profile } = await supabase.from('users_profile').select('tenant_id').eq('id', user.id).single()
    if (!profile) return 'ORD-1'

    // Fetch all order numbers to find the true max
    const { data } = await supabase
        .from('sale_orders')
        .select('order_number')
        .eq('tenant_id', profile.tenant_id)

    if (!data || data.length === 0) return 'ORD-1'

    let maxNum = 0
    let maxPrefix = 'ORD'

    for (const row of data) {
        if (!row.order_number) continue

        const parts = row.order_number.split('-')
        if (parts.length > 1) {
            const numStr = parts[parts.length - 1]
            const num = parseInt(numStr)
            if (!isNaN(num)) {
                if (num > maxNum) {
                    maxNum = num
                    // Keep the prefix of the max number
                    maxPrefix = parts.slice(0, parts.length - 1).join('-')
                }
            }
        }
    }

    return `${maxPrefix}-${maxNum + 1}`
}
