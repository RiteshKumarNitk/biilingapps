"use client"

import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"

export type GSTReportItem = {
    id: string
    invoice_id: string
    description: string
    quantity: number
    unit_price: number
    gst_rate: number
    tax_amount: number
    total_amount: number
    invoices: {
        date: string
        invoice_number: string
        party_name: string
        grand_total: number
    }
}

export const columns: ColumnDef<GSTReportItem>[] = [
    {
        accessorKey: "invoices.date",
        header: "Date",
        cell: ({ row }) => format(new Date(row.original.invoices.date), "dd/MM/yyyy"),
    },
    {
        accessorKey: "invoices.invoice_number",
        header: "Invoice #",
    },
    {
        accessorKey: "invoices.party_name",
        header: "Customer",
    },
    {
        accessorKey: "gst_rate",
        header: () => <div className="text-right">GST %</div>,
        cell: ({ row }) => <div className="text-right">{row.getValue("gst_rate")}%</div>,
    },
    {
        id: "taxable_value",
        header: () => <div className="text-right">Taxable Value</div>,
        cell: ({ row }) => {
            // Back calculate taxable if needed, but usually (Qty * Price) - Discount
            // However, createInvoice logic: unit_price IS taxable price (if taxType was exclusive logic stored)
            // Ideally we calculate: (Total - Tax)
            const total = row.original.total_amount
            const tax = row.original.tax_amount || 0
            const taxable = total - tax
            return <div className="text-right">₹ {taxable.toFixed(2)}</div>
        },
    },
    {
        accessorKey: "tax_amount",
        header: () => <div className="text-right">Tax Amt</div>,
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("tax_amount"))
            return <div className="text-right font-medium">₹ {amount.toFixed(2)}</div>
        },
    },
    {
        accessorKey: "total_amount",
        header: () => <div className="text-right">Total</div>,
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("total_amount"))
            return <div className="text-right font-medium">₹ {amount.toFixed(2)}</div>
        },
    },
]

export function GSTReportClient({ data }: { data: any[] }) {
    return (
        <DataTable columns={columns} data={data} searchKey="invoices.party_name" />
    )
}
