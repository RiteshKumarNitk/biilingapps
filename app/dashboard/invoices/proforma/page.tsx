
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
import { format } from 'date-fns'
import {
    ChevronDown,
    Settings,
    Plus,
    Calendar,
    MoreVertical,
    Eye,
    Edit,
    Trash2,
    FileText,
    Printer,
    Share2,
    Search
} from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default async function ProformaInvoicePage() {
    // Explicitly fetch 'proforma' type
    const { data: quotations, summary } = await getQuotations('proforma')

    return (
        <div className="min-h-screen bg-[#F5F7FA] p-4 md:p-6 font-sans text-slate-800 space-y-5">
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 group cursor-pointer">
                    <h1 className="text-xl font-normal text-slate-800">Proforma Invoice</h1>
                    <ChevronDown className="h-5 w-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/dashboard/invoices/proforma/new">
                        <Button className="bg-[#EF4444] hover:bg-red-600 text-white rounded-full px-6 h-9 text-sm font-medium shadow-sm transition-all hover:shadow-md">
                            <Plus className="h-4 w-4 mr-1.5" /> Add Proforma
                        </Button>
                    </Link>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full">
                        <Settings className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Filters Card */}
            <Card className="rounded-xl border-none shadow-sm bg-white">
                <CardContent className="p-3 flex items-center flex-wrap gap-3 sm:gap-4 text-sm">
                    <span className="font-medium text-slate-500 mr-2">Filter by :</span>

                    <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-50 border border-slate-100 rounded-full cursor-pointer hover:border-slate-200 transition-colors">
                        <span className="text-slate-600">This Month</span>
                        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                    </div>

                    <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-50 border border-slate-100 rounded-full cursor-pointer hover:border-slate-200 transition-colors">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-slate-600">Between Dates</span>
                        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                    </div>

                    <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-50 border border-slate-100 rounded-full cursor-pointer hover:border-slate-200 transition-colors">
                        <span className="text-slate-600">All Firms</span>
                        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                    </div>
                </CardContent>
            </Card>

            {/* Summary Card */}
            <Card className="rounded-xl border-none shadow-sm bg-[#F8FAFF] overflow-hidden">
                <div className="flex flex-col md:flex-row p-6 items-center gap-8">
                    {/* Total Quotations */}
                    <div className="flex-1 min-w-[200px]">
                        <p className="text-slate-500 text-sm font-medium mb-1.5">Total Quotations</p>
                        <div className="flex items-baseline gap-3">
                            <h2 className="text-2xl font-bold text-slate-800">
                                ₹ {summary.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </h2>
                            {summary.total > 0 && (
                                <span className="text-emerald-600 text-[10px] font-bold bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full tracking-wide">
                                    % ↑ vs last month
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Breakdown */}
                    <div className="flex-[2] flex flex-col sm:flex-row w-full sm:w-auto items-start sm:items-center justify-around gap-6 sm:gap-0 border-l border-slate-200/60 pl-0 sm:pl-8">
                        <div>
                            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1.5">Converted</p>
                            <p className="text-xl font-semibold text-slate-700">
                                ₹ {summary.converted.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div className="hidden sm:block h-10 w-px bg-slate-200"></div>
                        <div>
                            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1.5">Open</p>
                            <p className="text-xl font-semibold text-orange-500">
                                ₹ {summary.open.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Transactions Section */}
            <div>
                <div className="flex items-center justify-between mb-3 pl-1 pr-1">
                    <h3 className="font-semibold text-slate-700 text-base">Transactions</h3>
                    <div className="p-2 hover:bg-slate-100 rounded-full cursor-pointer text-slate-400">
                        <Search className="h-4 w-4" />
                    </div>
                </div>

                <Card className="rounded-xl border-none shadow-sm bg-white min-h-[500px] flex flex-col">
                    <div className="flex-1 overflow-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-b border-slate-100 hover:bg-transparent">
                                    <TableHead className="bg-white text-xs font-semibold text-slate-500 h-11 pl-6 w-[120px]">DATE</TableHead>
                                    <TableHead className="bg-white text-xs font-semibold text-slate-500 h-11">REFERENCE NO</TableHead>
                                    <TableHead className="bg-white text-xs font-semibold text-slate-500 h-11">PARTY NAME</TableHead>
                                    <TableHead className="bg-white text-xs font-semibold text-slate-500 h-11 text-right">AMOUNT</TableHead>
                                    <TableHead className="bg-white text-xs font-semibold text-slate-500 h-11 text-right">BALANCE</TableHead>
                                    <TableHead className="bg-white text-xs font-semibold text-slate-500 h-11 w-[120px]">STATUS</TableHead>
                                    <TableHead className="bg-white text-xs font-semibold text-slate-500 h-11 text-right pr-6 w-[140px]">ACTIONS</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(!quotations || quotations.length === 0) ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-64 text-center">
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
                                        const isConverted = q.status === 'converted'
                                        const isOpen = q.status === 'open' || q.status === 'sent' // 'sent' is default for open
                                        const statusText = isConverted ? 'Converted' : (isOpen ? 'Open' : 'Closed')
                                        const statusColor = isConverted ? 'text-green-600' : (isOpen ? 'text-orange-500' : 'text-slate-500')
                                        const balance = isConverted ? 0 : q.grand_total

                                        return (
                                            <TableRow key={q.id} className="border-b border-slate-50/60 hover:bg-slate-50 transition-colors group">
                                                <TableCell className="py-3 pl-6 text-sm text-slate-600">
                                                    {format(new Date(q.date), 'dd/MM/yyyy')}
                                                </TableCell>
                                                <TableCell className="py-3 text-sm text-blue-600 font-medium cursor-pointer hover:underline">
                                                    <Link href={`/dashboard/invoices/proforma/${q.id}`}>
                                                        {q.quotation_number}
                                                    </Link>
                                                </TableCell>
                                                <TableCell className="py-3 text-sm font-medium text-slate-700">
                                                    {q.party_name}
                                                </TableCell>
                                                <TableCell className="py-3 text-sm font-semibold text-slate-700 text-right">
                                                    ₹ {q.grand_total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </TableCell>
                                                <TableCell className="py-3 text-sm text-slate-500 text-right">
                                                    ₹ {balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </TableCell>
                                                <TableCell className="py-3 text-sm font-medium">
                                                    <span className={statusColor}>{statusText}</span>
                                                </TableCell>
                                                <TableCell className="py-3 pr-6 text-right">
                                                    <div className="flex justify-end items-center gap-3">
                                                        {/* Primary Convert Action */}
                                                        {isOpen && (
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="outline" size="sm" className="h-7 text-xs border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 px-2 rounded-sm gap-1">
                                                                        Convert <ChevronDown className="h-3 w-3" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuLabel>Convert to</DropdownMenuLabel>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem asChild>
                                                                        <Link href={`/dashboard/invoices/new?from_proforma=${q.id}`} className="cursor-pointer">
                                                                            Sale Invoice
                                                                        </Link>
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        )}

                                                        {/* Secondary Actions */}
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                                                                    <MoreVertical className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-40">
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={`/dashboard/invoices/proforma/${q.id}`} className="flex items-center gap-2 cursor-pointer">
                                                                        <Eye className="h-3.5 w-3.5" /> View
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                {isOpen && (
                                                                    <DropdownMenuItem asChild>
                                                                        <Link href={`/dashboard/invoices/proforma/${q.id}/edit`} className="flex items-center gap-2 cursor-pointer">
                                                                            <Edit className="h-3.5 w-3.5" /> Edit
                                                                        </Link>
                                                                    </DropdownMenuItem>
                                                                )}
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                                                                    <Printer className="h-3.5 w-3.5" /> Print
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                                                                    <Share2 className="h-3.5 w-3.5" /> Share
                                                                </DropdownMenuItem>
                                                                {isOpen && (
                                                                    <>
                                                                        <DropdownMenuSeparator />
                                                                        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer text-red-500 focus:text-red-600">
                                                                            <Trash2 className="h-3.5 w-3.5" /> Delete
                                                                        </DropdownMenuItem>
                                                                    </>
                                                                )}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </Card>
            </div>
        </div>
    )
}
