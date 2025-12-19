"use client"

import * as React from 'react'
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import { Plus, Trash2, Search } from "lucide-react"
import { GST_SLABS, TransactionItem } from "./shared"
import { cn } from "@/lib/utils"

interface TransactionTableProps {
    items: TransactionItem[]
    setItems: (items: TransactionItem[]) => void
    products: any[] // TODO: Type properly
}

export function TransactionTable({ items, setItems, products }: TransactionTableProps) {
    const tableRef = React.useRef<HTMLTableElement>(null)

    // Calculations
    const calculateRow = (item: TransactionItem): TransactionItem => {
        const qty = item.quantity || 0
        const price = item.price || 0
        const gst = item.gstRate || 0
        const disc = item.discountValue || 0

        let baseAmount = qty * price

        // Discount
        let discountAmount = 0
        if (item.discountType === 'percentage') {
            discountAmount = baseAmount * (disc / 100)
        } else {
            discountAmount = disc
        }

        // Apply Discount
        let valueAfterDiscount = baseAmount - discountAmount

        let taxAmount = 0
        let finalAmount = 0

        if (item.taxType === 'exclusive') {
            // Tax is ADDED on top
            // Value = (Qty * Price) - Discount
            // Tax = Value * (GST%)
            // Total = Value + Tax
            taxAmount = valueAfterDiscount * (gst / 100)
            finalAmount = valueAfterDiscount + taxAmount
        } else {
            // Price INCLUDES Tax
            // Meaning valueAfterDiscount IS the final amount the customer pays? 
            // Usually "Inclusive" means the Price per unit includes tax. 
            // So Total = (Qty * Price) - Discount. 
            // We just back-calculate Tax component for display.
            // Tax = Total - (Total / (1 + GST/100))
            finalAmount = valueAfterDiscount
            taxAmount = finalAmount - (finalAmount / (1 + (gst / 100)))
        }

        return {
            ...item,
            taxAmount: parseFloat(taxAmount.toFixed(2)),
            amount: parseFloat(finalAmount.toFixed(2))
        }
    }

    const updateItem = (index: number, field: keyof TransactionItem, value: any) => {
        const newItems = [...items]
        newItems[index] = { ...newItems[index], [field]: value }
        newItems[index] = calculateRow(newItems[index])
        setItems(newItems)
    }

    const addItem = () => {
        setItems([...items, {
            rowId: Math.random().toString(36).substr(2, 9),
            productId: '',
            description: '',
            quantity: 1,
            unit: 'PCS',
            price: 0,
            taxType: 'exclusive',
            discountValue: 0,
            discountType: 'percentage',
            gstRate: 0,
            taxAmount: 0,
            amount: 0
        }])
    }

    const removeItem = (index: number) => {
        const newItems = [...items]
        newItems.splice(index, 1)
        setItems(newItems)
    }

    const handleProductSelect = (index: number, productId: string) => {
        const product = products.find(p => p.id === productId)
        if (product) {
            updateItem(index, 'productId', productId)
            // Batch update for performance?
            const newItems = [...items]
            newItems[index] = {
                ...newItems[index],
                productId: product.id,
                description: product.name,
                price: product.price,
                gstRate: product.gst_rate || 0,
                unit: product.unit || 'PCS'
            }
            newItems[index] = calculateRow(newItems[index])
            setItems(newItems)
        }
    }

    // Keyboard Navigation (Enter to next cell/row)
    const handleKeyDown = (e: React.KeyboardEvent, index: number, colIndex: number) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            // Find next input
            // Logic to move focus
            // If last cell of last row, add new row
            if (index === items.length - 1 && colIndex === 8) { // Assuming 8 is amount/last editable
                addItem()
                // Focus logic would need refs or generic DOM query
                setTimeout(() => {
                    // Hacky focus on first input of new row
                }, 0)
            }
        }
    }

    return (
        <div className="border rounded-md overflow-hidden bg-white shadow-sm">
            <Table>
                <TableHeader className="bg-slate-50 sticky top-0 z-10 h-10">
                    <TableRow className="h-10 hover:bg-slate-50 border-b-slate-200">
                        <TableHead className="w-[40px] px-2 h-10 font-semibold text-slate-600">#</TableHead>
                        <TableHead className="w-[200px] px-2 h-10 font-semibold text-slate-600">Item</TableHead>
                        <TableHead className="min-w-[150px] px-2 h-10 font-semibold text-slate-600">Description</TableHead>
                        <TableHead className="w-[80px] px-2 h-10 font-semibold text-slate-600">Qty</TableHead>
                        <TableHead className="w-[70px] px-2 h-10 font-semibold text-slate-600">Unit</TableHead>
                        <TableHead className="w-[100px] px-2 h-10 font-semibold text-slate-600">Price/Unit</TableHead>
                        <TableHead className="w-[110px] px-2 h-10 font-semibold text-slate-600">Tax Mode</TableHead>
                        <TableHead className="w-[100px] px-2 h-10 font-semibold text-slate-600">Discount</TableHead>
                        <TableHead className="w-[80px] px-2 h-10 font-semibold text-slate-600">Tax(%)</TableHead>
                        <TableHead className="w-[100px] px-2 h-10 font-semibold text-slate-600">Tax Amt</TableHead>
                        <TableHead className="w-[120px] px-2 h-10 font-semibold text-slate-600">Amount</TableHead>
                        <TableHead className="w-[40px] px-2 h-10"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.map((item, index) => (
                        <TableRow key={item.rowId} className="h-10 border-b-slate-100 hover:bg-blue-50/10">
                            <TableCell className="p-2 text-center text-xs text-slate-400">{index + 1}</TableCell>

                            {/* ITEM SELECTOR */}
                            <TableCell className="p-1">
                                <SearchableProductSelect
                                    value={item.productId}
                                    products={products}
                                    onSelect={(val) => handleProductSelect(index, val)}
                                />
                            </TableCell>

                            <TableCell className="p-1">
                                <Input
                                    className="h-8 text-xs border-0 bg-transparent focus-visible:ring-1 focus-visible:ring-blue-500 rounded-sm hover:bg-slate-50"
                                    value={item.description}
                                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                                />
                            </TableCell>

                            <TableCell className="p-1">
                                <Input
                                    type="number"
                                    className="h-8 text-xs text-right border-0 bg-transparent focus-visible:ring-1 focus-visible:ring-blue-500 rounded-sm hover:bg-slate-50"
                                    value={item.quantity}
                                    onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value))}
                                    onKeyDown={(e) => handleKeyDown(e, index, 3)}
                                />
                            </TableCell>

                            <TableCell className="p-1">
                                <Input
                                    className="h-8 text-xs border-0 bg-transparent focus-visible:ring-1 focus-visible:ring-blue-500 rounded-sm hover:bg-slate-50"
                                    value={item.unit}
                                    onChange={(e) => updateItem(index, 'unit', e.target.value)}
                                />
                            </TableCell>

                            <TableCell className="p-1">
                                <Input
                                    type="number"
                                    className="h-8 text-xs text-right border-0 bg-transparent focus-visible:ring-1 focus-visible:ring-blue-500 rounded-sm hover:bg-slate-50"
                                    value={item.price}
                                    onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value))}
                                />
                            </TableCell>

                            <TableCell className="p-1">
                                <Select value={item.taxType} onValueChange={(val: any) => updateItem(index, 'taxType', val)}>
                                    <SelectTrigger className="h-8 text-xs border-0 bg-transparent focus:ring-1 focus:ring-blue-500 px-2">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="exclusive">Without Tax</SelectItem>
                                        <SelectItem value="inclusive">With Tax</SelectItem>
                                    </SelectContent>
                                </Select>
                            </TableCell>

                            <TableCell className="p-1">
                                <div className="flex items-center gap-1">
                                    <Input
                                        type="number"
                                        className="h-8 text-xs text-right border-0 bg-transparent focus-visible:ring-1 focus-visible:ring-blue-500 rounded-sm min-w-[50px] hover:bg-slate-50"
                                        value={item.discountValue}
                                        onChange={(e) => updateItem(index, 'discountValue', parseFloat(e.target.value))}
                                    />
                                    <button
                                        onClick={() => updateItem(index, 'discountType', item.discountType === 'percentage' ? 'flat' : 'percentage')}
                                        className="text-[10px] bg-slate-200 px-1 rounded h-6 w-6 flex items-center justify-center text-slate-600 hover:bg-slate-300"
                                    >
                                        {item.discountType === 'percentage' ? '%' : '₹'}
                                    </button>
                                </div>
                            </TableCell>

                            <TableCell className="p-1">
                                <Select value={item.gstRate.toString()} onValueChange={(val) => updateItem(index, 'gstRate', parseFloat(val))}>
                                    <SelectTrigger className="h-8 text-xs border-0 bg-transparent focus:ring-1 focus:ring-blue-500 px-2 text-right">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {GST_SLABS.map(slab => (
                                            <SelectItem key={slab} value={slab.toString()}>{slab}%</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </TableCell>

                            <TableCell className="p-1 text-right text-xs text-slate-500 font-medium px-2">
                                {item.taxAmount.toFixed(2)}
                            </TableCell>

                            <TableCell className="p-1 text-right text-xs font-bold text-slate-800 px-2">
                                {item.amount.toFixed(2)}
                            </TableCell>

                            <TableCell className="p-1 text-center">
                                <button onClick={() => removeItem(index)} className="text-slate-400 hover:text-red-500">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </TableCell>
                        </TableRow>
                    ))}
                    {/* Empty add row button/area */}
                    <TableRow>
                        <TableCell colSpan={12} className="p-1">
                            <Button variant="ghost" size="sm" onClick={addItem} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 w-full justify-start h-9 text-xs">
                                <Plus className="h-4 w-4 mr-2" /> Add Row
                            </Button>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    )
}

function SearchableProductSelect({ value, products, onSelect }: { value: string, products: any[], onSelect: (val: string) => void }) {
    // Simplified for now, can be a real combobox later
    return (
        <Select value={value} onValueChange={onSelect}>
            <SelectTrigger className="h-8 text-xs border-0 bg-transparent focus:ring-1 focus:ring-blue-500 px-2">
                <SelectValue placeholder="Select Item" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="search" disabled>
                    <div className="flex items-center text-muted-foreground">
                        <Search className="h-3 w-3 mr-2" /> Search...
                    </div>
                </SelectItem>
                {products.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
                <div className="p-1 border-t">
                    <Button variant="ghost" size="sm" className="w-full text-xs text-blue-600 justify-start h-8">
                        <Plus className="h-3 w-3 mr-2" /> Add New Item
                    </Button>
                </div>
            </SelectContent>
        </Select>
    )
}
