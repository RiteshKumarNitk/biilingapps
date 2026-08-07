"use client"

import React, { useState, useMemo, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Phone, Mail, MapPin, PenLine, Bell,
    Printer, Download, Search, Trash2, Eye,
    Loader2, RefreshCw
} from 'lucide-react'
import Link from 'next/link'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { deleteParty } from '@/actions/parties'
import { toast } from 'sonner'
import { AmountDisplay } from '@/components/shared'
import * as XLSX from 'xlsx'
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    flexRender,
    createColumnHelper,
    SortingState
} from '@tanstack/react-table'

interface PartyDetailsProps {
    party: any
    ledger: any[]
    isLoading?: boolean
    onUpdate?: () => void
}

const columnHelper = createColumnHelper<any>()

export function PartyDetails({ party, ledger, isLoading = false, onUpdate }: PartyDetailsProps) {
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState('')
    const [filterType, setFilterType] = useState('all')
    const [sorting, setSorting] = useState<SortingState>([])

    async function handleDelete() {
        if (confirm('Are you sure you want to delete this party? This action cannot be undone.')) {
            try {
                await deleteParty(party.id)
                toast.success('Party deleted successfully')
                router.refresh()
            } catch (error: any) {
                toast.error(error.message || 'Failed to delete party')
            }
        }
    }

    // Combine API ledger with Opening Balance & Calculate Running Balance
    const fullLedger = useMemo(() => {
        const list = [...(ledger || [])].sort((a, b) => new Date(a.date || a.created_at).getTime() - new Date(b.date || b.created_at).getTime())

        // Calculate Running Balance
        let balance = party?.opening_balance || 0
        if (party?.type === 'supplier') balance = -balance

        const openingEntry = {
            id: 'opening-balance',
            type: 'opening_balance',
            ref: '-',
            date: party?.as_of_date || party?.created_at,
            amount: Math.abs(party?.opening_balance || 0),
            grand_total: Math.abs(party?.opening_balance || 0),
            is_opening: true,
            running_balance: balance
        }

        const calculatedList = list.map(txn => {
            const type = txn.type
            const amount = txn.amount || txn.grand_total || 0

            if (type === 'invoice') {
                balance += amount
                if (txn.received_amount > 0) {
                    balance -= txn.received_amount
                }
            } else if (type === 'purchase_order') {
                balance -= amount
            } else if (type === 'payment' || type === 'payment_in') {
                balance -= amount
            } else if (type === 'payment_out') {
                balance += amount
            } else if (type === 'credit_note') {
                balance -= amount
            } else if (type === 'debit_note') {
                balance += amount
            }
            return { ...txn, running_balance: balance }
        })

        if (party?.opening_balance && party?.opening_balance !== 0) {
            return [openingEntry, ...calculatedList].reverse()
        }

        return calculatedList.reverse()

    }, [ledger, party])

    // Filter Logic
    const filteredLedger = useMemo(() => {
        return fullLedger.filter(txn => {
            const matchesSearch =
                (txn.invoice_number?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                (txn.po_number?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                (txn.ref?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                (txn.type?.toLowerCase() || '').includes(searchQuery.toLowerCase())

            const matchesType = filterType === 'all' || txn.type === filterType

            return matchesSearch && matchesType
        })
    }, [fullLedger, searchQuery, filterType])

    // React Table Columns
    const columns = useMemo(() => [
        columnHelper.accessor('type', {
            header: 'Type',
            cell: info => (
                <Badge variant="outline" className={cn(
                    "font-normal capitalize",
                    info.getValue() === 'invoice' && "bg-blue-50 text-blue-600 border-blue-200",
                    info.getValue() === 'purchase_order' && "bg-purple-50 text-purple-600 border-purple-200",
                    (info.getValue() === 'payment' || info.getValue() === 'payment_in') && "bg-green-50 text-green-600 border-green-200",
                    info.getValue() === 'payment_out' && "bg-amber-50 text-amber-600 border-amber-200",
                    info.getValue() === 'credit_note' && "bg-orange-50 text-orange-600 border-orange-200",
                    info.getValue() === 'debit_note' && "bg-cyan-50 text-cyan-600 border-cyan-200",
                    info.getValue() === 'opening_balance' && "bg-slate-100 text-slate-600 border-slate-200",
                )}>
                    {info.getValue() === 'invoice' ? 'Sale' : info.getValue().replace('_', ' ')}
                </Badge>
            )
        }),
        columnHelper.accessor(row => row.invoice_number || row.po_number || row.ref || row.receipt_no || '-', {
            id: 'ref',
            header: 'Number',
            cell: info => <span className="text-slate-500 text-xs font-medium">{info.getValue()}</span>
        }),
        columnHelper.accessor(row => row.date || row.created_at, {
            id: 'date',
            header: 'Date',
            cell: info => <span className="text-slate-500 text-xs">{format(new Date(info.getValue()), 'dd MMM yyyy')}</span>
        }),
        columnHelper.accessor(row => row.amount || row.grand_total, {
            id: 'amount',
            header: () => <div className="text-right">Amount</div>,
            cell: info => <div className="text-right font-medium text-slate-700">₹ {info.getValue()?.toLocaleString()}</div>
        }),
        columnHelper.accessor('running_balance', {
            header: () => <div className="text-right">Balance</div>,
            cell: info => (
                <div className="text-right font-medium">
                    <span className={cn(
                        info.getValue() >= 0 ? "text-green-600" : "text-red-600"
                    )}>
                        ₹ {Math.abs(info.getValue()).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        <span className="text-[10px] ml-1 uppercase text-slate-400 font-normal">
                            {info.getValue() >= 0 ? 'Dr' : 'Cr'}
                        </span>
                    </span>
                </div>
            )
        }),
        columnHelper.display({
            id: 'actions',
            cell: () => (
                <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-blue-600">
                    <Eye className="h-3 w-3" />
                </Button>
            )
        })
    ], [])

    const table = useReactTable({
        data: filteredLedger,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        initialState: {
            pagination: {
                pageSize: 20
            }
        }
    })

    const handleExport = () => {
        const dataToExport = filteredLedger.map(row => ({
            Date: format(new Date(row.date || row.created_at), 'dd-MM-yyyy'),
            Type: row.type === 'invoice' ? 'Sale' : row.type.replace('_', ' '),
            Reference: row.invoice_number || row.po_number || row.ref || '-',
            Amount: row.amount || row.grand_total,
            Balance: row.running_balance,
            BalanceType: row.running_balance >= 0 ? 'Dr' : 'Cr'
        }))

        const ws = XLSX.utils.json_to_sheet(dataToExport)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, "Ledger")
        XLSX.writeFile(wb, `${party.name}_Ledger.xlsx`)
    }

    // Derived Balance from Ledger to ensure consistency
    // fullLedger is sorted Newest First (reversed), so the first entry (Index 0) holds the latest running balance.
    const latestLedgerEntry = fullLedger.length > 0 ? fullLedger[0] : null
    const computedBalance = latestLedgerEntry ? latestLedgerEntry.running_balance : (party?.current_balance || 0)

    const handleSync = async () => {
        const { recalculatePartyBalance } = await import('@/actions/parties')
        const toastId = toast.loading("Syncing...")
        try {
            await recalculatePartyBalance(party.id)
            router.refresh()
            if (onUpdate) onUpdate()
            toast.success("Synced", { id: toastId })
        } catch (e: any) {
            toast.error("Failed", { id: toastId })
        }
    }

    const hasAutoSynced = useRef(false)

    // Self-healing: if DB balance differs from calculated ledger balance, trigger sync
    useEffect(() => {
        if (isLoading || !party || hasAutoSynced.current) return

        // If ledger is empty, we can't be sure, but if it has items, we know the true balance.
        if (fullLedger.length > 0) {
            const calculated = fullLedger[0].running_balance
            const dbValue = party.current_balance || 0

            // Tolerance of 1 rupee for rounding differences
            if (Math.abs(calculated - dbValue) > 1.0) {
                console.log(`[AutoSync] Mismatch detected. Ledger: ${calculated}, DB: ${dbValue}. Syncing...`)
                hasAutoSynced.current = true

                // Show a gentle toast
                // toast.info("Syncing balance...", { duration: 1000 })
                handleSync()
            }
        }
    }, [fullLedger, party, isLoading])

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
                        <Link href={`/dashboard/parties/${party.id}/edit`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600">
                                <PenLine className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-red-600"
                            onClick={handleDelete}
                        >
                            <Trash2 className="h-4 w-4" />
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
                        <span className="text-xs text-slate-500 font-medium uppercase tracking-wide flex items-center gap-2">
                            Outstanding Balance
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 text-slate-400 hover:text-blue-600"
                                title="Recalculate Balance"
                                onClick={async (e) => {
                                    e.stopPropagation()
                                    toast.promise(
                                        async () => {
                                            const { recalculatePartyBalance } = await import('@/actions/parties')
                                            await recalculatePartyBalance(party.id)
                                            router.refresh()
                                            if (onUpdate) onUpdate()
                                        },
                                        {
                                            loading: 'Syncing balance...',
                                            success: 'Balance synced!',
                                            error: 'Failed to sync'
                                        }
                                    )
                                }}
                            >
                                <RefreshCw className="h-3 w-3" />
                            </Button>
                        </span>
                        <div className="flex items-center gap-2 font-bold text-lg">
                            <AmountDisplay
                                amount={computedBalance}
                                colorByValue
                                signLabels={{ positive: 'Dr', negative: 'Cr' }}
                            />
                        </div>
                    </div>

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
                            {party.billing_address || '-'}
                        </div>
                    </div>

                    {party.shipping_address && party.shipping_address !== party.billing_address && (
                        <div className="flex flex-col gap-1 min-w-[200px]">
                            <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">Shipping Address</span>
                            <div className="flex items-start gap-2 font-medium text-slate-700 leading-snug">
                                <MapPin className="h-3 w-3 text-slate-400 mt-0.5" />
                                {party.shipping_address}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 2. TRANSACTIONS LEDGER */}
            <div className="flex-1 flex flex-col p-6 overflow-hidden">
                <div className="bg-white rounded-lg border shadow-sm flex flex-col h-full overflow-hidden">
                    {/* Toolbar */}
                    <div className="p-4 border-b flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-4">
                            <h3 className="font-bold text-slate-700">Transactions</h3>

                            {/* Type Filter */}
                            <select
                                className="h-8 text-xs border-none bg-transparent font-medium text-slate-500 focus:ring-0 cursor-pointer"
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                            >
                                <option value="all">All Transactions</option>
                                <option value="invoice">Invoices</option>
                                <option value="purchase_order">Purchases</option>
                                <option value="payment_in">Payment Received</option>
                                <option value="payment_out">Payment Made</option>
                                <option value="credit_note">Credit Notes</option>
                                <option value="debit_note">Debit Notes</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2 h-4 w-4 text-slate-400" />
                                <input
                                    placeholder="Search..."
                                    className="pl-9 h-8 w-40 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500"><Printer className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500" onClick={handleExport} title="Download Excel"><Download className="h-4 w-4" /></Button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="flex-1 overflow-auto relative">
                        {isLoading ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10 transition-all">
                                <div className="flex flex-col items-center gap-2 text-slate-500">
                                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                                    <p className="text-sm font-medium">Fetching transactions...</p>
                                </div>
                            </div>
                        ) : null}

                        <Table>
                            <TableHeader className="bg-slate-50 sticky top-0 z-10">
                                {table.getHeaderGroups().map(headerGroup => (
                                    <TableRow key={headerGroup.id} className="hover:bg-slate-50">
                                        {headerGroup.headers.map(header => (
                                            <TableHead key={header.id} className="font-semibold text-slate-600">
                                                {header.isPlaceholder ? null : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {table.getRowModel().rows.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} className="text-center h-32 text-slate-400">
                                            No transactions found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    table.getRowModel().rows.map(row => (
                                        <TableRow key={row.id} className="hover:bg-slate-50 border-b-slate-100">
                                            {row.getVisibleCells().map(cell => (
                                                <TableCell key={cell.id}>
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </TableCell>
                                            ))}
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
