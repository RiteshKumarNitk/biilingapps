'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getUserProfile() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // Fetch profile and tenant
    const { data: profile } = await supabase
        .from('users_profile')
        .select(`
            *,
            tenants (
                name,
                address,
                phone,
                phone,
                email,
                gst_no,
                cin_no,
                gst_no,
                cin_no,
                logo_url,
                signature_url,
                settings
            )
        `)
        .eq('id', user.id)
        .single()

    return { user, profile }
}

export async function updateUserProfile(data: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // Update Profile (First/Last Name usually)
    // Assuming users_profile has first_name, last_name, phone? 
    // If column doesn't exist, this will error, but good first step.
    const { error } = await supabase
        .from('users_profile')
        .update({
            first_name: data.first_name,
            last_name: data.last_name,
            phone: data.phone,
            avatar_url: data.avatar_url
        })
        .eq('id', user.id)

    if (error) throw new Error(error.message)

    revalidatePath('/dashboard')
    return { success: true }
}

export async function updateTenantSettings(data: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data: profile } = await supabase
        .from('users_profile')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

    if (!profile?.tenant_id) throw new Error('Tenant not found')

    // Fetch existing settings
    const { data: tenantData } = await supabase
        .from('tenants')
        .select('settings')
        .eq('id', profile.tenant_id)
        .single()

    const { error } = await supabase
        .from('tenants')
        .update({
            name: data.company_name,
            address: data.address,
            phone: data.phone,
            email: data.email,
            gst_no: data.gst_no,
            cin_no: data.cin_no,
            logo_url: data.logo_url,
            signature_url: data.signature_url,
            settings: {
                ...(tenantData?.settings as object || {}),
                terms: data.terms
            }
        })
        .eq('id', profile.tenant_id)

    if (error) throw new Error(error.message)

    revalidatePath('/dashboard')
    return { success: true }
}
