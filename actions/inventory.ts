'use server'

import { requireAuth } from '@/lib/auth-server'
import prisma from '@/lib/prisma'
import { productSchema, ProductFormValues } from '@/lib/schemas/product'
import { revalidatePath } from 'next/cache'

function mapProductToPrisma(data: ProductFormValues) {
    return {
        name: data.name,
        description: data.description,
        sku: data.sku,
        hsnCode: data.hsn_code,
        price: data.price,
        costPrice: data.cost_price,
        gstRate: data.gst_rate,
        stockQuantity: data.stock_quantity,
        lowStockThreshold: data.low_stock_threshold,
        unit: data.unit,
        barcode: data.barcode,
        imageUrl: data.image_url,
        category: data.category,
        taxMode: data.tax_mode,
        discountValue: data.discount_value,
        discountType: data.discount_type,
        wholesalePrice: data.wholesale_price,
        wholesalePrices: data.wholesale_prices as any,
        asOfDate: data.as_of_date,
        type: data.type
    }
}

export async function getProducts(page = 1, pageSize = 10, search = '') {
    const user = await requireAuth()
    const start = (page - 1) * pageSize

    const where: any = { tenantId: user.tenantId }
    if (search) {
        where.name = { contains: search, mode: 'insensitive' }
    }

    const [data, count] = await Promise.all([
        prisma.product.findMany({
            where,
            skip: start,
            take: pageSize,
            orderBy: { createdAt: 'desc' }
        }),
        prisma.product.count({ where })
    ])

    return { data, count }
}

export async function createProduct(data: ProductFormValues) {
    const user = await requireAuth()
    const validated = productSchema.parse(data)

    await prisma.product.create({
        data: {
            ...mapProductToPrisma(validated),
            tenantId: user.tenantId,
        }
    })

    revalidatePath('/dashboard/inventory')
}

export async function updateProduct(id: string, data: ProductFormValues) {
    const user = await requireAuth()
    const validated = productSchema.parse(data)

    await prisma.product.updateMany({
        where: { id, tenantId: user.tenantId },
        data: mapProductToPrisma(validated)
    })

    revalidatePath('/dashboard/inventory')
}

export async function deleteProduct(id: string) {
    const user = await requireAuth()
    await prisma.product.deleteMany({
        where: { id, tenantId: user.tenantId }
    })

    revalidatePath('/dashboard/inventory')
}

export async function getInventoryStats() {
    const user = await requireAuth()

    const products = await prisma.product.findMany({
        where: { tenantId: user.tenantId },
        select: { stockQuantity: true, costPrice: true, type: true }
    })

    const totalStockValue = products.reduce((acc: number, p) => {
        if (p.type === 'service') return acc
        return acc + ((p.stockQuantity || 0) * (p.costPrice || 0))
    }, 0)

    const totalStockQty = products.reduce((acc: number, p) => {
        if (p.type === 'service') return acc
        return acc + (p.stockQuantity || 0)
    }, 0)

    return { totalStockValue, totalStockQty }
}

export async function getCategories() {
    const user = await requireAuth()
    const products = await prisma.product.findMany({
        where: { tenantId: user.tenantId },
        select: { category: true }
    })

    const categoryMap = new Map<string, number>()
    products.forEach(p => {
        const cat = p.category || 'Uncategorized'
        categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1)
    })

    return Array.from(categoryMap.entries()).map(([name, count]) => ({ name, count }))
}

export async function getUnits() {
    const user = await requireAuth()
    const products = await prisma.product.findMany({
        where: { tenantId: user.tenantId },
        select: { unit: true }
    })

    const units = Array.from(new Set(products.map(p => p.unit).filter(Boolean) as string[]))
    return units.map(u => ({ name: u, symbol: u, decimal: true }))
}

export async function getProductTransactions(productId: string) {
    const user = await requireAuth()

    const movements = await prisma.stockMovement.findMany({
        where: { productId, tenantId: user.tenantId },
        orderBy: { createdAt: 'desc' }
    })

    return movements
}

