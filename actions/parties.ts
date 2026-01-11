
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getParties(type?: 'customer' | 'supplier', search = '', _ts?: number) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase.from('users_profile').select('tenant_id').eq('id', user?.id).single()
    if (!profile) return []

    let query = supabase.from('parties')
        .select('*')
        .eq('tenant_id', profile.tenant_id)
        .order('name')

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
        // If Supplier ('to_pay'), make opening balance negative (Credit)
        // If Customer ('to_receive'), make opening balance positive (Debit)
        let bal = Math.abs(dbData.opening_balance)
        if (dbData.type === 'supplier' || balance_type === 'to_pay') {
            bal = -bal
        }
        dbData.current_balance = bal
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


export async function recalculatePartyBalance(partyId: string) {
    const supabase = await createClient()

    // 1. Fetch Party
    const { data: party, error: partyError } = await supabase
        .from('parties')
        .select('*')
        .eq('id', partyId)
        .single()

    if (partyError || !party) throw new Error('Party not found')

    // 2. Fetch Transactions
    const { data: invoices } = await supabase.from('invoices').select('id, date, invoice_number, grand_total').eq('party_id', partyId)
    const { data: purchases } = await supabase.from('purchase_orders').select('id, date, po_number, grand_total').eq('party_id', partyId)
    const { data: payments } = await supabase.from('payments').select('id, created_at, amount, type').eq('party_id', partyId)
    const { data: creditNotes } = await supabase.from('credit_notes').select('id, date, grand_total').eq('party_id', partyId)
    const { data: debitNotes } = await supabase.from('debit_notes').select('id, date, grand_total').eq('party_id', partyId) // Assuming table exists

    const txns = [
        ...(invoices?.map(i => ({
            date: new Date(i.date),
            amount: i.grand_total,
            type: 'invoice',
            ref: i.invoice_number,
            received: 0
        })) || []),
        ...(purchases?.map(p => ({
            date: new Date(p.date),
            amount: p.grand_total,
            type: 'purchase_order',
            ref: p.po_number,
            received: 0
        })) || []),
        ...(payments?.map(p => ({
            date: new Date(p.created_at),
            amount: p.amount,
            type: p.type === 'out' ? 'payment_out' : 'payment_in', // Check type column
            ref: '-',
            received: 0
        })) || []),
        ...(creditNotes?.map(c => ({
            date: new Date(c.date),
            amount: c.grand_total,
            type: 'credit_note',
            ref: '-',
            received: 0
        })) || []),
        ...(debitNotes?.map(d => ({
            date: new Date(d.date),
            amount: d.grand_total,
            type: 'debit_note',
            ref: '-',
            received: 0
        })) || [])
    ].sort((a, b) => a.date.getTime() - b.date.getTime())

    // 3. Calculate Balance
    // Convention: +ve = Receivable (Dr), -ve = Payable (Cr)

    let balance = (party.opening_balance || 0)
    // If opening was "To Pay" (Supplier), it's a Credit balance (-ve)
    // If opening was "To Receive" (Customer), it's a Debit balance (+ve)
    // We use the `type` or `balance_type` field.
    // Assuming 'supplier' implies Cr, 'customer' implies Dr. 
    // Ideally check `balance_type` if available for explicit control.
    if ((party.type === 'supplier') || (party.balance_type === 'to_pay')) {
        // Only flip if opening_balance is stored as absolute unsigned number (which it is usually)
        // If it was already stored signed, we wouldn't need this. Assuming absolute.
        if (balance > 0) balance = -balance
    }

    for (const txn of txns) {
        switch (txn.type) {
            case 'invoice':
                // Sale -> Increases Receivable (Dr +)
                balance += txn.amount
                // Note: Payment is handled as separate 'payment_in' transaction
                break;
            case 'purchase_order':
                // Purchase -> Increases Payable (Cr -)
                balance -= txn.amount
                break;
            case 'payment_in':
                // Receipt -> Reducers Receivable (Dr -)
                balance -= txn.amount
                break;
            case 'payment_out':
                // Payment Made -> Reduces Payable (Cr +) (Less negative)
                balance += txn.amount
                break;
            case 'credit_note':
                // Sales Return -> Reduces Receivable (Dr -)
                balance -= txn.amount
                break;
            case 'debit_note':
                // Purchase Return -> Reduces Payable (Cr +)
                balance += txn.amount
                break;
        }
    }

    // 4. Update
    console.log(`[Recalculate] Party: ${partyId}, New Balance: ${balance}`)
    const { error: updateError } = await supabase.from('parties').update({ current_balance: balance }).eq('id', partyId)

    if (updateError) {
        console.error('Failed to update party balance DB:', updateError)
        throw new Error('Database update failed: ' + updateError.message)
    }

    revalidatePath('/dashboard/parties')
    revalidatePath(`/dashboard/parties/${partyId}`)

    return balance
}

