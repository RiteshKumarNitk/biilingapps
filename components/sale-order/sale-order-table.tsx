'use client'

import React, { useState } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { MoreVertical, Trash2, Eye, Edit, Repeat } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import { deleteSaleOrder, convertOrdersToInvoice } from '@/actions/sale-orders'
import { toast } from 'sonner'
import { useLoading } from '@/components/providers/loading-provider'
import { cn } from '@/lib/utils'

interface SaleOrderTableProps {
    data: any[]
}

export function SaleOrderTable({ data }: SaleOrderTableProps) {
    const { showLoader, hideLoader } = useLoading()
    const [selected, setSelected] = useState<string[]>([])

    const toggleSelectAll = () => {
        if (selected.length === data.length) setSelected([])
        else setSelected(data.map(d => d.id))
    }

    const toggleSelect = (id: string) => {
        if (selected.includes(id)) setSelected(selected.filter(s => s !== id))
        else setSelected([...selected, id])
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this Sale Order?')) return
        try {
            showLoader()
            await deleteSaleOrder(id)
            toast.success('Sale Order deleted')
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            hideLoader()
        }
    }

    const handleBulkConvert = async () => {
        if (!confirm(`Convert ${selected.length} orders to Sale Invoices?`)) return
        try {
            showLoader()
            await convertOrdersToInvoice(selected)
            toast.success('Orders converted successfully')
            setSelected([])
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            hideLoader()
        }
    }

    const handleConvertSingle = async (id: string) => {
        // Same logic as bulk but for one
        try {
            showLoader()
            await convertOrdersToInvoice([id])
            toast.success('Order converted to Invoice')
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            hideLoader()
        }
    }

    return (
        <div className="space-y-4">
            {/* Bulk Actions Bar */}
            {selected.length > 0 && (
                <div className="bg-blue-50 p-2 px-4 rounded-md flex items-center justify-between border border-blue-100 animate-in fade-in slide-in-from-top-2">
                    <span className="text-sm font-medium text-blue-700">{selected.length} selected</span>
                    <Button size="sm" variant="outline" onClick={handleBulkConvert} className="border-blue-200 text-blue-600 hover:bg-blue-100">
                        <Repeat className="h-4 w-4 mr-2" /> Convert to Sale
                    </Button>
                </div>
            )}

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead className="w-[50px]">
                                <Checkbox
                                    checked={data.length > 0 && selected.length === data.length}
                                    onCheckedChange={toggleSelectAll}
                                />
                            </TableHead>
                            <TableHead className="font-semibold text-slate-600">Party</TableHead>
                            <TableHead className="font-semibold text-slate-600">No.</TableHead>
                            <TableHead className="font-semibold text-slate-600">Date</TableHead>
                            <TableHead className="font-semibold text-slate-600">Due Date</TableHead>
                            <TableHead className="text-right font-semibold text-slate-600">Total Amount</TableHead>
                            <TableHead className="text-right font-semibold text-slate-600">Balance</TableHead>
                            <TableHead className="font-semibold text-slate-600">Type</TableHead>
                            <TableHead className="font-semibold text-slate-600">Status</TableHead>
                            <TableHead className="w-[120px] font-semibold text-slate-600">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={10} className="h-24 text-center text-slate-500">
                                    No Sale Orders found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((order) => {
                                const isConverted = order.status === 'converted'
                                const isOverdue = order.status === 'overdue'

                                return (
                                    <TableRow key={order.id} className="hover:bg-slate-50 border-b border-slate-100 last:border-0">
                                        <TableCell>
                                            <Checkbox
                                                checked={selected.includes(order.id)}
                                                onCheckedChange={() => toggleSelect(order.id)}
                                                disabled={isConverted} // Cannot select already converted? Or maybe allow to re-convert? Usually NOT.
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Link href={`/dashboard/parties/${order.party_id}`} className="text-blue-600 hover:underline font-medium">
                                                {order.party_name}
                                            </Link>
                                        </TableCell>
                                        <TableCell className="text-slate-600 font-medium">{order.order_number}</TableCell>
                                        <TableCell className="text-slate-600">
                                            {format(new Date(order.date), 'dd/MM/yyyy')}
                                        </TableCell>
                                        <TableCell className="text-slate-600">
                                            {order.due_date ? format(new Date(order.due_date), 'dd/MM/yyyy') : '-'}
                                        </TableCell>
                                        <TableCell className="text-right font-medium text-slate-700">
                                            ₹{Number(order.grand_total).toFixed(2)}
                                        </TableCell>
                                        <TableCell className="text-right font-medium text-slate-700">
                                            {/* Balance is full amount unless payments linked (not in scope) or converted (0 balance logic?) 
                                                Vyapar keeps balance as full amount for SO until closed/converted. 
                                                Let's show full amount for Open. 
                                                If converted, maybe balance is 0 or '-'? 
                                                User request: "Balance" logic not fully specified but "Same as total (until converted)". 
                                                So if converted, show 0? 
                                            */}
                                            {isConverted ? '₹0.00' : `₹${Number(order.grand_total).toFixed(2)}`}
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-slate-500 text-sm">Sale Order</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className={cn(
                                                "px-2 py-1 rounded-full text-xs font-semibold capitalize border",
                                                isConverted ? "bg-green-50 text-green-600 border-green-200" :
                                                    isOverdue ? "bg-orange-50 text-orange-600 border-orange-200" :
                                                        "bg-slate-100 text-slate-600 border-slate-200"
                                            )}>
                                                {order.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="flex items-center gap-2">
                                            {/* Primary Action: Convert */}
                                            {!isConverted && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-7 px-2 text-blue-600 border-blue-200 hover:bg-blue-50 text-xs"
                                                    onClick={() => handleConvertSingle(order.id)}
                                                >
                                                    Convert
                                                </Button>
                                            )}

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>
                                                        <Eye className="mr-2 h-4 w-4" /> View
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem disabled={isConverted}>
                                                        <Edit className="mr-2 h-4 w-4" /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(order.id)} disabled={isConverted}>
                                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
