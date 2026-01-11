
import { getInvoices, getInvoiceStats } from '@/actions/invoices'
import { Button } from '@/components/ui/button'
import { InvoicesClient } from './invoices-client'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { parseISO } from 'date-fns'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import {
    Plus,
    Search,
    Filter,
    Download,
    CreditCard,
    CheckCircle2,
    Clock,
    Wallet
} from 'lucide-react'
import { Input } from '@/components/ui/input'

export default async function SaleInvoicesPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams
    const search = typeof params.search === 'string' ? params.search : undefined
    const startDateParam = typeof params.startDate === 'string' ? params.startDate : undefined
    const endDateParam = typeof params.endDate === 'string' ? params.endDate : undefined

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

    return (
        <div className="min-h-screen bg-slate-50/50  space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Invoices</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage your sales, track payments, and download bills.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="hidden sm:flex bg-white hover:bg-slate-50">
                        <Download className="h-4 w-4 mr-2" /> Export
                    </Button>
                    <Link href="/dashboard/invoices/new">
                        <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-200">
                            <Plus className="h-4 w-4 mr-2" /> Create Invoice
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="rounded-xl border-none shadow-sm bg-gradient-to-br from-blue-50 to-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-5">
                        <Wallet className="h-24 w-24 text-blue-600" />
                    </div>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100/50 rounded-lg text-blue-600">
                                <CreditCard className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Total Sales</p>
                                <h3 className="text-2xl font-bold text-slate-900 mt-0.5">
                                    ₹ {totalSales.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                </h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-xl border-none shadow-sm bg-gradient-to-br from-emerald-50 to-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-5">
                        <CheckCircle2 className="h-24 w-24 text-emerald-600" />
                    </div>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-100/50 rounded-lg text-emerald-600">
                                <CheckCircle2 className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Received Payment</p>
                                <h3 className="text-2xl font-bold text-slate-900 mt-0.5">
                                    ₹ {received.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                </h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-xl border-none shadow-sm bg-gradient-to-br from-orange-50 to-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-5">
                        <Clock className="h-24 w-24 text-orange-600" />
                    </div>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-orange-100/50 rounded-lg text-orange-600">
                                <Clock className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Pending Amount</p>
                                <h3 className="text-2xl font-bold text-slate-900 mt-0.5">
                                    ₹ {balance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                </h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters & Actions Bar */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search by invoice # or client..."
                        defaultValue={search}
                        className="pl-9 h-10 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <DatePickerWithRange />
                    <Button variant="outline" size="icon" className="h-10 w-10 border-slate-200 text-slate-500 hover:text-slate-700">
                        <Filter className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Data Table */}
            <Card className="rounded-xl border-none shadow-sm overflow-hidden bg-white">
                <InvoicesClient data={invoices as any[] || []} />
            </Card>
        </div>
    )
}
