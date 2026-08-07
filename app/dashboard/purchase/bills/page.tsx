
import { getPurchaseBills, getPurchaseStats } from '@/actions/purchase'
import { Button } from '@/components/ui/button'
import { Plus, CheckCircle2, ShoppingBag, Filter, Download } from 'lucide-react'
import Link from 'next/link'
import { PurchaseBillsClient } from './purchase-bills-client'
import { Card } from '@/components/ui/card'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { parseISO } from 'date-fns'
import { PurchaseBillsSearch } from './search'
import { StatsCard } from '@/components/shared'

export default async function PurchaseBillsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams
    const search = typeof params.search === 'string' ? params.search : undefined
    const startDateParam = typeof params.startDate === 'string' ? params.startDate : undefined
    const endDateParam = typeof params.endDate === 'string' ? params.endDate : undefined

    let startDate: Date | undefined
    let endDate: Date | undefined
    if (startDateParam) startDate = parseISO(startDateParam)
    if (endDateParam) endDate = parseISO(endDateParam)

    // Fetch data
    const [{ data: bills }, stats] = await Promise.all([
        getPurchaseBills(1, 100, { search, startDate, endDate } as any),
        getPurchaseStats({ search, startDate, endDate })
    ])

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Purchase Bills</h1>
                    <p className="text-sm text-slate-500 mt-1">Track and manage your purchase expenses.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="hidden sm:flex bg-white hover:bg-slate-50">
                        <Download className="h-4 w-4 mr-2" /> Export
                    </Button>
                    <Link href="/dashboard/purchase/bills/new">
                        <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-200">
                            <Plus className="h-4 w-4 mr-2" /> Add Bill
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <StatsCard
                    variant="gradient"
                    color="orange"
                    icon={ShoppingBag}
                    label="Total Purchases"
                    value={`₹ ${stats.total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                />

                <StatsCard
                    variant="gradient"
                    color="blue"
                    icon={CheckCircle2}
                    label="Total Bills"
                    value={stats.count}
                />

                {/* Placeholder for Balance/Due if available later */}
                <Card className="rounded-xl border-none shadow-sm bg-white border-dashed border-slate-200 hidden lg:flex items-center justify-center">
                    <p className="text-sm text-slate-400">More stats coming soon</p>
                </Card>
            </div>

            {/* Filters & Actions Bar */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center gap-3">
                <PurchaseBillsSearch />

                <div className="flex items-center gap-2">
                    <DatePickerWithRange />
                    <Button variant="outline" size="icon" className="h-10 w-10 border-slate-200 text-slate-500 hover:text-slate-700">
                        <Filter className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Data Table */}
            <Card className="rounded-xl border-none shadow-sm overflow-hidden bg-white">
                <PurchaseBillsClient data={bills as any[] || []} />
            </Card>
        </div>
    )
}
