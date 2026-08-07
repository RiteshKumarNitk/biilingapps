
import { getStockReport } from '@/actions/reports'
import { StockReportClient } from './client'
import { StatsCard } from '@/components/shared'

export default async function StockReportPage() {
    const data = await getStockReport() || []

    const totalStockValue = data.reduce((acc, curr) => acc + (curr.stockQuantity * curr.price), 0)
    const lowStockItems = data.filter((i) => i.stockQuantity <= (i.lowStockThreshold || 0)).length

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Stock Report</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard label="Total Inventory Value (Selling Price)" value={`₹${totalStockValue.toFixed(2)}`} />
                <StatsCard label="Low Stock Items" value={lowStockItems} valueClassName="text-red-600" />
            </div>

            <div className="border rounded-md p-4 bg-white">
                <StockReportClient data={data} />
            </div>
        </div>
    )
}
