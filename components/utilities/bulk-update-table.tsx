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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { Search, Filter, PlayCircle } from 'lucide-react'
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
        // Only count changes that are actually diff from initial? 
        // For simplicity, we assume 'changes' map only captures user edits.
        // We filter out edits related to non-active modes? No, user might switch modes.
        // Let's count keys in 'changes' map.
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
                } else {
                    // No valid changes
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
            // ideally fetch fresh data or revalidate triggers will update page prop
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    const renderPricingRows = () => (
        filteredItems.map((item, idx) => (
            <TableRow key={item.id} className="border-b border-slate-100 h-12 hover:bg-slate-50">
                <TableCell className="w-[40px] pl-4">
                    <Checkbox
                        checked={selectedIds.has(item.id)}
                        onCheckedChange={(c) => handleSelectRow(item.id, c as boolean)}
                    />
                </TableCell>
                <TableCell className="w-[50px] text-xs text-slate-500">{idx + 1}</TableCell>
                <TableCell className="min-w-[180px]">
                    <div className="font-medium text-sm text-slate-700">{item.name}</div>
                </TableCell>
                <TableCell className="min-w-[120px] text-sm text-slate-600">{item.category || 'Uncategorized'}</TableCell>
                <TableCell className="min-w-[100px] text-sm text-slate-600 font-mono">{item.hsn_code || '--'}</TableCell>

                {/* Purchase Price */}
                <TableCell className="min-w-[120px]">
                    <div className="relative">
                        <span className="absolute left-2 top-2 text-slate-400 text-xs">₹</span>
                        <Input
                            className="h-8 pl-5 text-right font-medium text-slate-700 bg-transparent border-transparent hover:border-slate-200 focus:bg-white focus:border-blue-400 rounded-sm"
                            value={item.purchase_price || ''}
                            onChange={(e) => handleChange(item.id, 'purchase_price', Number(e.target.value))}
                        />
                    </div>
                </TableCell>
                <TableCell className="min-w-[120px]">
                    <select
                        className="w-full text-xs h-8 bg-transparent border-none outline-none cursor-pointer text-slate-600"
                        value={item.purchase_tax_type || 'Exclusive'}
                        onChange={(e) => handleChange(item.id, 'purchase_tax_type', e.target.value)}
                    >
                        {TAX_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </TableCell>

                {/* Sale Price */}
                <TableCell className="min-w-[120px]">
                    <div className="relative">
                        <span className="absolute left-2 top-2 text-slate-400 text-xs">₹</span>
                        <Input
                            className="h-8 pl-5 text-right font-medium text-slate-700 bg-transparent border-transparent hover:border-slate-200 focus:bg-white focus:border-blue-400 rounded-sm"
                            value={item.price || ''}
                            onChange={(e) => handleChange(item.id, 'price', Number(e.target.value))}
                        />
                    </div>
                </TableCell>
                <TableCell className="min-w-[120px]">
                    <select
                        className="w-full text-xs h-8 bg-transparent border-none outline-none cursor-pointer text-slate-600"
                        value={item.tax_mode || 'Exclusive'} // mapped schema 'tax_mode' -> sale tax type
                        onChange={(e) => handleChange(item.id, 'tax_mode', e.target.value)}
                    >
                        {TAX_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </TableCell>

                {/* Discount */}
                <TableCell className="min-w-[100px]">
                    <Input
                        className="h-8 text-right font-medium text-slate-700 bg-transparent border-transparent hover:border-slate-200 focus:bg-white focus:border-blue-400 rounded-sm"
                        value={item.discount_value || ''}
                        onChange={(e) => handleChange(item.id, 'discount_value', Number(e.target.value))}
                    />
                </TableCell>
                <TableCell className="min-w-[110px]">
                    <select
                        className="w-full text-xs h-8 bg-transparent border-none outline-none cursor-pointer text-slate-600"
                        value={item.discount_type || 'Percentage'}
                        onChange={(e) => handleChange(item.id, 'discount_type', e.target.value)}
                    >
                        {DISCOUNT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </TableCell>

                {/* Tax Rate */}
                <TableCell className="min-w-[120px] pr-4">
                    <select
                        className="w-full text-xs h-8 bg-transparent border-none outline-none cursor-pointer text-slate-600 font-medium"
                        value={item.gst_rate_string || `GST@${item.gst_rate || 0}%`} // Assuming you handle this mapping
                        onChange={(e) => handleChange(item.id, 'gst_rate_string', e.target.value)}
                    >
                        {TAX_RATES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </TableCell>
            </TableRow>
        ))
    )

    const renderStockRows = () => (
        filteredItems.map((item, idx) => (
            <TableRow key={item.id} className="border-b border-slate-100 h-12 hover:bg-slate-50">
                <TableCell className="w-[40px] pl-4">
                    <Checkbox
                        checked={selectedIds.has(item.id)}
                        onCheckedChange={(c) => handleSelectRow(item.id, c as boolean)}
                    />
                </TableCell>
                <TableCell className="w-[50px] text-xs text-slate-500">{idx + 1}</TableCell>
                <TableCell className="min-w-[200px]">
                    <div className="font-medium text-sm text-slate-700">{item.name}</div>
                </TableCell>

                <TableCell className="min-w-[120px]">
                    <span className="px-3 py-1 bg-slate-100 rounded text-slate-600 text-sm font-medium">
                        {item.stock_quantity || 0}
                    </span>
                </TableCell>

                <TableCell className="min-w-[120px]">
                    <select
                        className="w-full text-xs h-8 bg-transparent border border-slate-200 rounded px-2 cursor-pointer text-slate-700"
                        value={item.stock_adj_type || 'ADD'}
                        onChange={(e) => handleChange(item.id, 'stock_adj_type', e.target.value)}
                    >
                        <option value="ADD">Add (+)</option>
                        <option value="REDUCE">Reduce (-)</option>
                    </select>
                </TableCell>

                <TableCell className="min-w-[120px]">
                    <Input
                        placeholder="Qty"
                        className="h-8 text-right font-medium text-slate-700 border-slate-200 focus:border-blue-400 rounded-sm"
                        value={item.stock_adj_qty || ''}
                        onChange={(e) => handleChange(item.id, 'stock_adj_qty', Number(e.target.value))}
                    />
                </TableCell>

                <TableCell className="min-w-[150px] pr-4">
                    <select
                        className="w-full text-xs h-8 bg-transparent border-none outline-none cursor-pointer text-slate-600"
                        value={item.stock_adj_reason || 'Stock Correction'}
                        onChange={(e) => handleChange(item.id, 'stock_adj_reason', e.target.value)}
                    >
                        {STOCK_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </TableCell>
            </TableRow>
        ))
    )

    const renderInfoRows = () => (
        filteredItems.map((item, idx) => (
            <TableRow key={item.id} className="border-b border-slate-100 h-12 hover:bg-slate-50">
                <TableCell className="w-[40px] pl-4">
                    <Checkbox
                        checked={selectedIds.has(item.id)}
                        onCheckedChange={(c) => handleSelectRow(item.id, c as boolean)}
                    />
                </TableCell>
                <TableCell className="w-[50px] text-xs text-slate-500">{idx + 1}</TableCell>

                <TableCell className="min-w-[200px]">
                    <Input
                        className="h-8 font-medium text-slate-700 bg-transparent border-transparent hover:border-slate-200 focus:bg-white focus:border-blue-400 rounded-sm"
                        value={item.name || ''}
                        onChange={(e) => handleChange(item.id, 'name', e.target.value)}
                    />
                </TableCell>
                <TableCell className="min-w-[150px]">
                    <Input
                        className="h-8 text-slate-700 bg-transparent border-transparent hover:border-slate-200 focus:bg-white focus:border-blue-400 rounded-sm"
                        value={item.category || ''}
                        onChange={(e) => handleChange(item.id, 'category', e.target.value)}
                    />
                </TableCell>
                <TableCell className="min-w-[120px]">
                    <Input
                        className="h-8 text-slate-700 bg-transparent border-transparent hover:border-slate-200 focus:bg-white focus:border-blue-400 rounded-sm Font-mono"
                        value={item.hsn_code || ''}
                        onChange={(e) => handleChange(item.id, 'hsn_code', e.target.value)}
                    />
                </TableCell>
                <TableCell className="min-w-[100px] pr-4">
                    <Input
                        className="h-8 text-slate-700 bg-transparent border-transparent hover:border-slate-200 focus:bg-white focus:border-blue-400 rounded-sm"
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
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 w-full max-w-6xl flex flex-col h-[calc(100vh-8rem)] overflow-hidden">

                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                    <h2 className="text-lg font-bold text-slate-800">Bulk Update Items</h2>

                    <div className="flex items-center gap-6">
                        {/* Search */}
                        <div className="relative w-72">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search by item name / HSN Code"
                                className="pl-9 h-9 rounded-full bg-slate-50 border-slate-200 text-sm focus:bg-white transition-all"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        {/* Radio Modes */}
                        <div className="flex items-center gap-4 text-sm font-medium text-slate-600">
                            <label className="flex items-center gap-2 cursor-pointer hover:text-slate-900">
                                <input
                                    type="radio"
                                    name="mode"
                                    className="accent-blue-600 w-4 h-4"
                                    checked={mode === 'pricing'}
                                    onChange={() => setMode('pricing')}
                                />
                                Pricing
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer hover:text-slate-900">
                                <input
                                    type="radio"
                                    name="mode"
                                    className="accent-blue-600 w-4 h-4"
                                    checked={mode === 'stock'}
                                    onChange={() => setMode('stock')}
                                />
                                Stock
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer hover:text-slate-900">
                                <input
                                    type="radio"
                                    name="mode"
                                    className="accent-blue-600 w-4 h-4"
                                    checked={mode === 'info'}
                                    onChange={() => setMode('info')}
                                />
                                Item Information
                            </label>
                        </div>
                    </div>
                </div>

                {/* Selection Bar */}
                {selectedIds.size > 0 && (
                    <div className="bg-blue-50/50 px-6 py-2 border-b border-blue-100 flex items-center justify-between text-sm shrink-0">
                        <span className="text-blue-700 font-medium">{selectedIds.size} items selected</span>
                        <Button
                            variant="secondary"
                            size="sm"
                            className="h-8 bg-white border border-blue-200 text-blue-700 hover:bg-blue-50"
                        >
                            Update Tax Slab <Filter className="ml-2 h-3 w-3" />
                        </Button>
                    </div>
                )}

                {/* Table Container */}
                <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                    <Table>
                        <TableHeader className="sticky top-0 bg-[#F9FAFB] z-10 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                            <TableRow className="h-10 hover:bg-transparent border-b border-slate-200">
                                <TableHead className="w-[40px] pl-4">
                                    <Checkbox
                                        checked={selectedIds.size === filteredItems.length && filteredItems.length > 0}
                                        onCheckedChange={(c) => handleSelectAll(c as boolean)}
                                    />
                                </TableHead>
                                <TableHead className="w-[50px] text-xs font-semibold text-slate-500">#</TableHead>

                                {mode === 'pricing' && (
                                    <>
                                        <TableHead className="text-xs font-semibold text-slate-500">ITEM NAME</TableHead>
                                        <TableHead className="text-xs font-semibold text-slate-500">CATEGORY</TableHead>
                                        <TableHead className="text-xs font-semibold text-slate-500">ITEM HSN</TableHead>
                                        <TableHead className="text-xs font-semibold text-slate-500">PURCHASE PRICE</TableHead>
                                        <TableHead className="text-xs font-semibold text-slate-500">TAX TYPE</TableHead>
                                        <TableHead className="text-xs font-semibold text-slate-500">SALE PRICE</TableHead>
                                        <TableHead className="text-xs font-semibold text-slate-500">TAX TYPE</TableHead>
                                        <TableHead className="text-xs font-semibold text-slate-500">DISCOUNT</TableHead>
                                        <TableHead className="text-xs font-semibold text-slate-500">DISCOUNT TYPE</TableHead>
                                        <TableHead className="text-xs font-semibold text-slate-500 pr-4">TAX RATE</TableHead>
                                    </>
                                )}
                                {mode === 'stock' && (
                                    <>
                                        <TableHead className="text-xs font-semibold text-slate-500">ITEM NAME</TableHead>
                                        <TableHead className="text-xs font-semibold text-slate-500">CURRENT STOCK</TableHead>
                                        <TableHead className="text-xs font-semibold text-slate-500">ADJUSTMENT TYPE</TableHead>
                                        <TableHead className="text-xs font-semibold text-slate-500">QUANTITY</TableHead>
                                        <TableHead className="text-xs font-semibold text-slate-500 pr-4">REASON</TableHead>
                                    </>
                                )}
                                {mode === 'info' && (
                                    <>
                                        <TableHead className="text-xs font-semibold text-slate-500">ITEM NAME</TableHead>
                                        <TableHead className="text-xs font-semibold text-slate-500">CATEGORY</TableHead>
                                        <TableHead className="text-xs font-semibold text-slate-500">HSN CODE</TableHead>
                                        <TableHead className="text-xs font-semibold text-slate-500 pr-4">ITEM CODE</TableHead>
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

                {/* Sticky Footer for current card? No, fixed bottom bar implies page footer. */}
            </div>

            {/* Sticky Fixed Footer */}
            <div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] z-50 flex items-center justify-between px-8 md:pl-[300px]">
                {/* Left: Summary */}
                <div className="flex items-center gap-6 text-sm text-slate-500 font-medium">
                    <span className={cn(mode === 'pricing' && "text-blue-600 font-bold")}>
                        Pricing – {mode === 'pricing' ? getChangeCount() : 0} Updates
                    </span>
                    <span className="w-px h-4 bg-slate-300"></span>
                    <span className={cn(mode === 'stock' && "text-blue-600 font-bold")}>
                        Stock – {mode === 'stock' ? getChangeCount() : 0} Updates
                    </span>
                    <span className="w-px h-4 bg-slate-300"></span>
                    <span className={cn(mode === 'info' && "text-blue-600 font-bold")}>
                        Item Information – {mode === 'info' ? getChangeCount() : 0} Updates
                    </span>
                </div>

                {/* Right: Update Button */}
                <Button
                    onClick={handleUpdate}
                    disabled={loading || getChangeCount() === 0}
                    className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px] shadow-sm transform transition-all active:scale-95"
                >
                    {loading ? 'Updating...' : 'Update'}
                </Button>
            </div>
        </div>
    )
}
