"use client"

import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { Eye, Printer, Share2, MoreHorizontal, Copy, Trash2 } from "lucide-react"
import Link from "next/link"
import { DeleteInvoiceButton } from "@/components/invoices/delete-invoice-button"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Define the Invoice type based on the data structure
export type Invoice = {
    id: string
    date: string
    invoice_number: string
    party_name: string
    payment_status: 'paid' | 'unpaid' | 'partial'
    grand_total: number
}

// Columns Definition
export const columns: ColumnDef<Invoice>[] = [
    {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => (
            <div className="font-medium text-slate-600">
                {format(new Date(row.getValue("date")), "dd MMM yyyy")}
            </div>
        ),
    },
    {
        accessorKey: "invoice_number",
        header: "Invoice #",
        cell: ({ row }) => (
            <div className="font-semibold text-slate-800">
                {row.getValue("invoice_number")}
            </div>
        ),
    },
    {
        accessorKey: "party_name",
        header: "Client",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-xs font-bold text-blue-600 border border-blue-100 uppercase">
                    {(row.getValue("party_name") as string || 'U').substring(0, 2)}
                </div>
                <span className="font-medium text-slate-700">{row.getValue("party_name")}</span>
            </div>
        ),
    },
    {
        accessorKey: "payment_status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("payment_status") as string
            let variant: "default" | "secondary" | "destructive" | "outline" = "outline"
            let className = ""

            if (status === 'paid') {
                className = "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200"
                variant = "secondary" // using custom class instead of relying purely on variants
            } else if (status === 'partial') {
                className = "bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200"
                variant = "secondary"
            } else {
                className = "bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200"
                variant = "secondary"
            }

            return (
                <Badge variant={variant} className={`capitalize font-normal px-2.5 py-0.5 ${className}`}>
                    {status || "Unpaid"}
                </Badge>
            )
        },
    },
    {
        accessorKey: "grand_total",
        header: () => <div className="text-right">Amount</div>,
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("grand_total"))
            return <div className="text-right font-bold text-slate-800">₹ {amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
        },
    },
    {
        id: "view",
        header: () => <div className="text-center font-semibold">Details</div>,
        cell: ({ row }) => (
            <div className="flex justify-center text-center">
                <Link href={`/dashboard/invoices/${row.original.id}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50/50">
                        <Eye className="h-4 w-4" />
                    </Button>
                </Link>
            </div>
        ),
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
            const invoice = row.original
            const total = parseFloat(row.getValue("grand_total"))
            const balance = invoice.payment_status === 'paid' ? 0 : total

            return (
                <div className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[180px]">
                            <DropdownMenuLabel className="flex flex-col">
                                <span>Actions</span>
                                <span className="text-[10px] text-slate-500 font-normal mt-0.5">
                                    Balance: ₹ {balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </span>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href={`/dashboard/invoices/${invoice.id}`} className="cursor-pointer">
                                    <Eye className="mr-2 h-4 w-4" /> View Details
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href={`/print/invoices/${invoice.id}`} target="_blank" className="cursor-pointer">
                                    <Printer className="mr-2 h-4 w-4" /> Print Invoice
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                                navigator.clipboard.writeText(invoice.invoice_number)
                            }}>
                                <Copy className="mr-2 h-4 w-4" /> Copy Invoice #
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <div className="px-2 py-1.5 text-sm outline-none transition-colors hover:bg-rose-50 hover:text-rose-600 cursor-pointer rounded-sm">
                                <DeleteInvoiceButton id={invoice.id} />
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        },
    },
]

export function InvoicesClient({ data }: { data: Invoice[] }) {
    return (
        <DataTable
            columns={columns}
            data={data}
        />
    )
}
