
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
    Search,
    Printer,
    Share2,
    MoreVertical,
    Eye,
    Edit,
    Trash2,
    FileText,
    FileEdit,
    CheckCircle2,
    Filter,
    ScrollText
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
import { Input } from "@/components/ui/input"
import { DatePickerWithRange } from '@/components/ui/date-range-picker'

export default async function ProformaInvoicePage({
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

    // Explicitly fetch 'proforma' type with filters
    const { data: quotations, summary } = await getQuotations('proforma', 1, 100, {
        search,
        startDate,
        endDate
    })

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Proforma Invoices</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage proforma invoices and convert to sales.</p>
                </div>
                <Link href="/dashboard/invoices/proforma/new">
                    <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-200">
                        <Plus className="h-4 w-4 mr-2" /> Create Proforma
                    </Button>
                </Link>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="rounded-xl border-none shadow-sm bg-gradient-to-br from-indigo-50 to-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-5">
                        <ScrollText className="h-24 w-24 text-indigo-600" />
                    </div>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-100/50 rounded-lg text-indigo-600">
                                <ScrollText className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Total Proformas</p>
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
                                    <p className="text-sm font-medium text-slate-500">Open Proformas</p>
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
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        name="search"
                        placeholder="Search proforma..."
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

            {/* List Table */}
            <Card className="rounded-xl border-none shadow-sm bg-white overflow-hidden min-h-[400px]">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow className="border-b border-slate-100 hover:bg-transparent">
                            <TableHead className="font-semibold text-slate-500 h-10 pl-6 w-[120px]">Date</TableHead>
                            <TableHead className="font-semibold text-slate-500 h-10">Ref #</TableHead>
                            <TableHead className="font-semibold text-slate-500 h-10">Party Name</TableHead>
                            <TableHead className="font-semibold text-slate-500 h-10 text-right">Amount</TableHead>
                            <TableHead className="font-semibold text-slate-500 h-10 w-[120px]">Status</TableHead>
                            <TableHead className="font-semibold text-slate-500 h-10 text-right pr-6 w-[80px]">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {(!quotations || quotations.length === 0) ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-64 text-center">
                                    <div className="flex flex-col items-center justify-center text-slate-400 gap-3">
                                        <div className="p-4 rounded-full bg-slate-50">
                                            <FileText className="h-8 w-8 opacity-20" />
                                        </div>
                                        <p className="text-sm font-medium text-slate-500">No proforma invoices found</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            quotations.map((q) => {
                                const isConverted = q.status === 'CONVERTED'
                                const isOpen = q.status === 'DRAFT' || q.status === 'SENT' // 'sent' is default for open

                                let statusVariant: "default" | "secondary" | "destructive" | "outline" = "outline"
                                let statusClass = ""
                                if (isConverted) {
                                    statusClass = "bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
                                    statusVariant = "secondary"
                                } else if (isOpen) {
                                    statusClass = "bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
                                    statusVariant = "secondary"
                                }

                                return (
                                    <TableRow key={q.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                                        <TableCell className="py-3 pl-6 text-sm text-slate-500 font-medium">
                                            {format(new Date(q.date), 'dd MMM yyyy')}
                                        </TableCell>
                                        <TableCell className="py-3 text-sm text-slate-700 font-medium">
                                            {q.quotationNumber}
                                        </TableCell>
                                        <TableCell className="py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="h-6 w-6 rounded-full bg-indigo-50 flex items-center justify-center text-[10px] font-bold text-indigo-600 border border-indigo-100 uppercase">
                                                    {(q.partyName || 'U').substring(0, 2)}
                                                </div>
                                                <span className="text-sm font-medium text-slate-700">{q.partyName}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-3 text-sm font-bold text-slate-800 text-right">
                                            {q.grandTotal.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                        </TableCell>
                                        <TableCell className="py-3">
                                            <Badge variant={statusVariant} className={`capitalize font-normal px-2 py-0.5 ${statusClass}`}>
                                                {q.status || 'Draft'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-3 pr-6 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-slate-600">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/dashboard/invoices/proforma/${q.id}`} className="cursor-pointer">
                                                            <Eye className="mr-2 h-4 w-4" /> View Details
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    {isOpen && (
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/dashboard/invoices/proforma/${q.id}/edit`} className="cursor-pointer">
                                                                <Edit className="mr-2 h-4 w-4" /> Edit Proforma
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    )}
                                                    {isOpen && (
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/dashboard/invoices/new?from_proforma=${q.id}`} className="cursor-pointer text-blue-600 focus:text-blue-700 font-medium">
                                                                <CheckCircle2 className="mr-2 h-4 w-4" /> Convert to Sales
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/print/quotations/${q.id}`} target="_blank" className="cursor-pointer">
                                                            <Printer className="mr-2 h-4 w-4" /> Print
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    {isOpen && (
                                                        <>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="cursor-pointer text-red-500 focus:text-red-600">
                                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    )
}
