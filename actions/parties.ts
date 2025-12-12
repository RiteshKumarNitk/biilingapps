
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

    const { error } = await supabase.from('parties').insert({
        ...data,
        tenant_id: profile.tenant_id
    })

    if (error) throw new Error(error.message)
    revalidatePath('/dashboard/parties')
}

export async function getPartyLedger(partyId: string) {
    const supabase = await createClient()
    // Fetch invoices and payments mixed?
    // Or just simple invoices list for now.
    const { data: invoices } = await supabase.from('invoices').select('*').eq('party_id', partyId).order('date', { ascending: false })
    const { data: payments } = await supabase.from('payments').select('*').eq('party_id', partyId).order('created_at', { ascending: false })

    // Combine and sort
    const ledger = [
        ...(invoices?.map(i => ({ ...i, type: 'invoice', amount: i.grand_total })) || []),
        ...(payments?.map(p => ({ ...p, type: 'payment', date: p.created_at })) || [])
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return ledger
}
