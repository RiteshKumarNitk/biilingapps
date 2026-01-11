"use client"

import { useState, useEffect, useMemo } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { Search, Filter, PlayCircle, Coins, Package, Info } from 'lucide-react'
import { toast } from 'sonner'
import { bulkUpdateProducts, bulkAdjustStock, BulkUpdateItem, BulkStockUpdate } from '@/actions/inventory'

type Mode = 'pricing' | 'stock' | 'info'

interface BulkUpdateTableProps {
    initialItems: any[]
}

const TAX_TYPES = ['Inclusive', 'Exclusive']
const DISCOUNT_TYPES = ['Percentage', 'Amount']
const TAX_RATES = ['GST@0%', 'GST@0.25%', 'GST@3%', 'GST@5%', 'GST@12%', 'GST@18%', 'GST@28%', 'IGST@0%', 'IGST@18%', 'Exempt', 'None']
const STOCK_REASONS = ['Stock Correction', 'Damage', 'Lost', 'Found', 'Other']

export function BulkUpdateTable({ initialItems }: BulkUpdateTableProps) {
    const [mode, setMode] = useState<Mode>('pricing')
    const [items, setItems] = useState<any[]>(initialItems)
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(false)

    // Changes tracking: { [itemId]: { field: newValue } }
    const [changes, setChanges] = useState<Record<string, Record<string, any>>>({})

    // Filter items
    const filteredItems = useMemo(() => {
        if (!search) return items
        const lower = search.toLowerCase()
        return items.filter(i =>
            i.name?.toLowerCase().includes(lower) ||
            i.hsn_code?.toLowerCase().includes(lower) ||
            i.category?.toLowerCase().includes(lower)
        )
    }, [items, search])

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(new Set(filteredItems.map(i => i.id)))
        } else {
            setSelectedIds(new Set())
        }
    }

    const handleSelectRow = (id: string, checked: boolean) => {
        const next = new Set(selectedIds)
        if (checked) next.add(id)
        else next.delete(id)
        setSelectedIds(next)
    }

    const handleChange = (id: string, field: string, value: any) => {
        setChanges(prev => ({
            ...prev,
            [id]: {
                ...(prev[id] || {}),
                [field]: value
            }
        }))

        // Optimistic UI update locally so input reflects change
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ))
    }

    // Helper to get effective tax rate number from string "GST@18%" -> 18
    const parseTaxRate = (str: string) => {
        const match = str?.match(/(\d+(\.\d+)?)/)
        return match ? parseFloat(match[0]) : 0
    }

    const getChangeCount = () => {
        return Object.keys(changes).length
    }

    const handleUpdate = async () => {
        if (Object.keys(changes).length === 0) return

        setLoading(true)
        try {
            if (mode === 'stock') {
                // Prepare stock updates
                const updates: BulkStockUpdate[] = []
                Object.entries(changes).forEach(([id, fields]) => {
                    if (fields.stock_adj_qty && fields.stock_adj_qty > 0) {
                        const original = initialItems.find(i => i.id === id)
                        updates.push({
                            id,
                            current_stock: original.stock_quantity || 0,
                            adjustment_type: fields.stock_adj_type || 'ADD',
                            quantity: Number(fields.stock_adj_qty),
                            reason: fields.stock_adj_reason || 'Stock Correction'
                        })
                    }
                })

                if (updates.length > 0) {
                    await bulkAdjustStock(updates)
                    toast.success(`Updated stock for ${updates.length} items`)
                }
            } else {
                // Pricing or Info mode -> Product Update
                const updates: BulkUpdateItem[] = []
                Object.entries(changes).forEach(([id, fields]) => {
                    // Filter out stock specific temporary fields
                    const { stock_adj_qty, stock_adj_type, stock_adj_reason, ...productFields } = fields

                    if (Object.keys(productFields).length > 0) {
                        const payload: any = { id, ...productFields }

                        // normalize fields if needed
                        if (payload.gst_rate_string) {
                            payload.gst_rate = parseTaxRate(payload.gst_rate_string)
                            delete payload.gst_rate_string
                        }

                        updates.push(payload)
                    }
                })

                if (updates.length > 0) {
                    await bulkUpdateProducts(updates)
                    toast.success(`Updated ${updates.length} items`)
                }
            }

            setChanges({})
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    const renderPricingRows = () => (
        filteredItems.map((item, idx) => (
            <TableRow key={item.id} className="border-b border-slate-100 h-14 hover:bg-slate-50 transition-colors">
                <TableCell className="w-[40px] pl-4">
                    <Checkbox
                        checked={selectedIds.has(item.id)}
                        onCheckedChange={(c) => handleSelectRow(item.id, c as boolean)}
                    />
                </TableCell>
                <TableCell className="w-[40px] text-xs text-slate-400 font-medium">{idx + 1}</TableCell>
                <TableCell className="min-w-[180px]">
                    <div className="font-semibold text-sm text-slate-800 line-clamp-1">{item.name}</div>
                </TableCell>
                <TableCell className="min-w-[120px] text-sm text-slate-500">{item.category || 'Uncategorized'}</TableCell>
                <TableCell className="min-w-[100px] text-sm text-slate-500 font-mono">{item.hsn_code || '--'}</TableCell>

                {/* Purchase Price */}
                <TableCell className="min-w-[120px]">
                    <div className="relative group">
                        <span className="absolute left-2.5 top-2.5 text-slate-400 text-xs">₹</span>
                        <Input
                            className="h-9 pl-6 text-right font-medium text-slate-700 bg-slate-50/50 border-transparent group-hover:bg-white group-hover:border-slate-200 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-lg transition-all"
                            value={item.purchase_price || ''}
                            placeholder="0"
                            onChange={(e) => handleChange(item.id, 'purchase_price', Number(e.target.value))}
                        />
                    </div>
                </TableCell>
                <TableCell className="min-w-[120px]">
                    <div className="h-9 bg-slate-50/50 hover:bg-white border border-transparent hover:border-slate-200 rounded-lg px-2 flex items-center transition-all">
                        <select
                            className="w-full text-xs bg-transparent border-none outline-none cursor-pointer text-slate-700 font-medium"
                            value={item.purchase_tax_type || 'Exclusive'}
                            onChange={(e) => handleChange(item.id, 'purchase_tax_type', e.target.value)}
                        >
                            {TAX_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                </TableCell>

                {/* Sale Price */}
                <TableCell className="min-w-[120px]">
                    <div className="relative group">
                        <span className="absolute left-2.5 top-2.5 text-slate-400 text-xs">₹</span>
                        <Input
                            className="h-9 pl-6 text-right font-medium text-slate-700 bg-slate-50/50 border-transparent group-hover:bg-white group-hover:border-slate-200 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-lg transition-all"
                            value={item.price || ''}
                            placeholder="0"
                            onChange={(e) => handleChange(item.id, 'price', Number(e.target.value))}
                        />
                    </div>
                </TableCell>
                <TableCell className="min-w-[120px]">
                    <div className="h-9 bg-slate-50/50 hover:bg-white border border-transparent hover:border-slate-200 rounded-lg px-2 flex items-center transition-all">
                        <select
                            className="w-full text-xs bg-transparent border-none outline-none cursor-pointer text-slate-700 font-medium"
                            value={item.tax_mode || 'Exclusive'}
                            onChange={(e) => handleChange(item.id, 'tax_mode', e.target.value)}
                        >
                            {TAX_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                </TableCell>

                {/* Discount */}
                <TableCell className="min-w-[100px]">
                    <Input
                        className="h-9 text-right font-medium text-slate-700 bg-slate-50/50 border-transparent hover:bg-white hover:border-slate-200 focus:bg-white focus:border-blue-400 rounded-lg transition-all"
                        value={item.discount_value || ''}
                        placeholder="0"
                        onChange={(e) => handleChange(item.id, 'discount_value', Number(e.target.value))}
                    />
                </TableCell>
                <TableCell className="min-w-[110px]">
                    <div className="h-9 bg-slate-50/50 hover:bg-white border border-transparent hover:border-slate-200 rounded-lg px-2 flex items-center transition-all">
                        <select
                            className="w-full text-xs bg-transparent border-none outline-none cursor-pointer text-slate-700 font-medium"
                            value={item.discount_type || 'Percentage'}
                            onChange={(e) => handleChange(item.id, 'discount_type', e.target.value)}
                        >
                            {DISCOUNT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                </TableCell>

                {/* Tax Rate */}
                <TableCell className="min-w-[120px] pr-4">
                    <div className="h-9 bg-slate-50/50 hover:bg-white border border-transparent hover:border-slate-200 rounded-lg px-2 flex items-center transition-all">
                        <select
                            className="w-full text-xs bg-transparent border-none outline-none cursor-pointer text-slate-700 font-medium"
                            value={item.gst_rate_string || `GST@${item.gst_rate || 0}%`}
                            onChange={(e) => handleChange(item.id, 'gst_rate_string', e.target.value)}
                        >
                            {TAX_RATES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                </TableCell>
            </TableRow>
        ))
    )

    const renderStockRows = () => (
        filteredItems.map((item, idx) => (
            <TableRow key={item.id} className="border-b border-slate-100 h-14 hover:bg-slate-50 transition-colors">
                <TableCell className="w-[40px] pl-4">
                    <Checkbox
                        checked={selectedIds.has(item.id)}
                        onCheckedChange={(c) => handleSelectRow(item.id, c as boolean)}
                    />
                </TableCell>
                <TableCell className="w-[40px] text-xs text-slate-400 font-medium">{idx + 1}</TableCell>
                <TableCell className="min-w-[200px]">
                    <div className="font-semibold text-sm text-slate-800">{item.name}</div>
                </TableCell>

                <TableCell className="min-w-[120px]">
                    <span className="px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-blue-700 text-xs font-bold shadow-sm">
                        {item.stock_quantity || 0}
                    </span>
                </TableCell>

                <TableCell className="min-w-[120px]">
                    <div className="h-9 bg-slate-50/50 hover:bg-white border border-transparent hover:border-slate-200 rounded-lg px-2 flex items-center transition-all">
                        <select
                            className="w-full text-xs bg-transparent border-none outline-none cursor-pointer text-slate-700 font-medium"
                            value={item.stock_adj_type || 'ADD'}
                            onChange={(e) => handleChange(item.id, 'stock_adj_type', e.target.value)}
                        >
                            <option value="ADD">Add (+)</option>
                            <option value="REDUCE">Reduce (-)</option>
                        </select>
                    </div>
                </TableCell>

                <TableCell className="min-w-[120px]">
                    <Input
                        placeholder="Qty"
                        className="h-9 text-right font-medium text-slate-700 bg-slate-50/50 border-transparent hover:bg-white hover:border-slate-200 focus:bg-white focus:border-blue-400 rounded-lg transition-all"
                        value={item.stock_adj_qty || ''}
                        onChange={(e) => handleChange(item.id, 'stock_adj_qty', Number(e.target.value))}
                    />
                </TableCell>

                <TableCell className="min-w-[150px] pr-4">
                    <div className="h-9 bg-slate-50/50 hover:bg-white border border-transparent hover:border-slate-200 rounded-lg px-2 flex items-center transition-all">
                        <select
                            className="w-full text-xs bg-transparent border-none outline-none cursor-pointer text-slate-700 font-medium"
                            value={item.stock_adj_reason || 'Stock Correction'}
                            onChange={(e) => handleChange(item.id, 'stock_adj_reason', e.target.value)}
                        >
                            {STOCK_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                </TableCell>
            </TableRow>
        ))
    )

    const renderInfoRows = () => (
        filteredItems.map((item, idx) => (
            <TableRow key={item.id} className="border-b border-slate-100 h-14 hover:bg-slate-50 transition-colors">
                <TableCell className="w-[40px] pl-4">
                    <Checkbox
                        checked={selectedIds.has(item.id)}
                        onCheckedChange={(c) => handleSelectRow(item.id, c as boolean)}
                    />
                </TableCell>
                <TableCell className="w-[40px] text-xs text-slate-400 font-medium">{idx + 1}</TableCell>

                <TableCell className="min-w-[200px]">
                    <Input
                        className="h-9 font-medium text-slate-700 bg-slate-50/50 border-transparent hover:bg-white hover:border-slate-200 focus:bg-white focus:border-blue-400 rounded-lg transition-all"
                        value={item.name || ''}
                        onChange={(e) => handleChange(item.id, 'name', e.target.value)}
                    />
                </TableCell>
                <TableCell className="min-w-[150px]">
                    <Input
                        className="h-9 text-slate-700 bg-slate-50/50 border-transparent hover:bg-white hover:border-slate-200 focus:bg-white focus:border-blue-400 rounded-lg transition-all"
                        value={item.category || ''}
                        onChange={(e) => handleChange(item.id, 'category', e.target.value)}
                    />
                </TableCell>
                <TableCell className="min-w-[120px]">
                    <Input
                        className="h-9 text-slate-700 bg-slate-50/50 border-transparent hover:bg-white hover:border-slate-200 focus:bg-white focus:border-blue-400 rounded-lg font-mono transition-all"
                        value={item.hsn_code || ''}
                        onChange={(e) => handleChange(item.id, 'hsn_code', e.target.value)}
                    />
                </TableCell>
                <TableCell className="min-w-[100px] pr-4">
                    <Input
                        className="h-9 text-slate-700 bg-slate-50/50 border-transparent hover:bg-white hover:border-slate-200 focus:bg-white focus:border-blue-400 rounded-lg transition-all"
                        value={item.item_code || ''}
                        placeholder="Item Code"
                        onChange={(e) => handleChange(item.id, 'item_code', e.target.value)}
                    />
                </TableCell>
            </TableRow>
        ))
    )

    return (
        <div className="flex flex-col h-full items-center">
            {/* Main Card */}
            <div className="bg-white rounded-xl shadow-lg shadow-slate-200/50 border border-slate-200 w-full max-w-7xl flex flex-col h-[calc(100vh-8rem)] overflow-hidden">

                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                            {mode === 'pricing' && <Coins className="h-5 w-5" />}
                            {mode === 'stock' && <Package className="h-5 w-5" />}
                            {mode === 'info' && <Info className="h-5 w-5" />}
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">Bulk Update</h2>
                            <p className="text-xs text-slate-400 font-medium">Edit multiple items efficiently</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 bg-slate-100/50 p-1 rounded-lg border border-slate-200/60">
                        <button
                            onClick={() => setMode('pricing')}
                            className={cn(
                                "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                                mode === 'pricing' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            Pricing
                        </button>
                        <button
                            onClick={() => setMode('stock')}
                            className={cn(
                                "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                                mode === 'stock' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            Stock
                        </button>
                        <button
                            onClick={() => setMode('info')}
                            className={cn(
                                "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                                mode === 'info' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            Info
                        </button>
                    </div>

                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Filter items..."
                            className="pl-9 h-9 rounded-full bg-slate-50 border-slate-200 text-sm focus:bg-white focus:w-72 transition-all duration-300"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Selection Bar */}
                {selectedIds.size > 0 && (
                    <div className="bg-indigo-50/50 px-6 py-2 border-b border-indigo-100 flex items-center justify-between text-sm shrink-0">
                        <span className="text-indigo-700 font-medium flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
                            {selectedIds.size} items selected
                        </span>
                        <Button
                            variant="secondary"
                            size="sm"
                            className="h-7 text-xs bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                        >
                            Bulk Actions <Filter className="ml-2 h-3 w-3" />
                        </Button>
                    </div>
                )}

                {/* Table Container */}
                <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent bg-white">
                    <Table>
                        <TableHeader className="sticky top-0 bg-slate-50/80 backdrop-blur-sm z-10 shadow-sm">
                            <TableRow className="h-11 hover:bg-transparent border-b border-slate-200">
                                <TableHead className="w-[40px] pl-4">
                                    <Checkbox
                                        checked={selectedIds.size === filteredItems.length && filteredItems.length > 0}
                                        onCheckedChange={(c) => handleSelectAll(c as boolean)}
                                    />
                                </TableHead>
                                <TableHead className="w-[40px] text-xs font-bold text-slate-500 uppercase tracking-wider">#</TableHead>

                                {mode === 'pricing' && (
                                    <>
                                        <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider">Item</TableHead>
                                        <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category</TableHead>
                                        <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider">HSN</TableHead>
                                        <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider">Purchase</TableHead>
                                        <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider">Type</TableHead>
                                        <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sale</TableHead>
                                        <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider">Type</TableHead>
                                        <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider">Discount</TableHead>
                                        <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider">Type</TableHead>
                                        <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider pr-4">Tax %</TableHead>
                                    </>
                                )}
                                {mode === 'stock' && (
                                    <>
                                        <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider">Item Name</TableHead>
                                        <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current</TableHead>
                                        <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider">Action</TableHead>
                                        <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quantity</TableHead>
                                        <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider pr-4">Reason</TableHead>
                                    </>
                                )}
                                {mode === 'info' && (
                                    <>
                                        <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider">Item Name</TableHead>
                                        <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category</TableHead>
                                        <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider">HSN Code</TableHead>
                                        <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider pr-4">Item Code</TableHead>
                                    </>
                                )}
                            </TableRow>
                        </TableHeader>
                        <TableBody className="bg-white">
                            {mode === 'pricing' && renderPricingRows()}
                            {mode === 'stock' && renderStockRows()}
                            {mode === 'info' && renderInfoRows()}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Sticky Fixed Footer */}
            <div className="fixed bottom-0 left-0 right-0 h-16 bg-white/90 backdrop-blur border-t border-slate-200 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] z-50 flex items-center justify-between px-8 md:pl-[300px] transition-all">
                {/* Left: Summary */}
                <div className="flex items-center gap-6 text-sm text-slate-600 font-medium">
                    <div className="flex items-center gap-2">
                        <span className={cn("h-2 w-2 rounded-full", getChangeCount() > 0 ? "bg-amber-400 animate-pulse" : "bg-slate-300")}></span>
                        {getChangeCount()} Unsaved Changes
                    </div>
                </div>

                {/* Right: Update Button */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" className="text-slate-500" onClick={() => setChanges({})}>Reset</Button>
                    <Button
                        onClick={handleUpdate}
                        disabled={loading || getChangeCount() === 0}
                        className={cn(
                            "min-w-[140px] shadow-lg transform transition-all active:scale-95",
                            getChangeCount() > 0 ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200" : "bg-slate-200 text-slate-400"
                        )}
                    >
                        {loading ? 'Processing...' : 'Save Changes'}
                    </Button>
                </div>
            </div>
        </div>
    )
}
