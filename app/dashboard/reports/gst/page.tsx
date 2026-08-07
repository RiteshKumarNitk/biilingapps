
import { getGSTReport } from '@/actions/reports'
import { GSTReportClient } from './client'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { StatsCard } from '@/components/shared'

export default async function GSTReportPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams
    const startDateParam = typeof params.startDate === 'string' ? params.startDate : undefined
    const endDateParam = typeof params.endDate === 'string' ? params.endDate : undefined

    const { sales } = await getGSTReport(startDateParam, endDateParam) || { sales: [] }

    const totalTax = sales.reduce((acc, curr) => acc + (curr.taxAmount || 0), 0)
    const totalSales = sales.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0)

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">GST Report (GSTR-1)</h2>
                <div className="flex items-center space-x-2">
                    <DatePickerWithRange />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard label="Total GST Collected (Output Tax)" value={`₹${totalTax.toFixed(2)}`} />
                <StatsCard label="Total Sales Value" value={`₹${totalSales.toFixed(2)}`} />
            </div>

            <div className="border rounded-md p-4 bg-white">
                <h3 className="mb-4 text-lg font-medium">Sales Transactions (Item Wise)</h3>
                <GSTReportClient data={sales} />
            </div>
        </div>
    )
}
