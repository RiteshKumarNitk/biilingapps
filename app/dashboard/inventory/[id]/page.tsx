import { ProductForm } from '@/components/inventory/product-form'
import { requireAuth } from '@/lib/auth-server'
import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'

export default async function EditProductPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;
    const user = await requireAuth()

    const product = await prisma.product.findUnique({
        where: { id, tenantId: user.tenantId }
    })

    if (!product) {
        notFound()
    }

    // Map Prisma camelCase properties back to snake_case for the form component
    const formattedProduct = {
        ...product,
        cost_price: product.costPrice,
        stock_quantity: product.stockQuantity,
        min_stock_level: product.minStockLevel,
        low_stock_threshold: product.minStockLevel, // Assuming min_stock_level is low_stock_threshold
        gst_rate: product.gstRate,
        hsn_code: product.hsnCode,
        image_url: product.imageUrl,
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Edit Product</h2>
            </div>
            <div className="rounded-md border p-4">
                <ProductForm productId={product.id} initialData={formattedProduct} />
            </div>
        </div>
    )
}
