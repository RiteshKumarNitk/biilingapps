
import { getPurchaseBills, getPurchaseStats } from '@/actions/purchase'
import { Button } from '@/components/ui/button'
import { Plus, Search } from 'lucide-react'
import Link from 'next/link'
import { PurchaseBillsClient } from './purchase-bills-client'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { parseISO } from 'date-fns'

export default async function PurchaseBillsPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined }
}) {
    const search = typeof searchParams.search === 'string' ? searchParams.search : undefined
    const startDateParam = typeof searchParams.startDate === 'string' ? searchParams.startDate : undefined
    const endDateParam = typeof searchParams.endDate === 'string' ? searchParams.endDate : undefined

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
        <div className="min-h-screen bg-[#F7F7F7] p-4 md:p-6 font-sans text-slate-800 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-xl font-semibold text-slate-700">Purchase Bills</h1>
                <Link href="/dashboard/purchase/bills/new">
                    <Button className="bg-[#EF4444] hover:bg-red-600 text-white rounded-full px-6 h-9 text-sm font-medium shadow-sm transition-all hover:shadow-md">
                        <Plus className="h-4 w-4 mr-1.5" /> Add Bill
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <Card className="rounded-xl border-none shadow-sm bg-white">
                <CardContent className="p-3 flex items-center flex-wrap gap-3 sm:gap-4 text-sm">
                    <DatePickerWithRange />
                    <form className="flex items-center gap-2 ml-auto">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                name="search"
                                placeholder="Search party..."
                                defaultValue={search}
                                className="h-9 pl-9 w-[200px] bg-slate-50 border-slate-200 focus-visible:ring-1 rounded-full text-sm"
                            />
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Summary */}
            <Card className="rounded-xl border-none shadow-sm bg-white overflow-hidden">
                <div className="flex p-6 items-center gap-6">
                    <div>
                        <p className="text-slate-500 text-sm font-medium mb-1">Total Purchases</p>
                        <h2 className="text-2xl font-bold text-slate-800">
                            ₹ {stats.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </h2>
                    </div>
                    <div className="h-10 w-px bg-slate-100"></div>
                    <div>
                        <p className="text-slate-500 text-sm font-medium mb-1">Bills Count</p>
                        <h2 className="text-xl font-semibold text-slate-700">
                            {stats.count}
                        </h2>
                    </div>
                </div>
            </Card>

            {/* Transactions Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <PurchaseBillsClient data={bills as any[] || []} />
            </div>
        </div>
    )
}
