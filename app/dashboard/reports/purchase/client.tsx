"use client"

import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"

export type PurchaseReportItem = {
    id: string
    date: string
    poNumber: string // bill number
    partyName: string
    grandTotal: number
    status: string
}

export const columns: ColumnDef<PurchaseReportItem>[] = [
    {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => format(new Date(row.getValue("date")), "dd/MM/yyyy"),
    },
    {
        accessorKey: "poNumber",
        header: "Bill #",
    },
    {
        accessorKey: "partyName",
        header: "Supplier",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <span className="capitalize">{(row.getValue("status") as string)?.toLowerCase()}</span>,
    },
    {
        accessorKey: "grandTotal",
        header: () => <div className="text-right">Amount</div>,
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("grandTotal"))
            return <div className="text-right font-medium">₹ {amount.toFixed(2)}</div>
        },
    },
]

export function PurchaseReportClient({ data }: { data: any[] }) {
    return (
        <DataTable columns={columns} data={data} searchKey="partyName" />
    )
}
