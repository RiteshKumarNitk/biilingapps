'use server'

import { requireAuth } from '@/lib/auth-server'
import prisma from '@/lib/prisma'
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
    const user = await requireAuth()

    const where: any = { tenantId: user.tenantId }
    
    if (filters?.search) {
        where.orderNumber = { contains: filters.search, mode: 'insensitive' }
    }
    
    if (filters?.startDate) {
        where.date = { ...where.date, gte: filters.startDate }
    }
    if (filters?.endDate) {
        where.date = { ...where.date, lte: filters.endDate }
    }

    if (filters?.status && filters.status !== 'all') {
        if (filters.status === 'overdue') {
            where.status = 'OPEN'
            where.dueDate = { lt: new Date() }
        } else {
            where.status = filters.status.toUpperCase()
        }
    }

    const sortField = filters?.sortBy === 'grand_total' ? 'grandTotal' : (filters?.sortBy || 'createdAt')
    const sortAscending = filters?.sortOrder === 'asc' ? 'asc' : 'desc'
    
    const start = (page - 1) * pageSize

    const rawData = await prisma.saleOrder.findMany({
        where,
        include: { party: { select: { name: true } } },
        orderBy: { [sortField]: sortAscending },
        skip: start,
        take: pageSize
    })

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const orders = rawData.map((order: any) => {
        let status = order.status.toLowerCase()
        if (status === 'open' && order.dueDate) {
            const due = new Date(order.dueDate)
            if (due < today) {
                status = 'overdue'
            }
        }

        return {
            id: order.id,
            order_number: order.orderNumber,
            date: order.date,
            due_date: order.dueDate,
            party_id: order.partyId,
            status,
            grand_total: order.grandTotal,
            created_at: order.createdAt,
            party_name: order.party?.name || 'Unknown'
        }
    })

    return orders
}

export async function getSaleOrder(id: string) {
    const user = await requireAuth()

    const order = await prisma.saleOrder.findUnique({
        where: { id, tenantId: user.tenantId },
        include: { party: true }
    })

    if (!order) throw new Error('Order not found')

    const items = await prisma.saleOrderItem.findMany({
        where: { saleOrderId: id, tenantId: user.tenantId },
        include: { product: { select: { name: true, hsnCode: true } } }
    })

    const tenant = await prisma.tenant.findUnique({
        where: { id: user.tenantId }
    })

    return { order, items, tenant }
}

export async function createSaleOrder(data: CreateSaleOrderData) {
    const user = await requireAuth()

    const subtotal = data.items.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0)
    const totalDetails = data.items.reduce((acc, item) => ({
        gst: acc.gst + item.tax_amount,
        total: acc.total + item.total_amount
    }), { gst: 0, total: 0 })

    let order_number = data.order_number
    let attempt = 0
    let order = null
    let orderError = null

    while (attempt < 3) {
        try {
            order = await prisma.saleOrder.create({
                data: {
                    tenantId: user.tenantId,
                    orderNumber: order_number,
                    date: data.date,
                    dueDate: data.due_date,
                    partyId: data.party_id,
                    notes: data.notes,
                    status: 'OPEN',
                    subtotal: subtotal,
                    totalGst: totalDetails.gst,
                    grandTotal: totalDetails.total
                }
            })
            orderError = null
            break
        } catch (e: any) {
            orderError = e
            if (e.code === 'P2002') {
                attempt++
                const nextRef = await getNextSaleOrderRef()
                if (nextRef !== order_number) {
                    order_number = nextRef
                } else {
                    const parts = nextRef.split('-')
                    const num = parseInt(parts[parts.length - 1])
                    if (!isNaN(num)) {
                        order_number = `${parts.slice(0, parts.length - 1).join('-')}-${num + 1}`
                    } else {
                        order_number = `${nextRef}-R${attempt}`
                    }
                }
            } else {
                throw new Error(e.message)
            }
        }
    }

    if (orderError || !order) throw new Error(`Failed to create order after retries: ${orderError?.message}`)

    const items = data.items.map(item => ({
        tenantId: user.tenantId,
        saleOrderId: order.id,
        productId: item.product_id || null,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        gstRate: item.gst_rate,
        taxAmount: item.tax_amount,
        totalAmount: item.total_amount
    }))

    try {
        await prisma.saleOrderItem.createMany({ data: items })
    } catch (e: any) {
        throw new Error(`Failed to save order items: ${e.message}`)
    }

    revalidatePath('/dashboard/invoices/sale-order')
    return order
}

