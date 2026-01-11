import React from 'react'
import Link from 'next/link'
import { getSaleOrders } from '@/actions/sale-orders'
import { SaleOrderTable } from '@/components/sale-order/sale-order-table'
import { Button } from '@/components/ui/button'
import { Plus, Search, ChevronDown, SlidersHorizontal } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function SaleOrderPage({ searchParams }: PageProps) {
    const params = await searchParams
    const search = (params.search as string) || ''

    const orders = await getSaleOrders(search)

    return (
        <div className="min-h-screen bg-[#F5F7FA] p-6 space-y-6">

            {/* Top Tabs */}
            <div className="flex border-b border-slate-200">
                <div className="px-6 py-3 border-b-2 border-blue-600 text-blue-600 font-semibold cursor-pointer">
                    SALE ORDERS
                </div>
                <div className="px-6 py-3 text-slate-500 font-medium hover:text-slate-700 cursor-not-allowed">
                    ONLINE ORDERS
                </div>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 group cursor-pointer">
                    <h1 className="text-xl font-semibold text-slate-800">Sale Orders</h1>
                    <ChevronDown className="h-5 w-5 text-slate-400 group-hover:text-slate-600" />
                </div>
                <div className="flex items-center gap-3">
                    {/* Placeholder for Bulk Convert Button appearing in Header as per request? 
                        Request says "Bulk Convert To Sale (outlined red button)" in Page Header Right.
                        However, usually bulk actions depend on selection. 
                        I put a bulk action bar in the table which is cleaner for selection-based logic.
                        I will add the visual button here but strictly it might just scroll to table or be disabled if none selected.
                        I'll leave it as a visual indicator or link to logic. 
                        Actually, request says "Selecting multiple rows enables bulk convert" under Bulk Convert section.
                        So maybe the header button is a global "Convert All Open" or just incorrect placement in prompt vs logic.
                        I will place "Add Sale Order" as blue button clearly.
                        I'll use the red outlined button as a "Bulk Convert" that might trigger "Select All" or just be static for now to match UI requirement.
                    */}
                    <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hidden sm:flex">
                        Bulk Convert To Sale
                    </Button>

                    <Link href="/dashboard/invoices/sale-order/new">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 shadow-sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Sale Order
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Transactions Section */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-slate-700">TRANSACTIONS</h3>

                    {/* Search & Filters */}
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <form>
                                <Input
                                    name="search"
                                    placeholder="Search Party or Order No..."
                                    className="pl-9 h-9 w-[260px] bg-white border-slate-200 rounded-md focus:ring-blue-500"
                                    defaultValue={search}
                                />
                            </form>
                        </div>
                        <Button variant="outline" size="icon" className="h-9 w-9 bg-white border-slate-200 text-slate-600">
                            <SlidersHorizontal className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <SaleOrderTable data={orders} />
            </div>

        </div>
    )
}
