'use client'

import React from 'react'
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
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button'
import { MoreVertical, Printer, Share2, Trash2, Eye } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import { deletePaymentIn } from '@/actions/payment-in'
import { toast } from 'sonner'
import { useLoading } from '@/components/providers/loading-provider'

interface PaymentInTableProps {
    data: any[]
}

export function PaymentInTable({ data }: PaymentInTableProps) {
    const { showLoader, hideLoader } = useLoading()

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this payment? This will revert the party balance.')) return
        try {
            showLoader()
            await deletePaymentIn(id)
            toast.success('Payment deleted successfully')
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            hideLoader()
        }
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <Table>
                <TableHeader className="bg-slate-50">
                    <TableRow>
                        <TableHead className="w-[120px] font-semibold text-slate-600">Date</TableHead>
                        <TableHead className="font-semibold text-slate-600">Ref. No.</TableHead>
                        <TableHead className="font-semibold text-slate-600">Party Name</TableHead>
                        <TableHead className="text-right font-semibold text-slate-600">Total Amount</TableHead>
                        <TableHead className="text-right font-semibold text-slate-600">Received</TableHead>
                        <TableHead className="font-semibold text-slate-600">Payment Type</TableHead>
                        <TableHead className="w-[80px] font-semibold text-slate-600">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center text-slate-500">
                                No payments found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((payment) => (
                            <TableRow key={payment.id} className="hover:bg-slate-50 border-b border-slate-100 last:border-0">
                                <TableCell className="text-slate-600">
                                    {format(new Date(payment.date), 'dd/MM/yyyy')}
                                </TableCell>
                                <TableCell className="text-slate-600 font-medium">{payment.payment_number}</TableCell>
                                <TableCell>
                                    <Link href={`/dashboard/parties/${payment.party_id}`} className="text-blue-600 hover:underline font-medium">
                                        {payment.party_name}
                                    </Link>
                                </TableCell>
                                <TableCell className="text-right font-medium text-slate-700">
                                    ₹{Number(payment.amount).toFixed(2)}
                                </TableCell>
                                <TableCell className="text-right font-medium text-green-600">
                                    ₹{Number(payment.amount).toFixed(2)}
                                </TableCell>
                                <TableCell>
                                    <span className="capitalize px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-medium">
                                        {payment.mode?.replace('_', ' ')}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600">
                                                <span className="sr-only">Open menu</span>
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-[160px]">
                                            <DropdownMenuItem onSelect={() => toast.info('Print feature coming soon')}>
                                                <Printer className="mr-2 h-4 w-4 text-slate-500" /> Print
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => toast.info('Share feature coming soon')}>
                                                <Share2 className="mr-2 h-4 w-4 text-slate-500" /> Share
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-red-600" onSelect={() => handleDelete(payment.id)}>
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
