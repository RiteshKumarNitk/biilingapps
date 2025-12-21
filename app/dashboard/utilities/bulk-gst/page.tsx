import { getProducts } from '@/actions/inventory'
import { BulkUpdateTable } from '@/components/utilities/bulk-update-table'

export default async function BulkGSTUpdatePage() {
    // Fetch all products (passing a large limit to simulate 'all' for now, or implement infinite scroll later)
    // For bulk update, pagination is tricky if we want to search/filter everything. 
    // We fetch a larger page size, e.g., 100 or 500 for this view.
    const { data: products } = await getProducts(1, 1000)

    return (
        <div className="min-h-screen bg-[#F5F7FA] p-4 font-sans text-slate-800 pb-20">
            <div className="flex flex-col space-y-4 h-full">
                {/* No top header here because we assume it's in layout shell or client component handles visual title header */}
                {/* We let BulkUpdateTable handle its container card */}

                <BulkUpdateTable initialItems={products || []} />
            </div>
        </div>
    )
}
