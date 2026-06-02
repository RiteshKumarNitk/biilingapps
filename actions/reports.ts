'use server'

import { requireAuth } from '@/lib/auth-server'
import prisma from '@/lib/prisma'

export async function getSalesReport(startDate?: string, endDate?: string) {
    const user = await requireAuth()

    const where: any = { tenantId: user.tenantId, status: { not: 'CANCELLED' } }
    if (startDate) {
        where.date = { ...where.date, gte: new Date(startDate) }
    }
    if (endDate) {
        where.date = { ...where.date, lte: new Date(endDate) }
    }

    const data = await prisma.invoice.findMany({
        where,
        orderBy: { date: 'desc' }
    })
    
    return data
}

export async function getPurchaseReport(startDate?: string, endDate?: string) {
    const user = await requireAuth()

    const where: any = { tenantId: user.tenantId }
    if (startDate) {
        where.date = { ...where.date, gte: new Date(startDate) }
    }
    if (endDate) {
        where.date = { ...where.date, lte: new Date(endDate) }
    }

    const data = await prisma.purchaseOrder.findMany({
        where,
        orderBy: { date: 'desc' }
    })

    return data
}

export async function getStockReport() {
    const user = await requireAuth()

    const data = await prisma.product.findMany({
        where: { tenantId: user.tenantId },
        orderBy: { name: 'asc' }
    })

    return data
}

export async function getPartyReport() {
    const user = await requireAuth()

    const data = await prisma.party.findMany({
        where: { tenantId: user.tenantId },
        orderBy: { name: 'asc' }
    })

    return data
}

export async function getGSTReport(startDate?: string, endDate?: string) {
    const user = await requireAuth()

    const salesWhere: any = { tenantId: user.tenantId }
    if (startDate) {
        salesWhere.invoice = { ...salesWhere.invoice, date: { ...salesWhere.invoice?.date, gte: new Date(startDate) } }
    }
    if (endDate) {
        salesWhere.invoice = { ...salesWhere.invoice, date: { ...salesWhere.invoice?.date, lte: new Date(endDate) } }
    }

    const sales = await prisma.invoiceItem.findMany({
        where: salesWhere,
        include: {
            invoice: {
                select: {
                    invoiceNumber: true,
                    date: true,
                    partyName: true,
                    totalGst: true,
                    grandTotal: true
                }
            }
        }
    })

    return {
        sales: sales || [],
        purchases: [] // Purchase GST not fully tracked at item level yet
    }
}
