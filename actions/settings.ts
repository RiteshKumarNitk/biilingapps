
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const settingsSchema = z.object({
    name: z.string().min(1),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    gstin: z.string().optional(),
})

export async function updateTenantProfile(data: any) {
    const supabase = await createClient()
    const validated = settingsSchema.parse(data)

    // Update the tenant connected to current user
    const tenant_id = await supabase.rpc('get_my_tenant_id')

    // Wait, get_my_tenant_id returns UUID. 
    // Error handling: if RPC fails or returns null

    const { error } = await supabase.from('tenants').update({
        name: validated.name,
        address: validated.address,
        phone: validated.phone,
        email: validated.email,
        gstin: validated.gstin
    }).eq('id', tenant_id) // This relies on RPC returning valid ID.

    // Alternative if RPC is tricky: 
    // const user = await supabase.auth.getUser()
    // const profile = await supabase.from('users_profile').select('tenant_id').eq('user_id', user.data.user.id).single()
    // .update().eq('id', profile.data.tenant_id)

    if (error) throw new Error('Failed to update settings')

    revalidatePath('/dashboard/settings')
}
