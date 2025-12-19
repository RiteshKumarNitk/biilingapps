
"use client"

import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Filter, ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ItemsFilterBar() {
    return (
        <div className="bg-white border-b px-4 py-2 flex items-center justify-between gap-4 sticky top-14 z-20">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                    placeholder="Search by Item Name / Code"
                    className="pl-9 h-9 bg-slate-50 border-slate-200 text-sm focus:ring-1 focus:ring-blue-500"
                />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
                <Select defaultValue="all">
                    <SelectTrigger className="h-9 w-32 border-slate-200 text-xs text-slate-600 bg-slate-50">
                        <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Items</SelectItem>
                        <SelectItem value="product">Products</SelectItem>
                        <SelectItem value="service">Services</SelectItem>
                    </SelectContent>
                </Select>

                <Select defaultValue="all_stock">
                    <SelectTrigger className="h-9 w-32 border-slate-200 text-xs text-slate-600 bg-slate-50">
                        <SelectValue placeholder="Stock" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all_stock">All Stock</SelectItem>
                        <SelectItem value="low">Low Stock</SelectItem>
                        <SelectItem value="out">Out of Stock</SelectItem>
                    </SelectContent>
                </Select>

                <Select defaultValue="all_cats">
                    <SelectTrigger className="h-9 w-32 border-slate-200 text-xs text-slate-600 bg-slate-50">
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all_cats">All Categories</SelectItem>
                        {/* Dynamic Categories */}
                    </SelectContent>
                </Select>

                <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-500 hover:bg-slate-100">
                    <ArrowUpDown className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}
