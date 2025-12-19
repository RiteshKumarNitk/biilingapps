import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, ArrowDown, ArrowUp, MoreHorizontal, MessageCircle, BarChart3, FileText, ChevronDown, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { getDashboardStats, getOverviewChartData } from '@/actions/dashboard'
import { Overview } from '@/components/dashboard/overview'
import { SalesChart } from '@/components/dashboard/sales-chart' // New component I need to create

export default async function DashboardPage() {
    // Fetch real data
    const stats = await getDashboardStats()
    const overviewData = await getOverviewChartData()

    return (
        <div className="space-y-6">

            {/* Top Summary Cards (KPIs) */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 items-start">
                {/* Total Receivable */}
                <Card className="rounded-xl border-none shadow-sm overflow-hidden">
                    <CardContent className="p-6 relative">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-slate-500 mb-1">Total Receivable</p>
                                <div className="text-3xl font-bold text-slate-800">
                                    ₹ {stats.totalReceivable?.toLocaleString() || '0'}
                                </div>
                                <p className="text-xs text-slate-400 mt-2">
                                    From {stats.receivablePartiesCount} Parties
                                </p>
                            </div>
                            <div className="bg-green-50 p-2 rounded-full">
                                <ArrowDown className="h-5 w-5 text-green-600" />
                            </div>
                        </div>
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-green-500/20">
                            <div className="h-full bg-green-500 w-3/4"></div>
                        </div>
                    </CardContent>
                </Card>

                {/* Total Payable */}
                <Card className="rounded-xl border-none shadow-sm overflow-hidden">
                    <CardContent className="p-6 relative">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-slate-500 mb-1">Total Payable</p>
                                <div className="text-3xl font-bold text-slate-800">
                                    ₹ {stats.totalPayable?.toLocaleString() || '0'}
                                </div>
                                <p className="text-xs text-slate-400 mt-2">
                                    To {stats.payablePartiesCount} Parties
                                </p>
                            </div>
                            <div className="bg-red-50 p-2 rounded-full">
                                <ArrowUp className="h-5 w-5 text-red-600" />
                            </div>
                        </div>
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-red-500/20">
                            <div className="h-full bg-red-500 w-1/4"></div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-12 lg:grid-cols-12">
                {/* Main Analytics Section - Total Sale Chart */}
                <Card className="md:col-span-8 rounded-xl border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div className="space-y-1">
                            <CardTitle className="text-base font-normal text-slate-500">Total Sale</CardTitle>
                            <div className="text-2xl font-bold">
                                ₹ {stats.totalRevenue?.toLocaleString()}
                            </div>
                        </div>
                        <Button variant="outline" size="sm" className="h-8 text-xs font-normal text-slate-500">
                            This Month <ChevronDown className="ml-2 h-3 w-3" />
                        </Button>
                    </CardHeader>
                    <CardContent className="pl-0">
                        {/* Use existing chart data but with Line Chart in future. For now reusing Bar or creating new Line */}
                        {/* I'll use a new SalesChart component which I will create next */}
                        <SalesChart data={overviewData} />
                    </CardContent>
                </Card>

                {/* Right Side Widgets */}
                <div className="md:col-span-4 space-y-4">

                    {/* WhatsApp Connect */}
                    <Card className="rounded-xl border-none shadow-sm">
                        <CardContent className="p-4 flex flex-col items-center text-center space-y-3">
                            <div className="bg-green-100 p-3 rounded-full">
                                <MessageCircle className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-800">WhatsApp Connect</h3>
                                <p className="text-xs text-slate-500 mt-1">Send invoices directly on WhatsApp</p>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] bg-slate-100 px-2 py-1 rounded">
                                <span className="h-2 w-2 rounded-full bg-red-500"></span>
                                <span className="text-slate-500 font-medium">LOGGED OUT</span>
                            </div>
                            <Button className="w-full bg-green-600 hover:bg-green-700 text-white h-9 rounded-full text-xs" size="sm">
                                Connect WhatsApp
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Google Profile Manager */}
                    <Card className="rounded-xl border-none shadow-sm">
                        <CardContent className="p-4 flex flex-col items-center text-center space-y-3">
                            <div className="bg-blue-100 p-3 rounded-full">
                                <span className="text-xl font-bold text-blue-600">G</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-800">Google Profile</h3>
                                <p className="text-xs text-slate-500 mt-1">Manage your business on Google</p>
                            </div>
                            <Button disabled className="w-full bg-blue-50 text-blue-600 hover:bg-blue-100 h-9 rounded-full text-xs" size="sm">
                                Connect Now
                            </Button>
                        </CardContent>
                    </Card>

                </div>
            </div>

            {/* Bottom Section: Reports & Add Widget */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-700">Most Used Reports</h3>
                    <Link href="/dashboard/reports" className="text-xs text-blue-600 font-medium hover:underline">
                        View All
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {/* Report Cards */}
                    <Link href="/dashboard/reports/sales">
                        <Card className="rounded-xl border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full">
                            <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                    <BarChart3 className="h-5 w-5" />
                                </div>
                                <span className="text-xs font-semibold text-slate-700">Sale Report</span>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/dashboard/accounting/day-book">
                        <Card className="rounded-xl border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full">
                            <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                                <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <span className="text-xs font-semibold text-slate-700">Daybook</span>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/dashboard/reports/transactions">
                        <Card className="rounded-xl border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full">
                            <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                                <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                                    <RefreshCw className="h-5 w-5" />
                                </div>
                                <span className="text-xs font-semibold text-slate-700">All Transactions</span>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/dashboard/reports/party">
                        <Card className="rounded-xl border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full">
                            <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                                <div className="p-2 bg-teal-50 rounded-lg text-teal-600">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <span className="text-xs font-semibold text-slate-700">Party Statement</span>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Add Widget Placeholder */}
                    <Card className="rounded-xl border-2 border-dashed border-slate-200 shadow-none hover:border-blue-400 bg-transparent cursor-pointer h-full group">
                        <CardContent className="p-4 flex flex-col items-center text-center gap-2 justify-center h-full">
                            <div className="p-1 bg-slate-100 rounded-full text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500">
                                <Plus className="h-5 w-5" />
                            </div>
                            <span className="text-xs font-medium text-slate-400 group-hover:text-blue-500">Add Widget</span>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
