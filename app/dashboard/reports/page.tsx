import { requireAuth } from '@/lib/auth-server'
import prisma from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { BarChart3, FileText, ShoppingCart, Users, Receipt } from 'lucide-react'

export default async function ReportsPage() {
    const user = await requireAuth()

    // Fetch some stats
    const invoices = await prisma.invoice.findMany({
        where: { tenantId: user.tenantId },
        select: { grandTotal: true, paymentStatus: true, createdAt: true }
    })
    
    const products = await prisma.product.findMany({
        where: { tenantId: user.tenantId }
    })

    // Calculate Reports
    const totalSales = invoices.reduce((acc, curr) => acc + curr.grandTotal, 0) || 0
    const pendingSales = totalSales - (invoices.filter(i => i.paymentStatus?.toUpperCase() === 'PAID').reduce((acc, curr) => acc + curr.grandTotal, 0) || 0)
    const stockValue = products.reduce((acc: number, curr: any) => acc + (curr.stockQuantity * curr.price), 0) || 0

    const quickLinks = [
        { title: 'Sales Report', href: '/dashboard/reports/sales', icon: Receipt, color: 'text-blue-600', bg: 'bg-blue-100/50' },
        { title: 'Purchase Report', href: '/dashboard/reports/purchase', icon: ShoppingCart, color: 'text-orange-600', bg: 'bg-orange-100/50' },
        { title: 'Stock Report', href: '/dashboard/reports/stock', icon: BarChart3, color: 'text-purple-600', bg: 'bg-purple-100/50' },
        { title: 'Party Report', href: '/dashboard/reports/party', icon: Users, color: 'text-pink-600', bg: 'bg-pink-100/50' },
        { title: 'GST Report', href: '/dashboard/reports/gst', icon: FileText, color: 'text-green-600', bg: 'bg-green-100/50' },
    ]

    return (
        <div className="flex-1 space-y-8 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Reports Overview</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{totalSales.toFixed(2)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">₹{pendingSales.toFixed(2)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Stock Value</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{stockValue.toFixed(2)}</div>
                    </CardContent>
                </Card>
            </div>

            <div>
                <h3 className="text-lg font-medium mb-4">Detailed Reports</h3>
                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
                    {quickLinks.map((link) => (
                        <Link key={link.title} href={link.href}>
                            <Card className="hover:bg-slate-50 transition-colors cursor-pointer border-slate-200">
                                <CardContent className="p-6 flex flex-col items-center justify-center gap-3 text-center h-full">
                                    <div className={`p-3 rounded-full ${link.bg}`}>
                                        <link.icon className={`h-6 w-6 ${link.color}`} />
                                    </div>
                                    <span className="font-medium text-slate-700">{link.title}</span>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}
