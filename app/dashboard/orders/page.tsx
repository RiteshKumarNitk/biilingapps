
import { getOnlineOrders, updateOrderStatus } from '@/actions/store'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { OrderStatusSelector } from '@/components/store/order-status-selector'

export default async function OrdersPage() {
    const orders = await getOnlineOrders()

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Online Orders</h2>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Items</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                    No orders received yet.
                                </TableCell>
                            </TableRow>
                        ) : (
                            orders?.map((order: any) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}</TableCell>
                                    <TableCell>
                                        <div className="font-medium">{order.customer_name}</div>
                                        <div className="text-xs text-muted-foreground">{order.customer_phone}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-xs max-w-[200px]">
                                            {order.items.map((i: any) => `${i.quantity}x ${i.name}`).join(', ')}
                                        </div>
                                    </TableCell>
                                    <TableCell>₹{order.total_amount}</TableCell>
                                    <TableCell>{format(new Date(order.created_at), 'dd MMM yyyy')}</TableCell>
                                    <TableCell>
                                        <OrderStatusSelector id={order.id} currentStatus={order.status} />
                                    </TableCell>
                                    <TableCell>
                                        {/* View Details Action could be added */}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
