
'use server'

import { createClient } from '@/utils/supabase/server'
import { productSchema, ProductFormValues } from '@/lib/schemas/product'
import { revalidatePath } from 'next/cache'

export async function getProducts(page = 1, pageSize = 10, search = '') {
    const supabase = await createClient()
    const start = (page - 1) * pageSize
    const end = start + pageSize - 1

    let query = supabase
        .from('products')
        .select('*', { count: 'exact' })
        .range(start, end)
        .order('created_at', { ascending: false })

    if (search) {
        query = query.ilike('name', `%${search}%`)
    }

    const { data, error, count } = await query

    if (error) {
        throw new Error(error.message)
    }

    return { data, count }
}

export async function createProduct(data: ProductFormValues) {
    const supabase = await createClient()
    const validated = productSchema.parse(data)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // Get tenant_id from profile
    const { data: profile } = await supabase
        .from('users_profile')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

    if (!profile) throw new Error('Profile not found')

    const { error } = await supabase.from('products').insert({
        ...validated,
        tenant_id: profile.tenant_id,
    })

    if (error) throw new Error(error.message)

    revalidatePath('/dashboard/inventory')
}

export async function updateProduct(id: string, data: ProductFormValues) {
    const supabase = await createClient()
    const validated = productSchema.parse(data)

    const { error } = await supabase
        .from('products')
        .update(validated)
        .eq('id', id)

    if (error) throw new Error(error.message)

    revalidatePath('/dashboard/inventory')
}

export async function deleteProduct(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('products').delete().eq('id', id)

    if (error) throw new Error(error.message)

    revalidatePath('/dashboard/inventory')
}
