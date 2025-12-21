
import { getInvoices } from '@/actions/invoices'
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
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { format } from 'date-fns'
import {
    ChevronDown,
    Settings,
    Plus,
    Calendar,
    Search,
    BarChart,
    FileText,
    Printer,
    Share2,
    MoreVertical
} from 'lucide-react'

export default async function SaleInvoicesPage() {
    const { data: invoices } = await getInvoices(1, 100) // Fetch more for summary calculation

    // Calculate Summary Stats
    const totalSales = invoices?.reduce((sum, inv) => sum + (inv.grand_total || 0), 0) || 0
    // Simplified assumption: Paid = Received, Unpaid = Balance
    const received = invoices?.reduce((sum, inv) => inv.payment_status === 'paid' ? sum + (inv.grand_total || 0) : sum, 0) || 0
    const balance = invoices?.reduce((sum, inv) => inv.payment_status !== 'paid' ? sum + (inv.grand_total || 0) : sum, 0) || 0

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
            <Card className="rounded-xl border-none shadow-sm bg-white min-h-[500px] flex flex-col">
                <CardHeader className="px-6 py-4 border-b border-slate-50 flex flex-row items-center justify-between">
                    <h3 className="font-semibold text-slate-700 text-base">Transactions</h3>
                    <div className="flex items-center gap-4">
                        <Search className="h-4 w-4 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors" />
                        <BarChart className="h-4 w-4 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors" />
                        <FileText className="h-4 w-4 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors" />
                        <Printer className="h-4 w-4 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors" />
                    </div>
                </CardHeader>
                <div className="flex-1 overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-slate-100 hover:bg-transparent">
                                <TableHead className="bg-[#FAFAFA] text-xs font-semibold text-slate-500 h-11 pl-6 w-[120px]">DATE</TableHead>
                                <TableHead className="bg-[#FAFAFA] text-xs font-semibold text-slate-500 h-11">INVOICE NO</TableHead>
                                <TableHead className="bg-[#FAFAFA] text-xs font-semibold text-slate-500 h-11">PARTY NAME</TableHead>
                                <TableHead className="bg-[#FAFAFA] text-xs font-semibold text-slate-500 h-11">TRANSACTION TYPE</TableHead>
                                <TableHead className="bg-[#FAFAFA] text-xs font-semibold text-slate-500 h-11">PAYMENT TYPE</TableHead>
                                <TableHead className="bg-[#FAFAFA] text-xs font-semibold text-slate-500 h-11 text-right">AMOUNT</TableHead>
                                <TableHead className="bg-[#FAFAFA] text-xs font-semibold text-slate-500 h-11 text-right">BALANCE</TableHead>
                                <TableHead className="bg-[#FAFAFA] text-xs font-semibold text-slate-500 h-11 text-right pr-6 w-[100px]">ACTIONS</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {(!invoices || invoices.length === 0) ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400 gap-3">
                                            <div className="p-4 rounded-full bg-slate-50">
                                                <FileText className="h-8 w-8 opacity-20" />
                                            </div>
                                            <p className="text-sm font-medium text-slate-500">No transactions found</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                invoices.map((inv) => (
                                    <TableRow key={inv.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                                        <TableCell className="py-4 pl-6 text-sm text-slate-600">
                                            {format(new Date(inv.date), 'dd/MM/yyyy')}
                                        </TableCell>
                                        <TableCell className="py-4 text-sm text-slate-500 font-medium">
                                            {inv.invoice_number}
                                        </TableCell>
                                        <TableCell className="py-4 text-sm font-medium text-slate-700">
                                            {inv.party_name}
                                        </TableCell>
                                        <TableCell className="py-4 text-sm text-slate-500">
                                            Sale
                                        </TableCell>
                                        <TableCell className="py-4 text-sm text-slate-500 capitalize">
                                            {inv.payment_status || 'Unpaid'}
                                        </TableCell>
                                        <TableCell className="py-4 text-sm font-semibold text-slate-700 text-right">
                                            ₹ {inv.grand_total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </TableCell>
                                        <TableCell className="py-4 text-sm text-slate-500 text-right">
                                            {/* Logic: if paid 0, else total */}
                                            ₹ {(inv.payment_status === 'paid' ? 0 : inv.grand_total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </TableCell>
                                        <TableCell className="py-4 pr-6 text-right">
                                            <div className="flex justify-end gap-3 text-slate-300 group-hover:text-slate-400 transition-colors">
                                                <Printer className="h-4 w-4 hover:text-slate-600 cursor-pointer" />
                                                <Share2 className="h-4 w-4 hover:text-slate-600 cursor-pointer" />
                                                <MoreVertical className="h-4 w-4 hover:text-slate-600 cursor-pointer" />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    )
}
