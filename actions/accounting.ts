
'use server'

import { createClient } from '@/utils/supabase/server'
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
    const supabase = await createClient()
    const validated = expenseSchema.parse(data)

    // Get tenant_id for manual insertion if needed, though RLS/Triggers usually handle it.
    // Ideally we should trust the trigger, but let's just insert the data we have.
    // We map 'description' to 'notes' and include paymentMode in notes.

    const { error } = await supabase.from('expenses').insert({
        category: validated.category,
        amount: validated.amount,
        date: validated.date,
        notes: `[${validated.paymentMode}] ${validated.description || ''}`,
        // tenant_id: tenantData // Trigger should handle this
    })

    if (error) {
        console.error('Expense Create Error:', error)
        throw new Error('Failed to create expense')
    }

    revalidatePath('/dashboard/accounting')
}

export async function getExpenses() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false })

    if (error) throw new Error(error.message)
    return data
}

export async function getCashbook() {
    const supabase = await createClient()

    // Combine Payments (In/Out) and Expenses (Out)
    // This is a simplified ledger view.

    const { data: payments } = await supabase.from('payments').select('*')
    const { data: expenses } = await supabase.from('expenses').select('*')

    const cashbook = [
        ...(payments || []).map((p: any) => ({
            id: p.id,
            date: p.date,
            description: `Payment ${p.type === 'in' ? 'Received' : 'Made'} - ${p.notes || ''}`,
            type: p.type === 'in' ? 'credit' : 'debit',
            amount: p.amount
        })),
        ...(expenses || []).map((e: any) => ({
            id: e.id,
            date: e.date,
            description: `Expense: ${e.category} - ${e.notes || ''}`,
            type: 'debit',
            amount: e.amount
        }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return cashbook
}
