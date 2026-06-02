'use server'

import { requireAuth } from '@/lib/auth-server'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import PartyService from '@/lib/services/party.service'

export async function createPurchaseBill(data: any) {
    const user = await requireAuth()

    const po = await prisma.purchaseOrder.create({
        data: {
            tenantId: user.tenantId,
            poNumber: data.bill_number,
            partyId: data.party_id,
            date: new Date(data.date),
            status: 'RECEIVED',
            grandTotal: data.grand_total,
            notes: data.notes
        }
    })

    const items = data.items.map((item: any) => ({
        tenantId: user.tenantId,
        poId: po.id,
        productId: item.product_id,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unit_price,
        gstRate: item.gst_rate || 0,
        taxAmount: item.tax_amount || 0,
        discount: item.discount || 0,
        totalAmount: item.total_amount,
        hsnCode: item.hsn_code
    }))

    await prisma.poItem.createMany({
        data: items
    })

    for (const item of items) {
        if (item.productId) {
            await prisma.stockMovement.create({
                data: {
                    tenantId: user.tenantId,
                    productId: item.productId,
                    type: 'PURCHASE',
                    quantity: item.quantity,
                    referenceId: po.id,
                    notes: 'Purchase Bill ' + data.bill_number
                }
            })

            const currentProd = await prisma.product.findUnique({
                where: { id: item.productId, tenantId: user.tenantId },
                select: { stockQuantity: true }
            })

            if (currentProd) {
                await prisma.product.update({
                    where: { id: item.productId, tenantId: user.tenantId },
                    data: { stockQuantity: (currentProd.stockQuantity || 0) + item.quantity }
                })
            }
        }
    }

    if (data.party_id) {
        try {
            await PartyService.recalculatePartyBalance(data.party_id, user.tenantId)
        } catch (e) {
            console.error("Failed to sync party balance (purchase):", e)
        }
    }

    revalidatePath('/dashboard/purchase/bills')
    return po
}

export async function getPurchaseStats(filters?: { search?: string; startDate?: Date; endDate?: Date; status?: string }) {
    const user = await requireAuth()
    
    const where: any = { tenantId: user.tenantId }
    if (filters?.startDate) {
        where.date = { ...where.date, gte: filters.startDate }
    }
    if (filters?.endDate) {
        where.date = { ...where.date, lte: filters.endDate }
    }
    if (filters?.status) {
        where.status = filters.status.toUpperCase()
    }
    if (filters?.search) {
        where.party = { name: { contains: filters.search, mode: 'insensitive' } }
    }

    const data = await prisma.purchaseOrder.findMany({
        where,
        select: { grandTotal: true, status: true }
    })

    const total = data.reduce((sum, bill) => sum + (bill.grandTotal || 0), 0)

    return { total, count: data.length }
}

export async function getPurchaseBills(page = 1, pageSize = 10, filters?: { search?: string; startDate?: Date; endDate?: Date }) {
    const user = await requireAuth()
    
    const start = (page - 1) * pageSize
    const where: any = { tenantId: user.tenantId }
    
    if (filters?.startDate) {
        where.date = { ...where.date, gte: filters.startDate }
    }
    if (filters?.endDate) {
        where.date = { ...where.date, lte: filters.endDate }
    }
    if (filters?.search) {
        where.party = { name: { contains: filters.search, mode: 'insensitive' } }
    }

    const [data, total] = await Promise.all([
        prisma.purchaseOrder.findMany({
            where,
            include: { party: { select: { name: true } } },
            orderBy: { date: 'desc' },
            skip: start,
            take: pageSize
        }),
        prisma.purchaseOrder.count({ where })
    ])

    return { data, total }
}

export async function deletePurchaseBill(id: string) {
    const user = await requireAuth()

    const po = await prisma.purchaseOrder.findUnique({
        where: { id, tenantId: user.tenantId },
        include: { poItems: true }
    })

    if (!po) throw new Error('Purchase Bill not found')

    if (po.poItems && po.poItems.length > 0) {
        for (const item of po.poItems) {
            if (item.productId) {
                const prod = await prisma.product.findUnique({
                    where: { id: item.productId, tenantId: user.tenantId },
                    select: { stockQuantity: true }
                })

                if (prod) {
                    await prisma.product.update({
                        where: { id: item.productId, tenantId: user.tenantId },
                        data: { stockQuantity: Math.max(0, (prod.stockQuantity || 0) - item.quantity) }
                    })

                    await prisma.stockMovement.create({
                        data: {
                            tenantId: po.tenantId,
                            productId: item.productId,
                            type: 'ADJUSTMENT',
                            quantity: -item.quantity,
                            referenceId: id,
                            notes: `Purchase Bill ${po.poNumber} Deleted`
                        }
                    })
                }
            }
        }
    }

    await prisma.purchaseOrder.delete({
        where: { id, tenantId: user.tenantId }
    })

    if (po.partyId) {
        try {
            await PartyService.recalculatePartyBalance(po.partyId, user.tenantId)
        } catch (e) {
            console.error("Failed to sync balance after delete:", e)
        }
    }

    revalidatePath('/dashboard/purchase/bills')
    revalidatePath('/dashboard/parties')
    return { success: true }
}

export async function getLastPurchaseBillNumber() {
    const user = await requireAuth()

    const lastPO = await prisma.purchaseOrder.findFirst({
        where: { tenantId: user.tenantId },
        orderBy: { createdAt: 'desc' },
        select: { poNumber: true }
    })

    if (lastPO && lastPO.poNumber) {
        const parts = lastPO.poNumber.split('-')
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
    const user = await requireAuth()

    const bill = await prisma.purchaseOrder.findUnique({
        where: { id, tenantId: user.tenantId },
        include: { party: true }
    })

    if (!bill) throw new Error('Purchase Bill not found')

    const items = await prisma.poItem.findMany({
        where: { poId: id, tenantId: user.tenantId },
        include: { product: { select: { name: true, hsnCode: true } } }
    })

    const tenant = await prisma.tenant.findUnique({
        where: { id: bill.tenantId }
    })

    return { bill, items, tenant }
}