export async function bulkUpdateCategory(productIds: string[], newCategory: string) {
    const user = await requireAuth()
    
    await prisma.product.updateMany({
        where: { id: { in: productIds }, tenantId: user.tenantId },
        data: { category: newCategory }
    })

    revalidatePath('/dashboard/inventory')
}

export async function adjustStock(productId: string, quantity: number, type: 'ADD' | 'REDUCE', reason: string, remarks?: string, date?: Date) {
    const user = await requireAuth()

    const product = await prisma.product.findUnique({
        where: { id: productId, tenantId: user.tenantId }
    })
    if (!product) throw new Error('Product not found')

    const newStock = type === 'ADD'
        ? (product.stockQuantity || 0) + quantity
        : (product.stockQuantity || 0) - quantity

    await prisma.$transaction([
        prisma.product.update({
            where: { id: productId, tenantId: user.tenantId },
            data: { stockQuantity: newStock }
        }),
        prisma.stockMovement.create({
            data: {
                tenantId: user.tenantId,
                productId,
                type: type === 'ADD' ? 'ADJUSTMENT' : 'ADJUSTMENT', // Can refine this
                quantity: type === 'ADD' ? quantity : -quantity,
                notes: `Stock Adjustment: ${reason} - ${remarks || ''}`,
                createdAt: date || new Date()
            }
        })
    ])

    revalidatePath('/dashboard/inventory')
}

export async function getAdjustmentHistory() {
    const user = await requireAuth()
    
    const movements = await prisma.stockMovement.findMany({
        where: { 
            tenantId: user.tenantId,
            type: 'ADJUSTMENT'
        },
        include: { product: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 50
    })

    return movements
}

export type BulkUpdateItem = {
    id: string
    [key: string]: any
}

export async function bulkUpdateProducts(updates: BulkUpdateItem[]) {
    const user = await requireAuth()

    const promises = updates.map(item => {
        const { id, ...rest } = item
        return prisma.product.updateMany({
            where: { id, tenantId: user.tenantId },
            data: rest as any
        })
    })

    await Promise.all(promises)

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
    const user = await requireAuth()

    const promises = updates.map(async (item) => {
        const { id, current_stock, adjustment_type, quantity, reason } = item
        if (quantity <= 0) return

        const newStock = adjustment_type === 'ADD'
            ? current_stock + quantity
            : current_stock - quantity

        return prisma.$transaction([
            prisma.product.update({
                where: { id, tenantId: user.tenantId },
                data: { stockQuantity: newStock }
            }),
            prisma.stockMovement.create({
                data: {
                    tenantId: user.tenantId,
                    productId: id,
                    type: 'ADJUSTMENT',
                    quantity: adjustment_type === 'ADD' ? quantity : -quantity,
                    notes: `Bulk Adjustment: ${reason}`
                }
            })
        ])
    })

    await Promise.all(promises)

    revalidatePath('/dashboard/inventory')
    revalidatePath('/dashboard/utilities/bulk-gst')
}

export async function renameCategory(oldName: string, newName: string) {
    const user = await requireAuth()
    
    await prisma.product.updateMany({
        where: { category: oldName, tenantId: user.tenantId },
        data: { category: newName }
    })

    revalidatePath('/dashboard/inventory')
}

export async function deleteCategory(name: string) {
    const user = await requireAuth()
    
    await prisma.product.updateMany({
        where: { category: name, tenantId: user.tenantId },
        data: { category: 'General' }
    })

    revalidatePath('/dashboard/inventory')
}

export async function renameUnit(oldName: string, newName: string) {
    const user = await requireAuth()
    
    await prisma.product.updateMany({
        where: { unit: oldName, tenantId: user.tenantId },
        data: { unit: newName }
    })

    revalidatePath('/dashboard/inventory')
}

export async function deleteUnit(name: string) {
    const user = await requireAuth()
    
    await prisma.product.updateMany({
        where: { unit: name, tenantId: user.tenantId },
        data: { unit: 'pcs' }
    })

    revalidatePath('/dashboard/inventory')
}

