
import { getPartyReport } from '@/actions/reports'
import { PartyReportClient } from './client'
import { StatsCard } from '@/components/shared'

export default async function PartyReportPage() {
    const data = await getPartyReport() || []

    const totalReceivable = data.reduce((acc: number, curr) => curr.currentBalance > 0 ? acc + curr.currentBalance : acc, 0)
    const totalPayable = data.reduce((acc: number, curr) => curr.currentBalance < 0 ? acc + Math.abs(curr.currentBalance) : acc, 0)

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Party Report</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard label="Total Receivable" value={`₹${totalReceivable.toFixed(2)}`} valueClassName="text-green-600" />
                <StatsCard label="Total Payable" value={`₹${totalPayable.toFixed(2)}`} valueClassName="text-red-600" />
            </div>

            <div className="border rounded-md p-4 bg-white">
                <PartyReportClient data={data} />
            </div>
        </div>
    )
}
