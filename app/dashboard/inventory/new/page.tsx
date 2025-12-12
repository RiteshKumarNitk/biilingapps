
import { ProductForm } from '@/components/inventory/product-form'

export default function CreateProductPage() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Add Product</h2>
            </div>
            <div className="rounded-md border p-4">
                <ProductForm />
            </div>
        </div>
    )
}
