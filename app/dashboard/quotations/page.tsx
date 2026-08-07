
import { getQuotations } from '@/actions/quotations'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { format, parseISO } from 'date-fns'
import {
    Plus,
    Calendar,
    Printer,
    Share2,
    MoreVertical,
    Eye,
    Edit,
    Trash2,
    FileText,
    FileEdit,
    CheckCircle2,
    Filter
} from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { QuotationsTable } from '@/components/quotations/quotations-table'
import { QuotationsSearch } from './search'

export default async function QuotationsPage({
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

    const { data: quotations, summary } = await getQuotations('estimate', 1, 100, {
        search,
        startDate,
        endDate
    })

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quotations</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage estimates, track status, and convert to invoices.</p>
                </div>
                <Link href="/dashboard/quotations/create">
                    <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-200">
                        <Plus className="h-4 w-4 mr-2" /> Create Estimate
                    </Button>
                </Link>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="rounded-xl border-none shadow-sm bg-gradient-to-br from-indigo-50 to-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-5">
                        <FileEdit className="h-24 w-24 text-indigo-600" />
                    </div>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-100/50 rounded-lg text-indigo-600">
                                <FileText className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Total Estimates</p>
                                <h3 className="text-2xl font-bold text-slate-900 mt-0.5">
                                    {summary.total.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
                                </h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-xl border-none shadow-sm bg-gradient-to-br from-purple-50 to-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-5">
                        <CheckCircle2 className="h-24 w-24 text-purple-600" />
                    </div>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-purple-100/50 rounded-lg text-purple-600">
                                    <CheckCircle2 className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500">Open Estimates</p>
                                    <h3 className="text-2xl font-bold text-slate-900 mt-0.5">
                                        {summary.open.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
                                    </h3>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-semibold text-slate-500 uppercase">Converted</p>
                                <p className="text-lg font-bold text-green-600">
                                    {summary.converted.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters & Actions Bar */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center gap-3">
                <QuotationsSearch />

                <div className="flex items-center gap-2">
                    <DatePickerWithRange />
                    <Button variant="outline" size="icon" className="h-10 w-10 border-slate-200 text-slate-500 hover:text-slate-700">
                        <Filter className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* List Table */}
            <Card className="rounded-xl border-none shadow-sm bg-white overflow-hidden min-h-[400px]">
                <QuotationsTable data={quotations as any[] || []} />
            </Card>
        </div>
    )
}
