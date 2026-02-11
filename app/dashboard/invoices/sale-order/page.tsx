
import React from 'react'
import Link from 'next/link'
import { getSaleOrders } from '@/actions/sale-orders'
import { SaleOrderTable } from '@/components/sale-order/sale-order-table'
import { Button } from '@/components/ui/button'
import { Plus, ShoppingBag } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { parseISO } from 'date-fns'
import { InvoicesSearch } from '../search'
import { SaleOrderFilters } from './filters'

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function SaleOrderPage({ searchParams }: PageProps) {
    const params = await searchParams
    const search = typeof params.search === 'string' ? params.search : undefined
    const status = typeof params.status === 'string' ? params.status : undefined
    const sortBy = typeof params.sortBy === 'string' ? params.sortBy : undefined
    const sortOrder = (params.sortOrder === 'asc' || params.sortOrder === 'desc') ? params.sortOrder : undefined

    const startDateParam = typeof params.startDate === 'string' ? params.startDate : undefined
    const endDateParam = typeof params.endDate === 'string' ? params.endDate : undefined

    let startDate: Date | undefined
    let endDate: Date | undefined
    if (startDateParam) startDate = parseISO(startDateParam)
    if (endDateParam) endDate = parseISO(endDateParam)

    const orders = await getSaleOrders(1, 100, {
        search,
        startDate,
        endDate,
        status,
        sortBy,
        sortOrder
    })

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
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                <InvoicesSearch />

                <div className="flex items-center gap-2">
                    <DatePickerWithRange />
                    <SaleOrderFilters />
                </div>
            </div>

            {/* Transactions Section */}
            <Card className="rounded-xl border-none shadow-sm overflow-hidden bg-white">
                <SaleOrderTable data={orders} />
            </Card>
        </div>
    )
}
