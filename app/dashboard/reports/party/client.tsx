"use client"

import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"

export type PartyReportItem = {
    id: string
    name: string
    type: string
    currentBalance: number // +ve Receivable, -ve Payable usually
}

export const columns: ColumnDef<PartyReportItem>[] = [
    {
        accessorKey: "name",
        header: "Party Name",
    },
    {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => <span className="capitalize">{(row.getValue("type") as string)?.toLowerCase()}</span>,
    },
    {
        accessorKey: "currentBalance",
        header: () => <div className="text-right">Balance</div>,
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("currentBalance") || "0")
            const isReceivable = amount > 0
            return (
                <div className={`text-right font-medium ${amount > 0 ? 'text-green-600' : (amount < 0 ? 'text-red-600' : 'text-slate-500')}`}>
                    {amount === 0 ? '-' : (amount > 0 ? `To Collect: ₹${amount.toFixed(2)}` : `To Pay: ₹${Math.abs(amount).toFixed(2)}`)}
                </div>
            )
        },
    },
]

export function PartyReportClient({ data }: { data: any[] }) {
    return (
        <DataTable columns={columns} data={data} searchKey="name" />
    )
}
