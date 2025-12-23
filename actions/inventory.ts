
'use server'

import { createClient } from '@/utils/supabase/server'
import { productSchema, ProductFormValues } from '@/lib/schemas/product'
import { revalidatePath } from 'next/cache'

export async function getProducts(page = 1, pageSize = 10, search = '') {
    const supabase = await createClient()
    const start = (page - 1) * pageSize
    const end = start + pageSize - 1

    let query = supabase
        .from('products')
        .select('*', { count: 'exact' })
        .range(start, end)
        .order('created_at', { ascending: false })

    if (search) {
        query = query.ilike('name', `%${search}%`)
    }

    const { data, error, count } = await query

    if (error) {
        throw new Error(error.message)
    }

    return { data, count }
}

export async function createProduct(data: ProductFormValues) {
    const supabase = await createClient()
    const validated = productSchema.parse(data)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // Get tenant_id from profile
    const { data: profile } = await supabase
        .from('users_profile')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

    if (!profile) throw new Error('Profile not found')

    const { error } = await supabase.from('products').insert({
        ...validated,
        tenant_id: profile.tenant_id,
    })

    if (error) throw new Error(error.message)

    revalidatePath('/dashboard/inventory')
}

export async function updateProduct(id: string, data: ProductFormValues) {
    const supabase = await createClient()
    const validated = productSchema.parse(data)

    const { error } = await supabase
        .from('products')
        .update(validated)
        .eq('id', id)

    if (error) throw new Error(error.message)

    revalidatePath('/dashboard/inventory')
}

export async function deleteProduct(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('products').delete().eq('id', id)

    if (error) throw new Error(error.message)

    revalidatePath('/dashboard/inventory')
}

export async function getInventoryStats() {
    const supabase = await createClient()
    const { data: products } = await supabase.from('products').select('stock_quantity, price, cost_price, type')

    if (!products) return { totalStockValue: 0, totalStockQty: 0, lowStockCount: 0 }

    const totalStockValue = products.reduce((acc, p) => {
        if (p.type === 'service') return acc
        return acc + (p.stock_quantity * (p.cost_price || 0))
    }, 0)

    const totalStockQty = products.reduce((acc, p) => {
        if (p.type === 'service') return acc
        return acc + (p.stock_quantity || 0)
    }, 0)

    return { totalStockValue, totalStockQty }
}

export async function getCategories() {
    const supabase = await createClient()
    const { data } = await supabase.from('products').select('category, id')

    const categoryMap = new Map<string, number>()
    const uncategorizedCount = 0

    data?.forEach(p => {
        const cat = p.category || 'Uncategorized'
        categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1)
    })

    return Array.from(categoryMap.entries()).map(([name, count]) => ({ name, count }))
}

export async function getUnits() {
    const supabase = await createClient()
    const { data } = await supabase.from('products').select('unit').not('unit', 'is', null)

    // Get unique units
    const units = Array.from(new Set(data?.map(p => p.unit) || []))
    return units.map(u => ({ name: u, symbol: u, decimal: true })) // detailed mock
}

export async function getProductTransactions(productId: string) {
    const supabase = await createClient()

    // We fetch checks from stock_movements for products
    // For services, we might need to check invoice_items mainly (since no stock movement)

    // 1. Stock Movements (Purchase, Sales, Adjustments)
    const { data: movements } = await supabase
        .from('stock_movements')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false })

    // 2. We can also fetch Invoice Items and PO Items to get "Party Name" if reference_id links to them
    // This is a bit complex without joins, but we'll try to do a basic enrichment if possible.
    // For now, let's return movements as the primary source.

    return movements
}

export async function bulkUpdateCategory(productIds: string[], newCategory: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('products')
        .update({ category: newCategory })
        .in('id', productIds)

    if (error) throw new Error(error.message)
    revalidatePath('/dashboard/inventory')
}

