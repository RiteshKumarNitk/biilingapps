"use client"

import { useState, useMemo, useEffect } from 'react'
import { Search, Plus, ExternalLink, MoreVertical, SlidersHorizontal, ArrowUpRight, ArrowDownLeft, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { AdjustItemDialog } from '@/components/inventory/adjust-item-dialog'
import { getProductTransactions, deleteProduct } from '@/actions/inventory'

interface ProductManagerProps {
    items: any[]
    transactions?: any[]
    onSelect: (item: any) => void
    selectedItem: any | null
    onRefresh?: () => void
}

export function ProductManager({ items, selectedItem, onSelect, onRefresh }: ProductManagerProps) {
    const [search, setSearch] = useState('')
    const [adjustDialogOpen, setAdjustDialogOpen] = useState(false)
    const [transactions, setTransactions] = useState<any[]>([])
    const [loadingTxns, setLoadingTxns] = useState(false)
    const router = useRouter()

    const filteredItems = useMemo(() => {
        return items.filter(i =>
            i.name.toLowerCase().includes(search.toLowerCase())
        )
    }, [items, search])

    useEffect(() => {
        if (selectedItem?.id) {
            setLoadingTxns(true)
            getProductTransactions(selectedItem.id)
                .then(data => setTransactions(data || []))
                .catch(err => console.error(err))
                .finally(() => setLoadingTxns(false))
        } else {
            setTransactions([])
        }
    }, [selectedItem])

    const handleDelete = async () => {
        if (!selectedItem) return
        if (confirm(`Are you sure you want to delete ${selectedItem.name}?`)) {
            try {
                await deleteProduct(selectedItem.id)
                toast.success("Product deleted")
                if (onRefresh) onRefresh()
                onSelect(null)
            } catch (error: any) {
                toast.error(error.message)
            }
        }
    }

    return (
        <div className="flex flex-1 overflow-hidden h-full">
            {/* LEFT PANEL: LIST */}
            <aside className="w-[320px] flex flex-col border-r bg-white h-full shrink-0">
                {/* Search Header */}
                <div className="p-3 border-b space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search Item..."
                                className="pl-9 h-10 bg-slate-50 border-slate-200 focus-visible:ring-blue-500"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Link href="/dashboard/inventory/new">
                            <Button className="bg-orange-500 hover:bg-orange-600 text-white shadow-sm h-10 px-4">
                                <Plus className="h-5 w-5" />
                            </Button>
                        </Link>
                    </div>
                    <div className="flex items-center justify-between px-1">
                        <span className="text-xs font-bold text-slate-400">ITEM</span>
                        <span className="text-xs font-bold text-slate-400">QUANTITY</span>
                    </div>
                </div>

                {/* List */}
                <ScrollArea className="flex-1">
                    {filteredItems.map(item => (
                        <div
                            key={item.id}
                            onClick={() => onSelect(item)}
                            className={cn(
                                "flex items-center justify-between p-3 border-b hover:bg-slate-50 cursor-pointer transition-colors",
                                selectedItem?.id === item.id ? "bg-blue-50 border-l-4 border-l-blue-600 border-b-blue-100" : "border-l-4 border-l-transparent"
                            )}
                        >
                            <div className="flex flex-col gap-0.5 max-w-[70%]">
                                <span className={cn("font-medium text-sm truncate", selectedItem?.id === item.id ? "text-blue-700" : "text-slate-700")}>
                                    {item.name}
                                </span>
                            </div>
                            <span className={cn(
                                "font-mono text-sm font-medium",
                                item.stock_quantity <= (item.low_stock_threshold || 0) ? "text-red-600" : "text-emerald-600"
                            )}>
                                {item.stock_quantity}
                            </span>
                        </div>
                    ))}
                    {filteredItems.length === 0 && (
                        <div className="p-8 text-center text-slate-400 text-sm">No items found</div>
                    )}
                </ScrollArea>
            </aside>

            {/* RIGHT PANEL: DETAILS */}
            <main className="flex-1 flex flex-col bg-[#F5F7FA] overflow-hidden relative">
                {selectedItem ? (
                    <>
                        {/* Header Card */}
                        <div className="m-4 bg-white rounded-lg shadow-sm border p-5 shrink-0">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">{selectedItem.name}</h2>

                                    <Link href={`/dashboard/inventory/${selectedItem.id}`}>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600">
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    </Link>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="start">
                                            <DropdownMenuItem onClick={() => router.push(`/dashboard/inventory/${selectedItem.id}`)}>
                                                <Pencil className="mr-2 h-4 w-4" /> Edit Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={handleDelete}>
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete Item
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <Button
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                                    onClick={() => setAdjustDialogOpen(true)}
                                >
                                    <SlidersHorizontal className="h-4 w-4 mr-2" /> ADJUST ITEM
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-1">
                                    <p className="text-xs text-slate-500 uppercase font-semibold">Sale Price</p>
                                    <p className="text-lg font-mono font-medium text-slate-700">
                                        ₹ {selectedItem.price?.toFixed(2)} <span className="text-xs text-slate-400 font-sans">(incl)</span>
                                    </p>
                                    <p className="text-xs text-slate-500 mt-2 uppercase font-semibold">Purchase Price</p>
                                    <p className="text-base font-mono font-medium text-slate-600">
                                        ₹ {selectedItem.cost_price?.toFixed(2) || '0.00'} <span className="text-xs text-slate-400 font-sans">(excl)</span>
                                    </p>
                                </div>
                                <div className="text-right space-y-1">
                                    <p className="text-xs text-slate-500 uppercase font-semibold">Stock Quantity</p>
                                    <p className={cn("text-lg font-mono font-bold", selectedItem.stock_quantity <= 0 ? "text-red-600" : "text-emerald-600")}>
                                        {selectedItem.stock_quantity} <span className="text-xs text-slate-400 font-sans font-normal">{selectedItem.unit}</span>
                                    </p>
                                    <p className="text-xs text-slate-500 mt-2 uppercase font-semibold">Stock Value</p>
                                    <p className="text-base font-mono font-medium text-slate-600">
                                        ₹ {((selectedItem.stock_quantity || 0) * (selectedItem.cost_price || 0)).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Transactions Table Section */}
                        <div className="flex-1 mx-4 mb-4 bg-white rounded-lg shadow-sm border flex flex-col overflow-hidden">
                            <div className="p-3 border-b flex items-center justify-between bg-slate-50/50">
                                <h3 className="font-bold text-slate-700 text-sm">TRANSACTIONS</h3>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Search..."
                                        className="h-8 w-48 text-xs bg-white"
                                        value=""
                                        onChange={() => { }}
                                        readOnly
                                    />
                                    <Button variant="outline" size="icon" className="h-8 w-8 bg-white"><MoreVertical className="h-4 w-4 text-slate-500" /></Button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-auto">
                                <Table>
                                    <TableHeader className="sticky top-0 bg-slate-50 z-10">
                                        <TableRow className="h-9 hover:bg-slate-50">
                                            <TableHead className="w-[10px]"></TableHead>
                                            <TableHead className="text-xs font-bold text-slate-500 h-9">TYPE</TableHead>
                                            <TableHead className="text-xs font-bold text-slate-500 h-9">DESCRIPTION</TableHead>
                                            <TableHead className="text-xs font-bold text-slate-500 h-9">DATE</TableHead>
                                            <TableHead className="text-xs font-bold text-slate-500 h-9 text-right">QUANTITY</TableHead>
                                            <TableHead className="text-xs font-bold text-slate-500 h-9 text-right">STATUS</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loadingTxns ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="h-32 text-center text-slate-400 text-xs">
                                                    Loading transactions...
                                                </TableCell>
                                            </TableRow>
                                        ) : transactions.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="h-32 text-center text-slate-400 text-xs">
                                                    No transactions found for this item.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            transactions.map((txn, i) => (
                                                <TableRow key={txn.id || i} className="hover:bg-slate-50 text-xs border-b-slate-100">
                                                    <TableCell></TableCell>
                                                    <TableCell className="font-semibold text-slate-700 uppercase">
                                                        <Badge variant="outline" className={cn(
                                                            "font-mono text-[10px] px-1 py-0",
                                                            txn.type === 'in' || txn.type === 'purchase_received' || txn.type === 'ADJUSTMENT_ADD' ? "text-green-600 bg-green-50 border-green-200" : "text-red-600 bg-red-50 border-red-200"
                                                        )}>
                                                            {txn.type?.replace(/_/g, ' ')}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-slate-600 font-medium">
                                                        {txn.description || txn.description || txn.notes || '-'}
                                                    </TableCell>
                                                    <TableCell className="text-slate-500">
                                                        {format(new Date(txn.created_at), 'dd MMM yyyy')}
                                                    </TableCell>
                                                    <TableCell className="text-right font-mono font-medium text-slate-700">
                                                        {txn.quantity}
                                                    </TableCell>
                                                    <TableCell className="text-right text-slate-500">
                                                        Completed
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <Search className="h-8 w-8 opacity-20" />
                        </div>
                        <p>Select an item to view details</p>
                    </div>
                )}
            </main>

            <AdjustItemDialog
                open={adjustDialogOpen}
                onOpenChange={setAdjustDialogOpen}
                product={selectedItem}
                onSuccess={onRefresh}
            />
        </div>
    )
}
