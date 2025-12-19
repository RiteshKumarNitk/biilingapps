
"use client"

import { useState, useEffect } from 'react'
import { getProducts } from '@/actions/inventory'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ModernLoader } from '@/components/ui/modern-loader'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BarChart3, AlertTriangle, PackageCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function StockSummaryPage() {
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filterCategory, setFilterCategory] = useState("all")
    const [filterStatus, setFilterStatus] = useState("all")
    const [search, setSearch] = useState("")

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const { data } = await getProducts(1, 2000) // Fetch all for summary
            setProducts(data || [])
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="flex-1 h-full flex items-center justify-center"><ModernLoader text="Calculating Stock..." /></div>

    // Calculations
    const totalValue = products.reduce((acc, p) => acc + (p.stock_quantity * (p.cost_price || 0)), 0)
    const lowStockItems = products.filter(p => p.stock_quantity <= (p.low_stock_threshold || 0))

    // Filtering
    const filtered = products.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
        const matchCat = filterCategory === "all" || p.category === filterCategory
        const matchStatus = filterStatus === "all"
            || (filterStatus === "low" && p.stock_quantity <= (p.low_stock_threshold || 0))
            || (filterStatus === "available" && p.stock_quantity > 0)
            || (filterStatus === "out" && p.stock_quantity <= 0)

        return matchSearch && matchCat && matchStatus
    })

    const categories = Array.from(new Set(products.map(p => p.category || 'Uncategorized')))

    return (
        <div className="flex-1 bg-[#F5F7FA] h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-white border-b px-6 py-4 flex flex-col shrink-0">
                <h1 className="text-xl font-bold text-slate-800">Stock Summary</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    <Card className="bg-blue-50 border-blue-200 shadow-sm">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                <BarChart3 className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500 uppercase">Total Stock Value</p>
                                <p className="text-2xl font-bold text-slate-800">₹ {totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-orange-50 border-orange-200 shadow-sm">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500 uppercase">Low Stock Items</p>
                                <p className="text-2xl font-bold text-slate-800">{lowStockItems.length}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-emerald-50 border-emerald-200 shadow-sm">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                                <PackageCheck className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500 uppercase">Total Items</p>
                                <p className="text-2xl font-bold text-slate-800">{products.length}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Filters & Table */}
            <div className="flex-1 flex flex-col p-6 min-h-0">
                <div className="bg-white border rounded-lg shadow-sm flex flex-col h-full overflow-hidden">
                    <div className="p-4 border-b flex gap-4 items-center shrink-0">
                        <Input
                            placeholder="Search Item..."
                            className="w-64"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <Select value={filterCategory} onValueChange={setFilterCategory}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {categories.map(c => (
                                    <SelectItem key={c} value={c}>{c}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Stock Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="low">Low Stock</SelectItem>
                                <SelectItem value="out">Out of Stock</SelectItem>
                                <SelectItem value="available">Available</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex-1 overflow-auto">
                        <Table>
                            <TableHeader className="bg-slate-50 sticky top-0 z-10">
                                <TableRow>
                                    <TableHead>Item Name</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead className="text-right">Qty</TableHead>
                                    <TableHead className="text-right">Purchase Price</TableHead>
                                    <TableHead className="text-right">Stock Value</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map(p => (
                                    <TableRow key={p.id} className="hover:bg-slate-50">
                                        <TableCell className="font-medium">{p.name}</TableCell>
                                        <TableCell>{p.category || '-'}</TableCell>
                                        <TableCell className="text-right font-mono">{p.stock_quantity} {p.unit}</TableCell>
                                        <TableCell className="text-right">₹ {p.cost_price?.toFixed(2)}</TableCell>
                                        <TableCell className="text-right font-bold text-slate-700">₹ {(p.stock_quantity * (p.cost_price || 0)).toFixed(2)}</TableCell>
                                        <TableCell className="text-center">
                                            {p.stock_quantity <= (p.low_stock_threshold || 0) ? (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                                    Low Stock
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                    In Stock
                                                </span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filtered.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center text-slate-400">
                                            No items found matching filters
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </div>
    )
}