export async function adjustStock(productId: string, quantity: number, type: 'ADD' | 'REDUCE', reason: string, remarks?: string, date?: Date) {
    const supabase = await createClient()

    // 1. Get current stock
    const { data: product } = await supabase.from('products').select('stock_quantity').eq('id', productId).single()
    if (!product) throw new Error('Product not found')

    const newStock = type === 'ADD'
        ? product.stock_quantity + quantity
        : product.stock_quantity - quantity

    // 2. Update Product Stock
    const { error: updateError } = await supabase
        .from('products')
        .update({ stock_quantity: newStock })
        .eq('id', productId)

    if (updateError) throw new Error(updateError.message)

    // 3. Record Movement
    const { error: moveError } = await supabase.from('stock_movements').insert({
        product_id: productId,
        type: type === 'ADD' ? 'ADJUSTMENT_ADD' : 'ADJUSTMENT_REDUCE',
        quantity: quantity,
        description: `Stock Adjustment: ${reason} - ${remarks || ''}`,
        created_at: date ? date.toISOString() : new Date().toISOString()
    })

    if (moveError) console.error("Failed to record movement", moveError)

    revalidatePath('/dashboard/inventory')
}

export async function getAdjustmentHistory() {
    const supabase = await createClient()
    const { data } = await supabase
        .from('stock_movements')
        .select('*, products(name)')
        .in('type', ['ADJUSTMENT_ADD', 'ADJUSTMENT_REDUCE'])
        .order('created_at', { ascending: false })
        .limit(50)

    return data
}

export type BulkUpdateItem = {
    id: string
    [key: string]: any
}

export async function bulkUpdateProducts(updates: BulkUpdateItem[]) {
    const supabase = await createClient()

    // Process in parallel (limit generic concurrency if needed, but for <100 ok)
    const promises = updates.map(item => {
        const { id, ...rest } = item
        return supabase.from('products').update(rest).eq('id', id)
    })

    const results = await Promise.all(promises)
    const errors = results.filter(r => r.error)

    if (errors.length > 0) {
        throw new Error(`Failed to update ${errors.length} items`)
    }

    revalidatePath('/dashboard/inventory')
    revalidatePath('/dashboard/utilities/bulk-gst')
}

export type BulkStockUpdate = {
    id: string
    current_stock: number
    adjustment_type: 'ADD' | 'REDUCE'
    quantity: number
    reason: string
}

export async function bulkAdjustStock(updates: BulkStockUpdate[]) {
    const supabase = await createClient()

    const promises = updates.map(async (item) => {
        const { id, current_stock, adjustment_type, quantity, reason } = item

        if (quantity <= 0) return // Skip 0 changes

        const newStock = adjustment_type === 'ADD'
            ? current_stock + quantity
            : current_stock - quantity

        // Update product
        const { error: pError } = await supabase.from('products').update({ stock_quantity: newStock }).eq('id', id)
        if (pError) return { error: pError }

        // Record movement
        const { error: mError } = await supabase.from('stock_movements').insert({
            product_id: id,
            type: adjustment_type === 'ADD' ? 'ADJUSTMENT_ADD' : 'ADJUSTMENT_REDUCE',
            quantity: quantity,
            description: `Bulk Adjustment: ${reason}`,
            created_at: new Date().toISOString()
        })
        return { error: mError }
    })

    const results = await Promise.all(promises)
    const errors = results.filter(r => r?.error)

    if (errors.length > 0) {
        throw new Error(`Failed to update stock for some items`)
    }

    revalidatePath('/dashboard/inventory')
    revalidatePath('/dashboard/utilities/bulk-gst')
}

export async function renameCategory(oldName: string, newName: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('products')
        .update({ category: newName })
        .eq('category', oldName)

    if (error) throw new Error(error.message)
    revalidatePath('/dashboard/inventory')
}

export async function deleteCategory(name: string) {
    // We treat "delete" as "uncategorize" to be safe, or we could delete items?
    // User request "delete if not required". Usually means delete the category label.
    // So we set items to "General" or null.
    const supabase = await createClient()
    const { error } = await supabase
        .from('products')
        .update({ category: 'General' })
        .eq('category', name)

    if (error) throw new Error(error.message)
    revalidatePath('/dashboard/inventory')
}

export async function renameUnit(oldName: string, newName: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('products')
        .update({ unit: newName })
        .eq('unit', oldName)

    if (error) throw new Error(error.message)
    revalidatePath('/dashboard/inventory')
}

export async function deleteUnit(name: string) {
    // Revert to 'pcs' or default
    const supabase = await createClient()
    const { error } = await supabase
        .from('products')
        .update({ unit: 'pcs' })
        .eq('unit', name)

    if (error) throw new Error(error.message)
    revalidatePath('/dashboard/inventory')
}
