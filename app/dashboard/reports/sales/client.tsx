"use client"

import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"

export type SalesReportItem = {
    id: string
    date: string
    invoiceNumber: string
    partyName: string
    grandTotal: number
    paymentStatus: string
}

export const columns: ColumnDef<SalesReportItem>[] = [
    {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => format(new Date(row.getValue("date")), "dd/MM/yyyy"),
    },
    {
        accessorKey: "invoiceNumber",
        header: "Invoice #",
    },
    {
        accessorKey: "partyName",
        header: "Customer",
    },
    {
        accessorKey: "paymentStatus",
        header: "Status",
        cell: ({ row }) => <span className="capitalize">{(row.getValue("paymentStatus") as string)?.toLowerCase()}</span>,
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

export function SalesReportClient({ data }: { data: any[] }) {
    return (
        <DataTable columns={columns} data={data} searchKey="partyName" />
    )
}
