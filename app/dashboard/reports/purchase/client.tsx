"use client"

import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"

export type PurchaseReportItem = {
    id: string
    date: string
    po_number: string // bill number
    party_name: string
    grand_total: number
    status: string
}

export const columns: ColumnDef<PurchaseReportItem>[] = [
    {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => format(new Date(row.getValue("date")), "dd/MM/yyyy"),
    },
    {
        accessorKey: "po_number",
        header: "Bill #",
    },
    {
        accessorKey: "party_name",
        header: "Supplier",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <span className="capitalize">{row.getValue("status")}</span>,
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

export function PurchaseReportClient({ data }: { data: any[] }) {
    return (
        <DataTable columns={columns} data={data} searchKey="party_name" />
    )
}
