'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateInvoiceSettings(settings: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    // Get tenant ID
    const { data: profile } = await supabase
        .from('users_profile')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

    if (!profile?.tenant_id) throw new Error('Tenant not found')

    // Fetch current settings to merge
    const { data: tenant } = await supabase
        .from('tenants')
        .select('settings')
        .eq('id', profile.tenant_id)
        .single()

    const currentSettings = tenant?.settings || {}

    // Update with new settings merged
    const { error } = await supabase
        .from('tenants')
        .update({
            settings: {
                ...currentSettings,
                ...settings
            }
        })
        .eq('id', profile.tenant_id)

    if (error) throw new Error(error.message)

    revalidatePath('/dashboard')
    return { success: true }
}
