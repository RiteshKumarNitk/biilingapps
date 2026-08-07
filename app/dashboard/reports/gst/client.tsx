"use client"

import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"

export type GSTReportItem = {
    id: string
    description: string
    quantity: number
    unitPrice: number
    gstRate: number
    taxAmount: number
    totalAmount: number
    invoice: {
        date: string
        invoiceNumber: string
        partyName: string
        grandTotal: number
    }
}

export const columns: ColumnDef<GSTReportItem>[] = [
    {
        accessorKey: "invoice.date",
        header: "Date",
        cell: ({ row }) => format(new Date(row.original.invoice.date), "dd/MM/yyyy"),
    },
    {
        accessorKey: "invoice.invoiceNumber",
        header: "Invoice #",
    },
    {
        accessorKey: "invoice.partyName",
        header: "Customer",
    },
    {
        accessorKey: "gstRate",
        header: () => <div className="text-right">GST %</div>,
        cell: ({ row }) => <div className="text-right">{row.getValue("gstRate")}%</div>,
    },
    {
        id: "taxable_value",
        header: () => <div className="text-right">Taxable Value</div>,
        cell: ({ row }) => {
            // Back calculate taxable if needed, but usually (Qty * Price) - Discount
            // However, createInvoice logic: unit_price IS taxable price (if taxType was exclusive logic stored)
            // Ideally we calculate: (Total - Tax)
            const total = row.original.totalAmount
            const tax = row.original.taxAmount || 0
            const taxable = total - tax
            return <div className="text-right">₹ {taxable.toFixed(2)}</div>
        },
    },
    {
        accessorKey: "taxAmount",
        header: () => <div className="text-right">Tax Amt</div>,
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("taxAmount"))
            return <div className="text-right font-medium">₹ {amount.toFixed(2)}</div>
        },
    },
    {
        accessorKey: "totalAmount",
        header: () => <div className="text-right">Total</div>,
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("totalAmount"))
            return <div className="text-right font-medium">₹ {amount.toFixed(2)}</div>
        },
    },
]

export function GSTReportClient({ data }: { data: any[] }) {
    return (
        <DataTable columns={columns} data={data} searchKey="invoice.partyName" />
    )
}
