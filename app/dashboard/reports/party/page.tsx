
import { getPartyReport } from '@/actions/reports'
import { PartyReportClient } from './client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function PartyReportPage() {
    const data = await getPartyReport() || []

    const totalReceivable = data.reduce((acc: number, curr: any) => curr.current_balance > 0 ? acc + curr.current_balance : acc, 0)
    const totalPayable = data.reduce((acc: number, curr: any) => curr.current_balance < 0 ? acc + Math.abs(curr.current_balance) : acc, 0)

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Party Report</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Receivable</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">₹{totalReceivable.toFixed(2)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Payable</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">₹{totalPayable.toFixed(2)}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="border rounded-md p-4 bg-white">
                <PartyReportClient data={data} />
            </div>
        </div>
    )
}
