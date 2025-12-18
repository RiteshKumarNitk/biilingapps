
import { ProductForm } from '@/components/inventory/product-form'
import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'

export default async function EditProductPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;
    const supabase = await createClient()
    const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

    if (!product) {
        notFound()
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Edit Product</h2>
            </div>
            <div className="rounded-md border p-4">
                <ProductForm productId={product.id} initialData={product} />
            </div>
        </div>
    )
}
