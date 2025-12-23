
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getParties(type?: 'customer' | 'supplier', search = '') {
    const supabase = await createClient()
    let query = supabase.from('parties').select('*').order('name')

    if (type) query = query.eq('type', type)
    if (search) query = query.ilike('name', `%${search}%`)

    const { data, error } = await query
    if (error) throw new Error(error.message)
    return data
}

export async function createParty(data: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data: profile } = await supabase.from('users_profile').select('tenant_id').eq('id', user.id).single()

    if (!profile) throw new Error('Profile not found')

    // Clean up UI-specific fields not in DB
    const { is_shipping_same, is_custom_credit_limit, balance_type, ...dbData } = data

    // Ensure numeric fields are proper numbers or 0
    if (dbData.credit_limit === undefined || dbData.credit_limit === null || isNaN(dbData.credit_limit)) {
        dbData.credit_limit = 0
    }
    if (dbData.opening_balance === undefined || dbData.opening_balance === null || isNaN(dbData.opening_balance)) {
        dbData.opening_balance = 0
    }

    // Derive type (customer/supplier) from balance_type if not present
    // 'to_receive' -> We derive as Customer
    // 'to_pay' -> We derive as Supplier
    if (!dbData.type) {
        dbData.type = balance_type === 'to_pay' ? 'supplier' : 'customer'
    }

    // Initialize current_balance
    if (dbData.current_balance === undefined) {
        dbData.current_balance = dbData.opening_balance
    }

    const { error } = await supabase.from('parties').insert({
        ...dbData,
        tenant_id: profile.tenant_id
    })

    if (error) {
        console.error('Party Create Error:', error)
        throw new Error(error.message)
    }
    revalidatePath('/dashboard/parties')
}

export async function getPartyLedger(partyId: string) {
    const supabase = await createClient()

    // Fetch different types of transactions
    const { data: invoices } = await supabase.from('invoices').select('*').eq('party_id', partyId).order('date', { ascending: false })
    const { data: payments } = await supabase.from('payments').select('*').eq('party_id', partyId).order('created_at', { ascending: false })
    const { data: creditNotes } = await supabase.from('credit_notes').select('*').eq('party_id', partyId).order('date', { ascending: false })

    // Combine and sort
    const ledger = [
        ...(invoices?.map(i => ({ ...i, type: 'invoice', amount: i.grand_total })) || []),
        ...(payments?.map(p => ({ ...p, type: 'payment', date: p.created_at })) || []),
        ...(creditNotes?.map(cn => ({ ...cn, type: 'credit_note', amount: cn.grand_total })) || [])
    ].sort((a, b) => new Date(b.date || b.created_at).getTime() - new Date(a.date || a.created_at).getTime())

    return ledger
}

export async function getParty(id: string) {
    const supabase = await createClient()
    const { data, error } = await supabase.from('parties').select('*').eq('id', id).single()
    if (error) throw new Error(error.message)
    return data
}

export async function updateParty(id: string, data: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // 1. Fetch current party data to calculate balance diff
    const { data: currentParty, error: fetchError } = await supabase.from('parties').select('opening_balance, current_balance').eq('id', id).single()

    if (fetchError) {
        throw new Error('Failed to fetch existing party data')
    }

    // Clean up UI-specific fields not in DB
    const { is_shipping_same, is_custom_credit_limit, balance_type, ...dbData } = data

    // Ensure numeric fields
    if (dbData.credit_limit !== undefined && (dbData.credit_limit === null || isNaN(dbData.credit_limit))) {
        dbData.credit_limit = 0
    }

    // Handle Opening Balance
    if (dbData.opening_balance !== undefined) {
        // Recalculate current_balance logic:
        // New Current Balance = Old Current Balance - Old Opening Balance + New Opening Balance
        // This assumes current_balance = opening_balance + transactions
        const oldOpening = currentParty.opening_balance || 0
        const oldCurrent = currentParty.current_balance || 0
        const newOpening = dbData.opening_balance || 0

        const diff = newOpening - oldOpening
        dbData.current_balance = oldCurrent + diff
    }

    // Update type if balance_type is provided (though usually type shouldn't change, but if user wants to swap...)
    if (balance_type) {
        dbData.type = balance_type === 'to_pay' ? 'supplier' : 'customer'
    }

    // Explicitly exclude fields that shouldn't change
    delete dbData.id
    delete dbData.created_at
    delete dbData.tenant_id

    const { error } = await supabase.from('parties').update(dbData).eq('id', id)

    if (error) {
        console.error('Party Update Error:', error)
        throw new Error(error.message)
    }
    revalidatePath('/dashboard/parties')
    revalidatePath(`/dashboard/parties/${id}`)
}

export async function deleteParty(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('parties').delete().eq('id', id)

    if (error) {
        console.error('Party Delete Error:', error)
        throw new Error(error.message)
    }
    revalidatePath('/dashboard/parties')
}