// Bulk Recalculate
export async function recalculateAllParties() {
    const supabase = await createClient()
    const { data: parties } = await supabase.from('parties').select('id')
    if (!parties) return

    for (const p of parties) {
        try {
            await recalculatePartyBalance(p.id)
        } catch (e) {
            console.error(`Failed to recalc party ${p.id}`, e)
        }
    }
    revalidatePath('/dashboard/parties')
}

export async function getPartyLedger(partyId: string) {
    const supabase = await createClient()

    // Fetch different types of transactions
    const { data: invoices } = await supabase.from('invoices').select('*, invoice_number').eq('party_id', partyId).order('date', { ascending: false })
    const { data: purchases } = await supabase.from('purchase_orders').select('*, po_number').eq('party_id', partyId).order('date', { ascending: false })
    const { data: payments } = await supabase.from('payments').select('*').eq('party_id', partyId).order('created_at', { ascending: false })
    const { data: creditNotes } = await supabase.from('credit_notes').select('*, cn_number').eq('party_id', partyId).order('date', { ascending: false })
    const { data: debitNotes } = await supabase.from('debit_notes').select('*, dn_number').eq('party_id', partyId).order('date', { ascending: false })

    // Combine and sort
    const ledger = [
        ...(invoices?.map(i => ({ ...i, type: 'invoice', amount: i.grand_total, ref: i.invoice_number })) || []),
        ...(purchases?.map(p => ({ ...p, type: 'purchase_order', amount: p.grand_total, ref: p.po_number, date: p.date })) || []),
        ...(payments?.map(p => ({ ...p, type: p.type === 'out' ? 'payment_out' : 'payment_in', date: p.created_at, ref: p.transaction_ref })) || []),
        ...(creditNotes?.map(cn => ({ ...cn, type: 'credit_note', amount: cn.grand_total, ref: cn.cn_number })) || []),
        ...(debitNotes?.map(dn => ({ ...dn, type: 'debit_note', amount: dn.grand_total, ref: dn.dn_number })) || [])
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

export async function importPartiesBulk(parties: any[]) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data: profile } = await supabase.from('users_profile').select('tenant_id').eq('id', user.id).single()
    if (!profile) throw new Error('Profile not found')

    // 1. Fetch existing parties for name matching
    const { data: existingParties } = await supabase
        .from('parties')
        .select('id, name')
        .eq('tenant_id', profile.tenant_id)

    // Create normalized map (lowercase trimmed name -> id)
    const nameToIdMap = new Map<string, string>()
    existingParties?.forEach(p => {
        if (p.name) nameToIdMap.set(p.name.trim().toLowerCase(), p.id)
    })

    const partiesToInsert = parties.map(p => {
        let current_balance = p.current_balance
        if (current_balance === undefined) {
            let bal = Math.abs(p.opening_balance || 0)
            if (p.type === 'supplier') {
                bal = -bal
            }
            current_balance = bal
        }

        const dbRow = {
            ...p,
            tenant_id: profile.tenant_id,
            credit_limit: p.credit_limit || 0,
            opening_balance: p.opening_balance || 0,
            current_balance: current_balance
        }

        // Smart Match Logic
        // If ID is missing/empty, try to find by Name
        if (!dbRow.id) {
            const normalizedName = dbRow.name?.trim().toLowerCase()
            const existingId = nameToIdMap.get(normalizedName)
            if (existingId) {
                dbRow.id = existingId // Match found: Update
            } else {
                delete dbRow.id // No match: Insert (Auto UUID)
            }
        }

        return dbRow
    })

    const { data: insertedData, error } = await supabase.from('parties').upsert(partiesToInsert, { onConflict: 'id' }).select('id')

    if (error) {
        console.error('Bulk Import Error:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/parties')
    return { success: true, count: insertedData?.length || parties.length }
}
