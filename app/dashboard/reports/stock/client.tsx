"use client"

import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"

export type StockReportItem = {
    id: string
    name: string
    stockQuantity: number
    price: number // Selling Price
    costPrice: number // Purchase Price
}

export const columns: ColumnDef<StockReportItem>[] = [
    {
        accessorKey: "name",
        header: "Product Name",
    },
    {
        accessorKey: "stockQuantity",
        header: () => <div className="text-right">Current Stock</div>,
        cell: ({ row }) => <div className="text-right font-medium">{row.getValue("stockQuantity")}</div>,
    },
    {
        accessorKey: "price",
        header: () => <div className="text-right">Selling Price</div>,
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("price"))
            return <div className="text-right">₹ {amount.toFixed(2)}</div>
        },
    },
    {
        id: "stock_value",
        header: () => <div className="text-right">Stock Value (SP)</div>,
        cell: ({ row }) => {
            const qty = parseFloat(row.getValue("stockQuantity") as any)
            const price = parseFloat(row.getValue("price") as any)
            return <div className="text-right font-bold">₹ {(qty * price).toFixed(2)}</div>
        },
    },
]

export function StockReportClient({ data }: { data: any[] }) {
    return (
        <DataTable columns={columns} data={data} searchKey="name" />
    )
}
