'use server'

import { requireAuth } from '@/lib/auth-server'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { quotationSchema } from '@/lib/schemas/quotation'
import InvoiceService from '@/lib/services/invoice.service'

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

    allStats.forEach((q: any) => {
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

export async function createQuotation(data: unknown) {
    const user = await requireAuth()
    const parsed = quotationSchema.parse(data)

    const quotation = await prisma.quotation.create({
        data: {
            tenantId: user.tenantId,
            quotationNumber: parsed.quotation_number,
            date: parsed.date,
            validUntil: parsed.valid_until || null,
            partyId: parsed.party_id,
            partyName: parsed.party_name,
            partyAddress: parsed.party_address,
            shippingAddress: parsed.shipping_address,
            partyPhone: parsed.party_phone,
            partyEmail: parsed.party_email,
            subtotal: parsed.subtotal,
            totalGst: parsed.total_gst,
            discountAmount: parsed.discount_amount,
            grandTotal: parsed.grand_total,
            notes: parsed.notes,
            status: 'SENT',
            type: parsed.type.toUpperCase() as 'ESTIMATE' | 'PROFORMA'
        }
    })

    const itemsToInsert = parsed.items.map((item) => ({
        tenantId: user.tenantId,
        quotationId: quotation.id,
        productId: item.product_id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        gstRate: item.gst_rate,
        discount: item.discount,
        taxAmount: item.tax_amount ?? ((item.quantity * item.unit_price) - (item.discount || 0)) * ((item.gst_rate || 0) / 100),
        totalAmount: item.total_amount
    }))

    await prisma.quotationItem.createMany({ data: itemsToInsert })

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
    if (q.quotationItems.length === 0) throw new Error('Quotation has no items')

    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`

    // Delegate to InvoiceService so stock decrement, party balance update and
    // status/enum handling stay identical to the normal invoice creation path
    // instead of a second, drifting implementation.
    const inv = await InvoiceService.createInvoice({
        invoice_number: invoiceNumber,
        date: new Date(),
        party_id: q.partyId || undefined,
        party_name: q.partyName || 'Unknown',
        items: q.quotationItems.map((item) => ({
            product_id: item.productId || undefined,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            discount: item.discount || 0,
            gst_rate: item.gstRate,
            tax_amount: item.taxAmount,
            total_amount: item.totalAmount
        })),
        status: 'generated',
        payment_status: 'unpaid',
        received_amount: 0,
        notes: `Converted from Quotation ${q.quotationNumber}`
    }, user.tenantId)

    await prisma.quotation.update({
        where: { id: quotationId, tenantId: user.tenantId },
        data: { status: 'CONVERTED' }
    })

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