export async function updateSaleOrder(id: string, data: CreateSaleOrderData) {
    const user = await requireAuth()

    const subtotal = data.items.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0)
    const totalDetails = data.items.reduce((acc, item) => ({
        gst: acc.gst + item.tax_amount,
        total: acc.total + item.total_amount
    }), { gst: 0, total: 0 })

    await prisma.saleOrder.update({
        where: { id, tenantId: user.tenantId },
        data: {
            orderNumber: data.order_number,
            date: data.date,
            dueDate: data.due_date,
            partyId: data.party_id,
            notes: data.notes,
            subtotal: subtotal,
            totalGst: totalDetails.gst,
            grandTotal: totalDetails.total
        }
    })

    await prisma.saleOrderItem.deleteMany({
        where: { saleOrderId: id, tenantId: user.tenantId }
    })

    const items = data.items.map(item => ({
        tenantId: user.tenantId,
        saleOrderId: id,
        productId: item.product_id || null,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        gstRate: item.gst_rate,
        taxAmount: item.tax_amount,
        totalAmount: item.total_amount
    }))

    await prisma.saleOrderItem.createMany({ data: items })

    revalidatePath('/dashboard/invoices/sale-order')
    revalidatePath(`/dashboard/invoices/sale-order/${id}`)
}

export async function deleteSaleOrder(id: string) {
    const user = await requireAuth()

    const order = await prisma.saleOrder.findUnique({
        where: { id, tenantId: user.tenantId },
        select: { status: true }
    })
    
    if (order && order.status === 'CONVERTED') {
        throw new Error('Cannot delete a converted Sale Order')
    }

    await prisma.saleOrder.delete({
        where: { id, tenantId: user.tenantId }
    })
    
    revalidatePath('/dashboard/invoices/sale-order')
}

export async function convertOrdersToInvoice(orderIds: string[]) {
    const user = await requireAuth()

    for (const id of orderIds) {
        const order = await prisma.saleOrder.findUnique({
            where: { id, tenantId: user.tenantId },
            include: { saleOrderItems: true, party: true }
        })

        if (!order) continue
        if (order.status === 'CONVERTED') continue

        if (!order.saleOrderItems || order.saleOrderItems.length === 0) {
            throw new Error(`Order ${order.orderNumber} has no items. Please add items or delete the order.`)
        }

        const invNum = `${order.orderNumber}-INV`

        const invoiceData = {
            invoice_number: invNum,
            party_id: order.partyId,
            party_name: order.party?.name || 'Unknown',
            date: new Date(),
            due_date: order.dueDate || undefined,
            status: 'generated',
            payment_status: 'unpaid',
            received_amount: 0,
            items: order.saleOrderItems.map((item: any) => ({
                product_id: item.productId,
                description: item.description,
                unit: 'pcs',
                quantity: item.quantity,
                unit_price: item.unitPrice,
                discount: 0,
                gst_rate: item.gstRate,
                tax_amount: item.taxAmount,
                total_amount: item.totalAmount
            }))
        }

        try {
            await createInvoice(invoiceData)

            await prisma.saleOrder.update({
                where: { id: order.id },
                data: { status: 'CONVERTED' }
            })

        } catch (e: any) {
            console.error(`Failed to convert order ${id}`, e)
            throw new Error(`Failed to convert order ${order.orderNumber}: ${e.message}`)
        }
    }

    revalidatePath('/dashboard/invoices/sale-order')
    revalidatePath('/dashboard/invoices')
}

export async function getNextSaleOrderRef() {
    const user = await requireAuth()
    
    const data = await prisma.saleOrder.findMany({
        where: { tenantId: user.tenantId },
        select: { orderNumber: true }
    })

    if (!data || data.length === 0) return 'ORD-1'

    let maxNum = 0
    let maxPrefix = 'ORD'

    for (const row of data) {
        if (!row.orderNumber) continue

        const parts = row.orderNumber.split('-')
        if (parts.length > 1) {
            const numStr = parts[parts.length - 1]
            const num = parseInt(numStr)
            if (!isNaN(num)) {
                if (num > maxNum) {
                    maxNum = num
                    maxPrefix = parts.slice(0, parts.length - 1).join('-')
                }
            }
        }
    }

    return `${maxPrefix}-${maxNum + 1}`
}
