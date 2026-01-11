
import React from 'react'
import Link from 'next/link'
import { getSaleOrders } from '@/actions/sale-orders'
import { SaleOrderTable } from '@/components/sale-order/sale-order-table'
import { Button } from '@/components/ui/button'
import { Plus, Search, Filter, ShoppingBag } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { parseISO } from 'date-fns'

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function SaleOrderPage({ searchParams }: PageProps) {
    const params = await searchParams
    const search = (params.search as string) || ''
    const startDateParam = typeof params.startDate === 'string' ? params.startDate : undefined
    const endDateParam = typeof params.endDate === 'string' ? params.endDate : undefined

    let startDate: Date | undefined
    let endDate: Date | undefined
    if (startDateParam) startDate = parseISO(startDateParam)
    if (endDateParam) endDate = parseISO(endDateParam)

    const orders = await getSaleOrders(search, { startDate, endDate })

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sale Orders</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage orders, convert to invoices, and track status.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="hidden sm:flex bg-white hover:bg-slate-50 text-red-600 border-red-200 hover:text-red-700 hover:border-red-300">
                        Bulk Convert
                    </Button>
                    <Link href="/dashboard/invoices/sale-order/new">
                        <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-200">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Order
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Quick Stats (Optional / derived from list or static for now to match layout) */}
            <div className="grid gap-4 md:grid-cols-1">
                <Card className="rounded-xl border-none shadow-sm bg-gradient-to-br from-blue-50 to-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-5">
                        <ShoppingBag className="h-24 w-24 text-blue-600" />
                    </div>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100/50 rounded-lg text-blue-600">
                                <ShoppingBag className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Total Orders</p>
                                <h3 className="text-2xl font-bold text-slate-900 mt-0.5">
                                    {orders?.length || 0}
                                </h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters & Actions Bar */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        name="search"
                        placeholder="Search order no or party..."
                        defaultValue={search}
                        className="pl-9 h-10 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <DatePickerWithRange />
                    <Button variant="outline" size="icon" className="h-10 w-10 border-slate-200 text-slate-500 hover:text-slate-700">
                        <Filter className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Transactions Section */}
            <Card className="rounded-xl border-none shadow-sm overflow-hidden bg-white">
                <SaleOrderTable data={orders} />
            </Card>
        </div>
    )
}
