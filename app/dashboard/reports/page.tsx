
import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'

export default async function ReportsPage() {
    const supabase = await createClient()

    // Fetch some stats
    const { data: invoices } = await supabase.from('invoices').select('grand_total, payment_status, created_at')
    const { data: products } = await supabase.from('products').select('*')

    // Calculate Reports
    const totalSales = invoices?.reduce((acc, curr) => acc + curr.grand_total, 0) || 0
    const paidSales = invoices?.filter(i => i.payment_status === 'paid').reduce((acc, curr) => acc + curr.grand_total, 0) || 0
    const pendingSales = totalSales - paidSales
    const stockValue = products?.reduce((acc: number, curr: any) => acc + (curr.stock * curr.price), 0) || 0

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
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

            {/* Could add graph or detailed tables here */}
            <h3 className="text-lg font-medium mt-8 mb-4">Stock Report</h3>
            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead className="text-right">Stock Qty</TableHead>
                            <TableHead className="text-right">Unit Price</TableHead>
                            <TableHead className="text-right">Total Value</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products?.map((p) => (
                            <TableRow key={p.id}>
                                <TableCell>{p.name}</TableCell>
                                <TableCell className="text-right">{p.stock}</TableCell>
                                <TableCell className="text-right">₹{p.price}</TableCell>
                                <TableCell className="text-right">₹{(p.stock * p.price).toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

        </div>
    )
}
