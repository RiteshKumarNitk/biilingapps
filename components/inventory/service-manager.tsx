
"use client"

import { useState, useMemo } from 'react'
import { Search, Plus, ExternalLink, MoreVertical, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface ServiceManagerProps {
    items: any[]
    onSelect: (item: any) => void
    selectedItem: any | null
}

export function ServiceManager({ items, selectedItem, onSelect }: ServiceManagerProps) {
    const [search, setSearch] = useState('')

    const filteredItems = useMemo(() => {
        return items.filter(i =>
            i.name.toLowerCase().includes(search.toLowerCase())
        )
    }, [items, search])

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
                                placeholder="Search Service..."
                                className="pl-9 h-10 bg-slate-50 border-slate-200 focus-visible:ring-blue-500"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Link href="/dashboard/inventory/new?type=service">
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm h-10 px-4">
                                <Plus className="h-5 w-5" />
                            </Button>
                        </Link>
                    </div>

                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" className="h-8 w-8"><SlidersHorizontal className="h-3 w-3" /></Button>
                            <span className="text-xs font-semibold text-slate-500">NAME</span>
                        </div>
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
                            <span className={cn("font-medium text-sm truncate", selectedItem?.id === item.id ? "text-blue-700" : "text-slate-700")}>
                                {item.name}
                            </span>
                        </div>
                    ))}
                    {filteredItems.length === 0 && (
                        <div className="p-8 text-center text-slate-400 text-sm">No services found</div>
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
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400">
                                        <ExternalLink className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-1">
                                    <p className="text-xs text-slate-500 uppercase font-semibold">Sale Price</p>
                                    <p className="text-lg font-mono font-medium text-slate-700">
                                        ₹ {selectedItem.price?.toFixed(2)}
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
                                            <TableHead className="text-xs font-bold text-slate-500 h-9">INVOICE #</TableHead>
                                            <TableHead className="text-xs font-bold text-slate-500 h-9">NAME</TableHead>
                                            <TableHead className="text-xs font-bold text-slate-500 h-9">DATE</TableHead>
                                            <TableHead className="text-xs font-bold text-slate-500 h-9 text-right">PRICE</TableHead>
                                            <TableHead className="text-xs font-bold text-slate-500 h-9">STATUS</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-32 text-center text-slate-400 text-xs">
                                                No transactions to show
                                            </TableCell>
                                        </TableRow>
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
                        <p>Select a service to view details</p>
                    </div>
                )}
            </main>
        </div>
    )
}
