'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

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
    const supabase = await createClient()

    let query = supabase
        .from('payments')
        .select(`
            id,
            created_at,
            amount,
            mode,
            transaction_ref,
            notes,
            party_id,
            invoices (
                invoice_number
            ),
            parties (
                name
            )
        `)
        .order('created_at', { ascending: false })

    // Apply filters
    if (filter.start) {
        query = query.gte('created_at', filter.start.toISOString())
    }
    if (filter.end) {
        // Set end date to end of day
        const endDate = new Date(filter.end)
        endDate.setHours(23, 59, 59, 999)
        query = query.lte('created_at', endDate.toISOString())
    }

    // Note: Search would require joining party name which is harder in Supabase simple query relying on foreign table filter
    // For now we will filter in memory or minimal search on transaction_ref
    if (filter.search) {
        // Try to search transaction ref or notes
        query = query.ilike('transaction_ref', `%${filter.search}%`)
    }

    const { data: rawData, error } = await query

    if (error) {
        console.error('Error fetching payments:', error)
        return { payments: [], summary: { total: 0, count: 0 } }
    }

    // Process data to map to PaymentIn type and handle Party search manually if needed
    // The query returns parties(name), we need to flatten it
    let payments = rawData.map((item: any) => ({
        id: item.id,
        // We prefer 'date' column if it existed, but fallback to created_at
        date: item.created_at,
        payment_number: item.transaction_ref || '-', // Fallback for Ref No
        party_id: item.party_id,
        party_name: item.parties?.name || 'Unknown Party',
        amount: item.amount,
        mode: item.mode,
        transaction_ref: item.transaction_ref,
        notes: item.notes
    }))

    // If search was intended for Party Name, we filter here since Supabase generic search is limited
    if (filter.search) {
        const searchLower = filter.search.toLowerCase()
        payments = payments.filter((p: any) =>
            p.party_name.toLowerCase().includes(searchLower) ||
            (p.payment_number && p.payment_number.toLowerCase().includes(searchLower))
        )
    }

    // Calculate summary
    const total = payments.reduce((sum: number, p: any) => sum + Number(p.amount), 0)

    return {
        payments,
        summary: {
            total,
            count: payments.length
        }
    }
}

export async function createPaymentIn(data: {
    party_id: string
    amount: number
    date: Date
    mode: string
    payment_number?: string // Ref No
    transaction_ref?: string
    notes?: string
    image_url?: string
}) {
    const supabase = await createClient()

    // 1. Get current party balance
    const { data: party, error: partyError } = await supabase
        .from('parties')
        .select('current_balance, type')
        .eq('id', data.party_id)
        .single()

    if (partyError || !party) {
        throw new Error('Party not found')
    }

    // 2. Insert Payment
    // We maintain 'amount' as numeric. 
    // Payment-In implies receiving money.
    const { error: insertError } = await supabase
        .from('payments')
        .insert({
            party_id: data.party_id,
            amount: data.amount,
            mode: data.mode,
            transaction_ref: data.payment_number, // Storing Ref No in transaction_ref for now as mapped
            created_at: data.date.toISOString(), // Storing Selected Date in created_at for sorting
            notes: data.notes
        })

    if (insertError) {
        console.error('Error creating payment:', insertError)
        throw new Error('Failed to create payment')
    }

    // 3. Update Party Balance
    try {
        const { recalculatePartyBalance } = await import('@/actions/parties')
        await recalculatePartyBalance(data.party_id)
    } catch (e) {
        console.error("Failed to sync party balance (payment):", e)
    }

    revalidatePath('/dashboard/invoices/payment-in')
    revalidatePath(`/dashboard/parties/${data.party_id}`)
    return { success: true }
}

export async function deletePaymentIn(id: string) {
    const supabase = await createClient()

    // 1. Get Payment details before delete to revert balance
    const { data: payment, error: fetchError } = await supabase
        .from('payments')
        .select('party_id, amount')
        .eq('id', id)
        .single()

    if (fetchError || !payment) {
        throw new Error('Payment not found')
    }

    // 2. Delete Payment
    const { error: deleteError } = await supabase
        .from('payments')
        .delete()
        .eq('id', id)

    if (deleteError) {
        throw new Error('Failed to delete payment')
    }

    // 3. Revert Party Balance
    if (payment.party_id) {
        try {
            const { recalculatePartyBalance } = await import('@/actions/parties')
            await recalculatePartyBalance(payment.party_id)
        } catch (e) {
            console.error("Failed to sync party balance (delete payment):", e)
        }
    }

    revalidatePath('/dashboard/invoices/payment-in')
}

export async function getNextPaymentRef() {
    // Generate a simple auto-increment looking Ref No based on count + 1 or random
    // Real implementation should check DB max
    const supabase = await createClient()
    const { count } = await supabase.from('payments').select('*', { count: 'exact', head: true })
    return `PAY-${(count || 0) + 1}`
}
