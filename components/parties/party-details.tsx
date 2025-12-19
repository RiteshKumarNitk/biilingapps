
"use client"

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Phone, Mail, MapPin, PenLine, Bell,
    Printer, Download, Search, Trash2, Eye
} from 'lucide-react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { format } from 'date-fns'

interface PartyDetailsProps {
    party: any
    ledger: any[]
}

export function PartyDetails({ party, ledger }: PartyDetailsProps) {
    if (!party) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
                <p>Select a party to view details</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full bg-slate-50/30">
            {/* 1. HEADER SUMMARY */}
            <div className="bg-white p-6 border-b shadow-sm space-y-6">
                {/* Title & Actions */}
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold text-slate-800">{party.name}</h2>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600">
                            <PenLine className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="h-8 gap-2 text-green-600 border-green-200 bg-green-50 hover:bg-green-100 hover:text-green-700">
                            {/* Whatsapp Icon SVG or Lucide */}
                            <span className="font-bold">WA</span>
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8 text-slate-600 hover:bg-slate-100">
                            <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8 text-slate-600 hover:bg-slate-100">
                            <Bell className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Meta Info Grid */}
                <div className="flex flex-wrap gap-x-8 gap-y-4 text-sm">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">Phone Number</span>
                        <div className="flex items-center gap-2 font-medium text-slate-700">
                            <Phone className="h-3 w-3 text-slate-400" />
                            {party.phone || '-'}
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">Email</span>
                        <div className="flex items-center gap-2 font-medium text-slate-700">
                            <Mail className="h-3 w-3 text-slate-400" />
                            {party.email || '-'}
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">Credit Limit</span>
                        <div className="flex items-center gap-2 font-medium text-slate-700">
                            ₹ {party.credit_limit?.toLocaleString() || '0'}
                        </div>
                    </div>

                    <div className="flex flex-col gap-1 min-w-[200px]">
                        <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">Billing Address</span>
                        <div className="flex items-start gap-2 font-medium text-slate-700 leading-snug">
                            <MapPin className="h-3 w-3 text-slate-400 mt-0.5" />
                            {party.address || '-'}
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. TRANSACTIONS LEDGER */}
            <div className="flex-1 flex flex-col p-6 overflow-hidden">
                <div className="bg-white rounded-lg border shadow-sm flex flex-col h-full overflow-hidden">
                    {/* Toolbar */}
                    <div className="p-4 border-b flex items-center justify-between bg-slate-50/50">
                        <h3 className="font-bold text-slate-700">Transactions</h3>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2 h-4 w-4 text-slate-400" />
                                <input
                                    placeholder="Search..."
                                    className="pl-9 h-8 w-40 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500"><Printer className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500"><Download className="h-4 w-4" /></Button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="flex-1 overflow-auto">
                        <Table>
                            <TableHeader className="bg-slate-50 sticky top-0 z-10">
                                <TableRow className="hover:bg-slate-50">
                                    <TableHead className="w-[100px] font-semibold text-slate-600">Type</TableHead>
                                    <TableHead className="w-[100px] font-semibold text-slate-600">Number</TableHead>
                                    <TableHead className="w-[120px] font-semibold text-slate-600">Date</TableHead>
                                    <TableHead className="text-right font-semibold text-slate-600">Total</TableHead>
                                    <TableHead className="text-right font-semibold text-slate-600">Balance</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {ledger.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center h-32 text-slate-400">
                                            No transactions found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    ledger.map((txn, i) => (
                                        <TableRow key={txn.id || i} className="hover:bg-slate-50 border-b-slate-100">
                                            <TableCell className="font-medium text-slate-700 capitalize">
                                                {txn.type}
                                            </TableCell>
                                            <TableCell className="text-slate-500 text-xs">
                                                {txn.invoice_number || txn.po_number || txn.receipt_no || '-'}
                                            </TableCell>
                                            <TableCell className="text-slate-500 text-xs">
                                                {format(new Date(txn.date || txn.created_at), 'dd MMM yyyy')}
                                            </TableCell>
                                            <TableCell className="text-right font-medium text-slate-700">
                                                ₹ {txn.amount?.toLocaleString() || txn.grand_total?.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right font-medium text-slate-700">
                                                {/* Balance Logic Needed - Placeholder */}
                                                -
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-blue-600">
                                                    <Eye className="h-3 w-3" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </div>
    )
}
