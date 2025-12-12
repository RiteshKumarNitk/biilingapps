
'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function getPublicInvoice(token: string) {
    const cookieStore = await cookies()

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll() },
                setAll(cookiesToSet) {
                    // Read-only
                },
            },
        }
    )

    const { data, error } = await supabase.rpc('get_invoice_by_token', { token })

    if (error) {
        console.error('RPC Error:', error)
        return null
    }
    return data
}
