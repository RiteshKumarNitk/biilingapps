"use client"

import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { Eye, Printer, MoreHorizontal, Edit, Trash2, CheckCircle2 } from "lucide-react"
import Link from "next/link"
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

// Define the Quotation type
export type Quotation = {
    id: string
    date: string
    quotation_number: string
    party_name: string
    status: string
    grand_total: number
    party_address?: string
}

// Columns Definition
export const columns: ColumnDef<Quotation>[] = [
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
        accessorKey: "quotation_number",
        header: "Ref #",
        cell: ({ row }) => (
            <div className="font-semibold text-slate-800">
                {row.getValue("quotation_number")}
            </div>
        ),
    },
    {
        accessorKey: "party_name",
        header: "Party Name",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center text-xs font-bold text-indigo-600 border border-indigo-100 uppercase">
                    {(row.getValue("party_name") as string || 'U').substring(0, 2)}
                </div>
                <div className="flex flex-col">
                    <span className="font-medium text-slate-700">{row.getValue("party_name")}</span>
                    {row.original.party_address && (
                        <span className="text-[10px] text-slate-400 truncate max-w-[150px]">
                            {row.original.party_address}
                        </span>
                    )}
                </div>
            </div>
        ),
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            const isConverted = status === 'converted'
            const isOpen = status === 'open' || status === 'sent' || status === 'draft'

            let variant: "default" | "secondary" | "destructive" | "outline" = "outline"
            let className = ""

            if (isConverted) {
                className = "bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
                variant = "secondary"
            } else if (isOpen) {
                className = "bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
                variant = "secondary"
            }

            return (
                <Badge variant={variant} className={`capitalize font-normal px-2.5 py-0.5 ${className}`}>
                    {status || "Draft"}
                </Badge>
            )
        },
    },
    {
        accessorKey: "grand_total",
        header: () => <div className="text-right">Amount</div>,
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("grand_total"))
            return <div className="text-right font-bold text-slate-800">₹ {amount.toLocaleString('en-IN', { minimumFractionDigits: 0 })}</div>
        },
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
            const q = row.original
            const isOpen = q.status === 'open' || q.status === 'sent' || q.status === 'draft'

            return (
                <div className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                                <Link href={`/dashboard/quotations/${q.id}`} className="cursor-pointer">
                                    <Eye className="mr-2 h-4 w-4" /> View Details
                                </Link>
                            </DropdownMenuItem>
                            {isOpen && (
                                <DropdownMenuItem asChild>
                                    <Link href={`/dashboard/quotations/${q.id}/edit`} className="cursor-pointer">
                                        <Edit className="mr-2 h-4 w-4" /> Edit Estimate
                                    </Link>
                                </DropdownMenuItem>
                            )}
                            {isOpen && (
                                <DropdownMenuItem asChild>
                                    <Link href={`/dashboard/invoices/new?from_estimate=${q.id}`} className="cursor-pointer text-blue-600 focus:text-blue-700 font-medium">
                                        <CheckCircle2 className="mr-2 h-4 w-4" /> Convert to Invoice
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
                </div>
            )
        },
    },
]

export function QuotationsTable({ data }: { data: Quotation[] }) {
    return (
        <DataTable
            columns={columns}
            data={data}
            searchKey="party_name"
            searchPlaceholder="Filter estimates..."
        />
    )
}
