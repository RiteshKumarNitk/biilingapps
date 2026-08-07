
import { getSalesReport } from '@/actions/reports'
import { SalesReportClient } from './client'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { parseISO } from 'date-fns'
import { StatsCard } from '@/components/shared'

export default async function SalesReportPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams
    const startDateParam = typeof params.startDate === 'string' ? params.startDate : undefined
    const endDateParam = typeof params.endDate === 'string' ? params.endDate : undefined

    const data = await getSalesReport(startDateParam, endDateParam) || []

    const totalSales = data.reduce((acc, curr) => acc + (curr.grandTotal || 0), 0)
    const totalPaid = data.filter((i) => i.paymentStatus === 'PAID').reduce((acc, curr) => acc + (curr.grandTotal || 0), 0)

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Sales Report</h2>
                <div className="flex items-center space-x-2">
                    <DatePickerWithRange />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard label="Total Sales" value={`₹${totalSales.toFixed(2)}`} />
                <StatsCard label="Total Received" value={`₹${totalPaid.toFixed(2)}`} valueClassName="text-green-600" />
            </div>

            <div className="border rounded-md p-4 bg-white">
                <SalesReportClient data={data} />
            </div>
        </div>
    )
}
