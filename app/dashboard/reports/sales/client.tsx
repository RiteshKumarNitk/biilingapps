"use client"

import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"

export type SalesReportItem = {
    id: string
    date: string
    invoice_number: string
    party_name: string
    grand_total: number
    payment_status: string
}

export const columns: ColumnDef<SalesReportItem>[] = [
    {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => format(new Date(row.getValue("date")), "dd/MM/yyyy"),
    },
    {
        accessorKey: "invoice_number",
        header: "Invoice #",
    },
    {
        accessorKey: "party_name",
        header: "Customer",
    },
    {
        accessorKey: "payment_status",
        header: "Status",
        cell: ({ row }) => <span className="capitalize">{row.getValue("payment_status")}</span>,
    },
    {
        accessorKey: "grand_total",
        header: () => <div className="text-right">Amount</div>,
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("grand_total"))
            return <div className="text-right font-medium">₹ {amount.toFixed(2)}</div>
        },
    },
]

export function SalesReportClient({ data }: { data: any[] }) {
    return (
        <DataTable columns={columns} data={data} searchKey="party_name" />
    )
}
