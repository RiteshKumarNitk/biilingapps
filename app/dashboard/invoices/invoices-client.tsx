"use client"

import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { Eye, Printer, Share2 } from "lucide-react"
import Link from "next/link"
import { DeleteInvoiceButton } from "@/components/invoices/delete-invoice-button"

// Define the Invoice type based on the data structure
// Simplified for display
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
        header: "DATE",
        cell: ({ row }) => format(new Date(row.getValue("date")), "dd/MM/yyyy"),
    },
    {
        accessorKey: "invoice_number",
        header: "INVOICE NO",
    },
    {
        accessorKey: "party_name",
        header: "PARTY NAME",
    },
    {
        id: "type",
        header: "TRANSACTION TYPE",
        cell: () => "Sale",
    },
    {
        accessorKey: "payment_status",
        header: "PAYMENT TYPE",
        cell: ({ row }) => (
            <span className="capitalize">{row.getValue("payment_status") || "Unpaid"}</span>
        ),
    },
    {
        accessorKey: "grand_total",
        header: () => <div className="text-right">AMOUNT</div>,
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("grand_total"))
            return <div className="text-right font-semibold text-slate-700">₹ {amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
        },
    },
    {
        id: "balance",
        header: () => <div className="text-right">BALANCE</div>,
        cell: ({ row }) => {
            // Simple logic: if paid 0, else total
            const status = row.getValue("payment_status")
            const total = parseFloat(row.getValue("grand_total"))
            const balance = status === 'paid' ? 0 : total
            return <div className="text-right text-slate-500">₹ {balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
        },
    },
    {
        id: "actions",
        header: () => <div className="text-right pr-6">ACTIONS</div>,
        cell: ({ row }) => {
            const invoice = row.original
            return (
                <div className="flex justify-end gap-3 text-slate-300 pr-6">
                    <Link href={`/dashboard/invoices/${invoice.id}`} title="View Details">
                        <Eye className="h-4 w-4 hover:text-blue-600 cursor-pointer text-slate-400" />
                    </Link>
                    <Link href={`/print/invoices/${invoice.id}`} target="_blank" title="Print Preview">
                        <Printer className="h-4 w-4 hover:text-slate-600 cursor-pointer" />
                    </Link>
                    <Share2 className="h-4 w-4 hover:text-slate-600 cursor-pointer" />
                    <DeleteInvoiceButton id={invoice.id} />
                </div>
            )
        },
    },
]

export function InvoicesClient({ data }: { data: Invoice[] }) {
    return (
        <DataTable columns={columns} data={data} searchKey="party_name" searchPlaceholder="Search by party..." />
    )
}
