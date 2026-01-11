
import { getStockReport } from '@/actions/reports'
import { StockReportClient } from './client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function StockReportPage() {
    const data = await getStockReport() || []

    const totalStockValue = data.reduce((acc: number, curr: any) => acc + (curr.stock_quantity * curr.price), 0)
    const lowStockItems = data.filter((i: any) => i.stock_quantity <= (i.low_stock_threshold || 0)).length

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Stock Report</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Inventory Value (Selling Price)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{totalStockValue.toFixed(2)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{lowStockItems}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="border rounded-md p-4 bg-white">
                <StockReportClient data={data} />
            </div>
        </div>
    )
}
