'use server'

import { requireAuth } from '@/lib/auth-server'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const expenseSchema = z.object({
    category: z.string().min(1, 'Category is required'),
    description: z.string().optional(),
    amount: z.coerce.number().min(1, 'Amount must be positive'),
    date: z.string(),
    paymentMode: z.string()
})

export async function createExpense(data: any) {
    const user = await requireAuth()
    const validated = expenseSchema.parse(data)

    await prisma.expense.create({
        data: {
            tenantId: user.tenantId,
            category: validated.category,
            amount: validated.amount,
            date: new Date(validated.date),
            notes: `[${validated.paymentMode}] ${validated.description || ''}`,
        }
    })

    revalidatePath('/dashboard/accounting')
}

export async function getExpenses() {
    const user = await requireAuth()
    const data = await prisma.expense.findMany({
        where: { tenantId: user.tenantId },
        orderBy: { date: 'desc' }
    })

    return data
}

export async function getCashbook() {
    const user = await requireAuth()

    const payments = await prisma.payment.findMany({
        where: { tenantId: user.tenantId }
    })
    
    const expenses = await prisma.expense.findMany({
        where: { tenantId: user.tenantId }
    })

    const cashbook = [
        ...payments.map((p: any) => ({
            id: p.id,
            date: p.createdAt, // Assumed payments use createdAt
            description: `Payment Received/Made - ${p.notes || ''}`,
            type: p.amount > 0 ? 'credit' : 'debit',
            amount: Math.abs(p.amount)
        })),
        ...expenses.map((e: any) => ({
            id: e.id,
            date: e.date,
            description: `Expense: ${e.category} - ${e.notes || ''}`,
            type: 'debit',
            amount: e.amount
        }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return cashbook
}
