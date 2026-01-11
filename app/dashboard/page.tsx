import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, ArrowDown, ArrowUp, MessageCircle, BarChart3, FileText, TrendingUp, TrendingDown, Users, Package, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { getDashboardStats, getOverviewChartData, getSalesByCategory, getRecentSales, getInventoryStats, getCustomerStats, getOperationsStats } from '@/actions/dashboard'
import { SalesChart } from '@/components/dashboard/sales-chart'
import { CategoryChart } from '@/components/dashboard/category-chart'
import { RecentTransactions } from '@/components/dashboard/recent-transactions'
import { InventoryStats } from '@/components/dashboard/inventory-stats'
import { CustomerStats } from '@/components/dashboard/customer-stats'
import { OperationsStats } from '@/components/dashboard/operations-stats'
import { DashboardDateFilter } from '@/components/dashboard/date-filter'

export default async function DashboardPage({
    searchParams
}: {
    searchParams: Promise<{ period?: string }>
}) {
    const params = await searchParams
    const period = params.period || 'this-month'

    // Calculate backend Filters based on Period
    // Actions are usually expecting discrete month/year if filtering strict.
    // For 'period' logic, I'll pass simple undefined if 'all' or 'this-year' to let action handle defaults
    // OR map perfectly here.

    const now = new Date()
    let filterMonth: number | undefined = undefined
    let filterYear: number | undefined = undefined

    if (period === 'this-month') {
        filterMonth = now.getMonth()
        filterYear = now.getFullYear()
    } else if (period === 'last-month') {
        filterMonth = now.getMonth() - 1
        filterYear = now.getFullYear()
        if (filterMonth < 0) {
            filterMonth = 11
            filterYear = now.getFullYear() - 1
        }
    } else if (period === 'this-year') {
        // filterMonth remains undefined
        filterYear = now.getFullYear()
    } else if (period === 'all') {
        // both undefined
    }

    const stats = await getDashboardStats(filterMonth, filterYear)
    const overviewData = await getOverviewChartData(filterYear)
    const categoryData = await getSalesByCategory()
    const recentSales = await getRecentSales()
    const inventoryStats = await getInventoryStats()
    const customerStats = await getCustomerStats()
    const operationsStats = await getOperationsStats()

    return (
        <div className="space-y-6">
            {/* Context Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-800">Overview</h2>
                    <p className="text-sm text-slate-500">Business performance summary</p>
                </div>
                <DashboardDateFilter />
            </div>

            {/* KPI Cards (Filtered) */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="rounded-xl border-none shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                        <CreditCard className="h-16 w-16 text-blue-600" />
                    </div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Total Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">₹{stats.totalRevenue.toLocaleString()}</div>
                        <div className="flex items-center text-xs text-muted-foreground mt-1 gap-2">
                            {stats.growthPercentage >= 0 ? (
                                <span className="text-emerald-600 flex items-center font-medium bg-emerald-50 px-1.5 py-0.5 rounded">
                                    <TrendingUp className="h-3 w-3 mr-1" />
                                    {stats.growthPercentage.toFixed(1)}%
                                </span>
                            ) : (
                                <span className="text-red-600 flex items-center font-medium bg-red-50 px-1.5 py-0.5 rounded">
                                    <TrendingDown className="h-3 w-3 mr-1" />
                                    {Math.abs(stats.growthPercentage).toFixed(1)}%
                                </span>
                            )}
                            <span className="opacity-70">
                                {period === 'this-month' ? 'vs last month' : 'growth'}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-xl border-none shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Total Sales</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{stats.salesCount}</div>
                        <p className="text-xs text-slate-400 mt-1">Invoices in period</p>
                    </CardContent>
                </Card>

                <Card className="rounded-xl border-none shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Receivable</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">₹{stats.totalReceivable.toLocaleString()}</div>
                        <div className="flex items-center gap-1 mt-1">
                            <span className="text-xs font-medium bg-green-50 text-green-700 px-1.5 py-0.5 rounded">
                                {stats.receivablePartiesCount} Parties
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-xl border-none shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Payable</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">₹{stats.totalPayable.toLocaleString()}</div>
                        <div className="flex items-center gap-1 mt-1">
                            <span className="text-xs font-medium bg-red-50 text-red-700 px-1.5 py-0.5 rounded">
                                {stats.payablePartiesCount} Parties
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* New Middle Section: Operational Insights */}
            <div className="grid gap-6 md:grid-cols-12">
                <div className="md:col-span-8 space-y-6">
                    <InventoryStats
                        lowStockItems={inventoryStats.lowStockItems}
                        topProducts={inventoryStats.topProducts}
                    />
                    <OperationsStats
                        pendingQuotes={operationsStats.pendingQuotes}
                        pendingPO={operationsStats.pendingPO}
                    />
                </div>
                <div className="md:col-span-4 h-full">
                    <CustomerStats topCustomers={customerStats.topCustomers} />
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid gap-6 md:grid-cols-7">
                <Card className="md:col-span-4 lg:col-span-5 rounded-xl border-none shadow-sm">
                    <CardHeader>
                        <CardTitle>Sales Trend</CardTitle>
                        <CardDescription>Revenue performance over time</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-0">
                        <SalesChart data={overviewData} />
                    </CardContent>
                </Card>

                <Card className="md:col-span-3 lg:col-span-2 rounded-xl border-none shadow-sm">
                    <CardHeader>
                        <CardTitle>Category Pie</CardTitle>
                        <CardDescription>Sales distribution</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CategoryChart data={categoryData} />
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Row: Recent & Widgets */}
            <div className="grid gap-6 md:grid-cols-12">
                {/* Recent Transactions */}
                <Card className="md:col-span-7 lg:col-span-8 rounded-xl border-none shadow-sm">
                    <CardHeader>
                        <CardTitle>Recent Transactions</CardTitle>
                        <CardDescription>Latest 5 invoices created</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RecentTransactions transactions={recentSales} />
                    </CardContent>
                </Card>

                {/* Quick Widgets */}
                <div className="md:col-span-5 lg:col-span-4 space-y-4">
                    {/* WhatsApp */}
                    <Card className="rounded-xl border-none shadow-sm bg-gradient-to-br from-green-50 to-white">
                        <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
                            <div className="bg-green-100 p-2 rounded-full">
                                <MessageCircle className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-800">WhatsApp Marketing</h3>
                                <p className="text-xs text-slate-500">Send bulk offers & invoices</p>
                            </div>
                            <Button className="w-full bg-green-600 hover:bg-green-700 text-white h-8 rounded-full text-xs" size="sm">
                                Connect WhatsApp
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Quick Links with more items */}
                    <Card className="rounded-xl border-none shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Quick Access</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-2">
                            <Link href="/dashboard/reports/sales">
                                <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer text-center h-full">
                                    <BarChart3 className="h-5 w-5 text-blue-600 mb-1" />
                                    <span className="text-[10px] font-medium text-slate-700">Sale Report</span>
                                </div>
                            </Link>
                            <Link href="/dashboard/accounting/day-book">
                                <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors cursor-pointer text-center h-full">
                                    <FileText className="h-5 w-5 text-purple-600 mb-1" />
                                    <span className="text-[10px] font-medium text-slate-700">Daybook</span>
                                </div>
                            </Link>
                            <Link href="/dashboard/parties">
                                <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors cursor-pointer text-center h-full">
                                    <Users className="h-5 w-5 text-orange-600 mb-1" />
                                    <span className="text-[10px] font-medium text-slate-700">Parties</span>
                                </div>
                            </Link>
                            <div className="flex flex-col items-center justify-center p-3 rounded-lg border-2 border-dashed border-slate-200 hover:border-slate-300 transition-colors cursor-pointer text-center h-full text-slate-400 hover:text-slate-600">
                                <Plus className="h-5 w-5 mb-1" />
                                <span className="text-[10px] font-medium">More</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
