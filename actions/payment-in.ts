'use server'

import { requireAuth } from '@/lib/auth-server'
import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import PartyService from '@/lib/services/party.service'
import { paymentInSchema } from '@/lib/schemas/payment'

export type PaymentIn = {
    id: string
    date: string
    payment_number: string | null
    party_id: string
    party_name: string
    amount: number
    mode: 'cash' | 'upi' | 'bank_transfer' | 'cheque' | 'online'
    transaction_ref: string | null
    created_at: string
}

export type PaymentFilter = {
    start: Date | null
    end: Date | null
    search?: string
}

export async function getPayments(filter: PaymentFilter) {
    const user = await requireAuth()

    const where: any = { tenantId: user.tenantId }
    
    if (filter.start) {
        where.createdAt = { ...where.createdAt, gte: filter.start }
    }
    if (filter.end) {
        const endDate = new Date(filter.end)
        endDate.setHours(23, 59, 59, 999)
        where.createdAt = { ...where.createdAt, lte: endDate }
    }
    
    if (filter.search) {
        const search = filter.search
        where.OR = [
            { transactionRef: { contains: search, mode: 'insensitive' } },
            { party: { name: { contains: search, mode: 'insensitive' } } }
        ]
    }

    const rawData = await prisma.payment.findMany({
        where,
        include: { party: { select: { name: true } }, invoice: { select: { invoiceNumber: true } } },
        orderBy: { createdAt: 'desc' }
    })

    const payments = rawData.map((item: any) => ({
        id: item.id,
        date: item.createdAt.toISOString(),
        payment_number: item.transactionRef || '-',
        party_id: item.partyId,
        party_name: item.party?.name || 'Unknown Party',
        amount: Number(item.amount),
        mode: item.mode,
        transaction_ref: item.transactionRef,
        notes: item.notes
    }))

    const total = payments.reduce((sum: number, p: any) => sum + p.amount, 0)

    return {
        payments,
        summary: {
            total,
            count: payments.length
        }
    }
}

export async function createPaymentIn(data: unknown) {
    const user = await requireAuth()
    const parsed = paymentInSchema.parse(data)

    const party = await prisma.party.findUnique({
        where: { id: parsed.party_id, tenantId: user.tenantId }
    })

    if (!party) {
        throw new Error('Party not found')
    }

    await prisma.payment.create({
        data: {
            tenantId: user.tenantId,
            partyId: parsed.party_id,
            amount: parsed.amount,
            mode: parsed.mode.toUpperCase() as Prisma.PaymentUncheckedCreateInput['mode'],
            transactionRef: parsed.payment_number || parsed.transaction_ref,
            createdAt: parsed.date,
            notes: parsed.notes
        }
    })

    try {
        await PartyService.recalculatePartyBalance(parsed.party_id, user.tenantId)
    } catch (e) {
        console.error("Failed to sync party balance (payment):", e)
    }

    revalidatePath('/dashboard/invoices/payment-in')
    revalidatePath(`/dashboard/parties/${parsed.party_id}`)
    return { success: true }
}

export async function deletePaymentIn(id: string) {
    const user = await requireAuth()

    const payment = await prisma.payment.findUnique({
        where: { id, tenantId: user.tenantId },
        select: { partyId: true }
    })

    if (!payment) {
        throw new Error('Payment not found')
    }

    await prisma.payment.delete({
        where: { id, tenantId: user.tenantId }
    })

    if (payment.partyId) {
        try {
            await PartyService.recalculatePartyBalance(payment.partyId, user.tenantId)
        } catch (e) {
            console.error("Failed to sync party balance (delete payment):", e)
        }
    }

    revalidatePath('/dashboard/invoices/payment-in')
}

export async function getNextPaymentRef() {
    const user = await requireAuth()
    const count = await prisma.payment.count({
        where: { tenantId: user.tenantId }
    })
    return `PAY-${count + 1}`
}
