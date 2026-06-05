'use server'

import { requireAuth } from '@/lib/auth-server'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getQuotations(
    type: 'estimate' | 'proforma' = 'estimate',
    page: number = 1,
    limit: number = 100,
    filters?: {
        search?: string
        startDate?: Date
        endDate?: Date
    }
) {
    const user = await requireAuth()

    const where: any = { type: type.toUpperCase(), tenantId: user.tenantId }
    
    if (filters?.search) {
        where.partyName = { contains: filters.search, mode: 'insensitive' }
    }
    if (filters?.startDate) {
        where.date = { ...where.date, gte: filters.startDate }
    }
    if (filters?.endDate) {
        where.date = { ...where.date, lte: filters.endDate }
    }

    const start = (page - 1) * limit

    const [data, count, allStats] = await Promise.all([
        prisma.quotation.findMany({
            where,
            orderBy: { date: 'desc' },
            skip: start,
            take: limit
        }),
        prisma.quotation.count({ where }),
        prisma.quotation.findMany({
            where,
            select: { grandTotal: true, status: true }
        })
    ])

    const summary = {
        total: 0,
        converted: 0,
        open: 0
    }

    allStats.forEach(q => {
        const amount = q.grandTotal || 0
        summary.total += amount
        if (q.status === 'CONVERTED') {
            summary.converted += amount
        } else if (q.status === 'SENT' || q.status === 'DRAFT') {
            summary.open += amount
        }
    })

    return { data, count, summary }
}

export async function getQuotation(id: string) {
    const user = await requireAuth()

    const quotation = await prisma.quotation.findUnique({
        where: { id, tenantId: user.tenantId }
    })

    if (!quotation) throw new Error('Quotation not found')

    const items = await prisma.quotationItem.findMany({
        where: { quotationId: id, tenantId: user.tenantId },
        include: { product: { select: { name: true, hsnCode: true } } }
    })

    const tenant = await prisma.tenant.findUnique({
        where: { id: user.tenantId }
    })

    return { quotation, items, tenant }
}

export async function createQuotation(data: any) {
    const user = await requireAuth()

    const quotation = await prisma.quotation.create({
        data: {
            tenantId: user.tenantId,
            quotationNumber: data.quotation_number,
            date: new Date(data.date),
            validUntil: data.valid_until ? new Date(data.valid_until) : null,
            partyId: data.party_id,
            partyName: data.party_name,
            partyAddress: data.party_address,
            shippingAddress: data.shipping_address,
            partyPhone: data.party_phone,
            partyEmail: data.party_email,
            subtotal: data.subtotal,
            totalGst: data.total_gst,
            discountAmount: data.discount_amount,
            grandTotal: data.grand_total,
            notes: data.notes,
            status: 'SENT',
            type: (data.type || 'estimate').toUpperCase()
        }
    })

    if (data.items && data.items.length > 0) {
        const itemsToInsert = data.items.map((item: any) => ({
            tenantId: user.tenantId,
            quotationId: quotation.id,
            productId: item.product_id,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unit_price,
            gstRate: item.gst_rate,
            discount: item.discount,
            taxAmount: item.tax_amount || ((item.quantity * item.unit_price) - (item.discount || 0)) * ((item.gst_rate || 0) / 100),
            totalAmount: item.total_amount
        }))

        await prisma.quotationItem.createMany({ data: itemsToInsert })
    }

    revalidatePath('/dashboard/quotations')
    return quotation
}

export async function convertQuotationToInvoice(quotationId: string) {
    const user = await requireAuth()

    const q = await prisma.quotation.findUnique({
        where: { id: quotationId, tenantId: user.tenantId },
        include: { quotationItems: true }
    })

    if (!q) throw new Error('Quotation not found')

    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`

    const inv = await prisma.invoice.create({
        data: {
            tenantId: user.tenantId,
            invoiceNumber,
            date: new Date(),
            partyId: q.partyId,
            partyName: q.partyName,
            subtotal: q.subtotal,
            totalGst: q.totalGst,
            discountAmount: q.discountAmount,
            grandTotal: q.grandTotal,
            status: 'GENERATED',
            notes: `Converted from Quotation ${q.quotationNumber}`
        }
    })

    const items = q.quotationItems.map((item: any) => ({
        tenantId: user.tenantId,
        invoiceId: inv.id,
        productId: item.productId,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        gstRate: item.gstRate,
        taxAmount: item.taxAmount,
        totalAmount: item.totalAmount
    }))

    await prisma.invoiceItem.createMany({ data: items })

    await prisma.quotation.update({
        where: { id: quotationId },
        data: { status: 'CONVERTED' }
    })

    const movements = q.quotationItems.map((item: any) => ({
        tenantId: user.tenantId,
        productId: item.productId,
        type: 'INVOICE_SENT' as any,
        quantity: -item.quantity,
        referenceId: inv.id,
        notes: `Invoice ${invoiceNumber} (Converted from Quote)`
    }))

    await prisma.stockMovement.createMany({ data: movements })

    revalidatePath('/dashboard/invoices')
    revalidatePath('/dashboard/quotations')
    return inv
}

export async function getLastQuotationNumber(type: 'estimate' | 'proforma' = 'estimate') {
    const user = await requireAuth()
    const prefix = type === 'estimate' ? 'EST' : 'PRO'

    const lastQ = await prisma.quotation.findFirst({
        where: { 
            tenantId: user.tenantId,
            type: type.toUpperCase() as any,
            quotationNumber: { startsWith: prefix }
        },
        orderBy: { createdAt: 'desc' },
        select: { quotationNumber: true }
    })

    if (!lastQ || !lastQ.quotationNumber) {
        return `${prefix}-1`
    }

    const parts = lastQ.quotationNumber.split('-')
    const lastNum = parseInt(parts[parts.length - 1], 10)

    if (!isNaN(lastNum)) {
        return `${prefix}-${lastNum + 1}`
    }

    return `${prefix}-${Date.now().toString().slice(-4)}`
}
