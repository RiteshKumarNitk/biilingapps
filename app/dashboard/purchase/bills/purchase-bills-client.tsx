"use client"

import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { Eye, Printer, Share2 } from "lucide-react"
import Link from "next/link"
import { DeletePurchaseButton } from "@/components/purchase/delete-purchase-button"

// Type Definition
export type PurchaseBill = {
    id: string
    date: string
    po_number: string
    party_name: string
    status: string
    grand_total: number
}

// Columns
export const columns: ColumnDef<PurchaseBill>[] = [
    {
        accessorKey: "date",
        header: "DATE",
        cell: ({ row }) => format(new Date(row.getValue("date")), "dd/MM/yyyy"),
    },
    {
        accessorKey: "po_number",
        header: "BILL NO",
    },
    {
        accessorKey: "party_name",
        header: "PARTY NAME",
    },
    {
        id: "type",
        header: "TYPE",
        cell: () => "Purchase",
    },
    {
        accessorKey: "status",
        header: "STATUS",
        cell: ({ row }) => (
            <span className="capitalize">{row.getValue("status")}</span>
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
        id: "actions",
        header: () => <div className="text-right pr-6">ACTIONS</div>,
        cell: ({ row }) => {
            const bill = row.original
            return (
                <div className="flex justify-end gap-3 text-slate-300 pr-6">
                    <Link href={`/dashboard/purchase/bills/${bill.id}`} title="View Details">
                        <Eye className="h-4 w-4 hover:text-blue-600 cursor-pointer text-slate-400" />
                    </Link>
                    {/* Placeholder for Print/Share */}
                    <Printer className="h-4 w-4 hover:text-slate-600 cursor-pointer" />
                    <Share2 className="h-4 w-4 hover:text-slate-600 cursor-pointer" />

                    <DeletePurchaseButton id={bill.id} />
                </div>
            )
        },
    },
]

export function PurchaseBillsClient({ data }: { data: PurchaseBill[] }) {
    return (
        <DataTable columns={columns} data={data} searchKey="party_name" searchPlaceholder="Search by party..." />
    )
}
