
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export function InvoiceView({ invoice, items, tenant }: { invoice: any, items: any[], tenant: any }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-2xl font-bold">INVOICE</CardTitle>
                    <p className="text-sm text-muted-foreground">{invoice.invoice_number}</p>
                </div>
                <div className="text-right">
                    <h3 className="font-semibold">{tenant.name}</h3>
                    <p className="text-sm text-muted-foreground">{tenant.email}</p>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex justify-between">
                    <div>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase">Billed To</h4>
                        <p className="font-medium">{invoice.party_name}</p>
                    </div>
                    <div className="text-right">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase">Details</h4>
                        <p className="text-sm">Date: {format(new Date(invoice.date), 'dd MMM yyyy')}</p>
                        <p className="text-sm">Due: {invoice.due_date ? format(new Date(invoice.due_date), 'dd MMM yyyy') : '-'}</p>
                        <div className="mt-1">
                            <Badge variant={invoice.payment_status === 'paid' ? 'default' : 'secondary'}>
                                {invoice.payment_status.toUpperCase()}
                            </Badge>
                        </div>
                    </div>
                </div>

                <Separator />

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Qty</TableHead>
                            <TableHead className="text-right">Unit Price</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map((item: any) => (
                            <TableRow key={item.id}>
                                <TableCell>{item.description}</TableCell>
                                <TableCell className="text-right">{item.quantity}</TableCell>
                                <TableCell className="text-right">₹{item.unit_price}</TableCell>
                                <TableCell className="text-right">₹{item.total_amount}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                <div className="flex justify-end">
                    <div className="w-1/3 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Subtotal:</span>
                            <span>₹{invoice.subtotal}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Tax:</span>
                            <span>₹{invoice.grand_total - invoice.subtotal}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold text-lg">
                            <span>Total:</span>
                            <span>₹{invoice.grand_total}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
