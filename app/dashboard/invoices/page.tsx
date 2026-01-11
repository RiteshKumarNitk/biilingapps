
import { getInvoices, getInvoiceStats } from '@/actions/invoices'
import { Button } from '@/components/ui/button'
import { InvoicesClient } from './invoices-client'
import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { format, startOfMonth, endOfMonth, parseISO, isValid, subMonths } from 'date-fns'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import {
    ChevronDown,
    Settings,
    Plus,
    X,
    Search
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { DateRange } from 'react-day-picker'


export default async function SaleInvoicesPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined }
}) {
    const search = typeof searchParams.search === 'string' ? searchParams.search : undefined
    const startDateParam = typeof searchParams.startDate === 'string' ? searchParams.startDate : undefined
    const endDateParam = typeof searchParams.endDate === 'string' ? searchParams.endDate : undefined

    // Parse dates
    let startDate: Date | undefined
    let endDate: Date | undefined

    if (startDateParam) startDate = parseISO(startDateParam)
    if (endDateParam) endDate = parseISO(endDateParam)

    const { data: invoices } = await getInvoices(1, 100, {
        search,
        startDate,
        endDate
    })

    const { totalSales, received, balance } = await getInvoiceStats({
        search,
        startDate,
        endDate
    })

    // Filter Handlers (Client Components ideally, but doing server actions via links/forms for simplicity in server component)
    // We'll use a client component wrapper or simple links if possible, 
    // but for interactivity (Date Picker, Search Input) we might need a small client component.
    // For now, I will create a Client Component for the Filters separately or inline it if I could.
    // Since I cannot create new files easily without permission/overhead, I will make this page generic and use a small client helper if I can,
    // OR just use a form for search.
    // Actually, let's keep it simple: Search is a form. Filters are links.

    return (
        <div className="min-h-screen bg-[#F7F7F7] p-4 md:p-6 font-sans text-slate-800 space-y-5">
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 group cursor-pointer">
                    <h1 className="text-xl font-semibold text-slate-700">Sale Invoices</h1>
                    <ChevronDown className="h-5 w-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/dashboard/invoices/new">
                        <Button className="bg-[#EF4444] hover:bg-red-600 text-white rounded-full px-6 h-9 text-sm font-medium shadow-sm transition-all hover:shadow-md">
                            <Plus className="h-4 w-4 mr-1.5" /> Add Sale
                        </Button>
                    </Link>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full">
                        <Settings className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Filters Section - Converted to Client Component logic if needed, but doing simple links here */}
            {/* Filters Section */}
            <Card className="rounded-xl border-none shadow-sm bg-white">
                <CardContent className="p-3 flex items-center flex-wrap gap-3 sm:gap-4 text-sm">
                    <DatePickerWithRange />

                    {/* Search Form */}
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

            {/* Summary Card */}
            <Card className="rounded-xl border-none shadow-sm bg-white overflow-hidden">
                <div className="flex flex-col md:flex-row">
                    {/* Total Sales */}
                    <div className="flex-1 bg-[#EEF2FF] p-6 border-b md:border-b-0 md:border-r border-slate-100">
                        <p className="text-slate-500 text-sm font-medium mb-1.5">Total Sales Amount</p>
                        <div className="flex items-baseline gap-3">
                            <h2 className="text-2xl font-bold text-slate-800">
                                ₹ {totalSales.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </h2>
                            <span className="text-emerald-600 text-[10px] font-bold bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full tracking-wide">
                                100% ↑
                            </span>
                        </div>
                    </div>

                    {/* Breakdown */}
                    <div className="flex-[1.5] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-around gap-6 sm:gap-0">
                        <div>
                            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1.5">Received</p>
                            <p className="text-xl font-semibold text-slate-700">
                                ₹ {received.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div className="hidden sm:block h-12 w-px bg-slate-100"></div>
                        <div>
                            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1.5">Balance</p>
                            <p className="text-xl font-semibold text-slate-700">
                                ₹ {balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Transactions Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <InvoicesClient data={invoices as any[] || []} />
            </div>
        </div>
    )
}
