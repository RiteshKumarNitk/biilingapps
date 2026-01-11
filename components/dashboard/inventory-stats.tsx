'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Package } from "lucide-react"

export function InventoryStats({
    lowStockItems,
    topProducts
}: {
    lowStockItems: any[]
    topProducts: any[]
}) {
    return (
        <div className="grid gap-4 md:grid-cols-2">
            {/* Low Stock Alert */}
            <Card className="shadow-sm border-none bg-white">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-medium text-slate-500">
                        Low Stock Alerts
                    </CardTitle>
                    <AlertCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    {lowStockItems.length === 0 ? (
                        <p className="text-sm text-slate-400">All items are well stocked.</p>
                    ) : (
                        <div className="space-y-3">
                            {lowStockItems.slice(0, 4).map((item) => (
                                <div key={item.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded bg-red-50 flex items-center justify-center text-red-600">
                                            <Package className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-800">{item.name}</p>
                                            <p className="text-xs text-slate-500">{item.category || 'Uncategorized'}</p>
                                        </div>
                                    </div>
                                    <span className="text-red-600 font-bold text-sm bg-red-50 px-2 py-0.5 rounded">
                                        {item.stock_quantity} left
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Top Products */}
            <Card className="shadow-sm border-none bg-white">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500">
                        Top Selling Items
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {topProducts.map((product, i) => (
                            <div key={product.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${i === 0 ? 'bg-yellow-100 text-yellow-700' :
                                            i === 1 ? 'bg-slate-100 text-slate-700' :
                                                'bg-orange-50 text-orange-700'
                                        }`}>
                                        {i + 1}
                                    </span>
                                    <span className="text-sm font-medium text-slate-700 truncate max-w-[120px]">
                                        {product.name}
                                    </span>
                                </div>
                                <span className="text-xs font-semibold text-slate-600">
                                    {product.count} Sold
                                </span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
