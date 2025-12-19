
"use client"

import { useState, useEffect } from 'react'
import { getProducts, adjustStock, getAdjustmentHistory } from '@/actions/inventory'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { Search, History, ArrowRight } from 'lucide-react'
import { Label } from '@/components/ui/label'

const REASONS = [
    "Stock Correction",
    "Damage",
    "Loss / Theft",
    "Found",
    "Return",
    "Other"
]

export default function StockAdustmentPage() {
    const [products, setProducts] = useState<any[]>([])
    const [history, setHistory] = useState<any[]>([])
    const [selectedProduct, setSelectedProduct] = useState<string>("")
    const [adjustmentType, setAdjustmentType] = useState<"ADD" | "REDUCE">("ADD")
    const [quantity, setQuantity] = useState<number>(0)
    const [reason, setReason] = useState<string>("Stock Correction")
    const [remarks, setRemarks] = useState<string>("")
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const [pData, hData] = await Promise.all([
                getProducts(1, 2000).then(res => res.data),
                getAdjustmentHistory()
            ])
            setProducts(pData || [])
            setHistory(hData || [])
        } catch (e) {
            console.error(e)
            toast.error("Failed to load data")
        }
    }

    const handleSave = async () => {
        if (!selectedProduct) return toast.error("Select a product")
        if (quantity <= 0) return toast.error("Quantity must be greater than 0")

        setLoading(true)
        try {
            await adjustStock(selectedProduct, quantity, adjustmentType, reason, remarks)
            toast.success("Stock adjusted successfully")

            // Reset & Reload
            setQuantity(0)
            setRemarks("")
            loadData() // Refresh history and possibly products cache if needed
        } catch (e: any) {
            toast.error(e.message || "Failed to adjust stock")
        } finally {
            setLoading(false)
        }
    }

    const currentProduct = products.find(p => p.id === selectedProduct)

    return (
        <div className="flex-1 bg-[#F5F7FA] h-full flex flex-col p-6 space-y-6 overflow-y-auto">
            <div className="flex items-center justify-between shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Stock Adjustment</h1>
                    <p className="text-slate-500 text-sm mt-1">Manually correct stock levels for items.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form */}
                <Card className="lg:col-span-1 h-fit shadow-sm border-slate-200">
                    <CardHeader className="bg-slate-50 border-b pb-4">
                        <CardTitle className="text-base font-semibold text-slate-700">New Adjustment</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-5">
                        <div className="space-y-2">
                            <Label>Select Item</Label>
                            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Item..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {products.map(p => (
                                        <SelectItem key={p.id} value={p.id}>
                                            {p.name} <span className="text-slate-400 text-xs ml-2">(Curr: {p.stock_quantity})</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {currentProduct && (
                            <div className="bg-blue-50 p-3 rounded text-sm text-blue-800 border border-blue-100 flex justify-between">
                                <span>Current Stock:</span>
                                <span className="font-bold">{currentProduct.stock_quantity} {currentProduct.unit}</span>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Action</Label>
                                <Select value={adjustmentType} onValueChange={(val: any) => setAdjustmentType(val)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ADD">Increase (+)</SelectItem>
                                        <SelectItem value="REDUCE">Decrease (-)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Quantity</Label>
                                <Input
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={quantity}
                                    onChange={(e) => setQuantity(parseFloat(e.target.value))}
                                    className="text-right font-mono"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Reason</Label>
                            <Select value={reason} onValueChange={setReason}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {REASONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Remarks (Optional)</Label>
                            <Textarea
                                placeholder="Details about this adjustment..."
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                className="resize-none"
                            />
                        </div>

                        <Button
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            onClick={handleSave}
                            disabled={loading || !selectedProduct}
                        >
                            {loading ? "Saving..." : "Save Adjustment"}
                        </Button>
                    </CardContent>
                </Card>

                {/* History */}
                <Card className="lg:col-span-2 shadow-sm border-slate-200 flex flex-col h-[600px]">
                    <CardHeader className="bg-slate-50 border-b pb-4 flex flex-row items-center justify-between">
                        <CardTitle className="text-base font-semibold text-slate-700 flex items-center gap-2">
                            <History className="h-4 w-4" /> Recent History
                        </CardTitle>
                    </CardHeader>
                    <div className="flex-1 overflow-auto p-0">
                        <Table>
                            <TableHeader className="sticky top-0 bg-white shadow-sm z-10">
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Item</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead className="text-right">Qty</TableHead>
                                    <TableHead>Reason / Details</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {history.map(item => (
                                    <TableRow key={item.id}>
                                        <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                                            {format(new Date(item.created_at), 'dd MMM yyyy, hh:mm a')}
                                        </TableCell>
                                        <TableCell className="font-medium text-sm">
                                            {item.products?.name || "Unknown Item"}
                                        </TableCell>
                                        <TableCell className="text-xs">
                                            {item.type === 'ADJUSTMENT_ADD' ? (
                                                <span className="text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded border border-green-100">+ Add</span>
                                            ) : (
                                                <span className="text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded border border-red-100">- Reduce</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-sm font-semibold">
                                            {Math.abs(item.quantity)}
                                        </TableCell>
                                        <TableCell className="text-xs text-slate-600 max-w-[200px] truncate" title={item.description}>
                                            {item.description}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {history.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24 text-slate-400">
                                            No adjustment history found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </Card>
            </div>
        </div>
    )
}
