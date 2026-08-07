import { getOnlineOrders } from '@/actions/store'
import { Card } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { format } from 'date-fns'
import { OrderStatusSelector } from '@/components/store/order-status-selector'

type OrderItem = { name: string; quantity: number }

export default async function StoreOrdersPage() {
    const orders = await getOnlineOrders()

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Store Orders</h1>
                <p className="text-sm text-slate-500 mt-1">Orders placed through your online store.</p>
            </div>

            <Card className="rounded-xl border-none shadow-sm bg-white overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Items</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.map((order) => {
                            const items = Array.isArray(order.items) ? (order.items as unknown as OrderItem[]) : []
                            return (
                                <TableRow key={order.id}>
                                    <TableCell>{format(new Date(order.createdAt), 'dd MMM yyyy')}</TableCell>
                                    <TableCell className="font-medium">{order.customerName}</TableCell>
                                    <TableCell className="text-muted-foreground">{order.customerPhone}</TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {items.map(i => `${i.name} x${i.quantity}`).join(', ') || '-'}
                                    </TableCell>
                                    <TableCell className="text-right font-semibold">
                                        ₹{order.totalAmount.toLocaleString('en-IN')}
                                    </TableCell>
                                    <TableCell>
                                        <OrderStatusSelector id={order.id} currentStatus={order.status} />
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                        {orders.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-32 text-muted-foreground">
                                    No orders yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    )
}
