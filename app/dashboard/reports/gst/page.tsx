
import { getGSTReport } from '@/actions/reports'
import { GSTReportClient } from './client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'

export default async function GSTReportPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams
    const startDateParam = typeof params.startDate === 'string' ? params.startDate : undefined
    const endDateParam = typeof params.endDate === 'string' ? params.endDate : undefined

    const { sales } = await getGSTReport(startDateParam, endDateParam) || { sales: [] }

    const totalTax = sales.reduce((acc: number, curr: any) => acc + (curr.tax_amount || 0), 0)
    const totalSales = sales.reduce((acc: number, curr: any) => acc + (curr.total_amount || 0), 0)

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">GST Report (GSTR-1)</h2>
                <div className="flex items-center space-x-2">
                    <DatePickerWithRange />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total GST Collected (Output Tax)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{totalTax.toFixed(2)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Sales Value</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{totalSales.toFixed(2)}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="border rounded-md p-4 bg-white">
                <h3 className="mb-4 text-lg font-medium">Sales Transactions (Item Wise)</h3>
                <GSTReportClient data={sales} />
            </div>
        </div>
    )
}
