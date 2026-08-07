
import { getPurchaseReport } from '@/actions/reports'
import { PurchaseReportClient } from './client'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { StatsCard } from '@/components/shared'

export default async function PurchaseReportPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams
    const startDateParam = typeof params.startDate === 'string' ? params.startDate : undefined
    const endDateParam = typeof params.endDate === 'string' ? params.endDate : undefined

    const data = await getPurchaseReport(startDateParam, endDateParam) || []

    const totalPurchases = data.reduce((acc, curr) => acc + (curr.grandTotal || 0), 0)

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Purchase Report</h2>
                <div className="flex items-center space-x-2">
                    <DatePickerWithRange />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard label="Total Purchases" value={`₹${totalPurchases.toFixed(2)}`} />
            </div>

            <div className="border rounded-md p-4 bg-white">
                <PurchaseReportClient data={data} />
            </div>
        </div>
    )
}
