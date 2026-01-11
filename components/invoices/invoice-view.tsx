
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
                    <h3 className="font-bold text-lg uppercase">{tenant.name}</h3>
                    <div className="text-xs text-muted-foreground space-y-0.5 mt-1">
                        <p className="whitespace-pre-line">{tenant.address}</p>
                        {tenant.phone && <p>Ph: {tenant.phone}</p>}
                        {tenant.email && <p>{tenant.email}</p>}
                        {tenant.gstin && <p className="font-medium">GSTIN: {tenant.gstin}</p>}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex justify-between gap-8">
                    <div>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase">Billed To</h4>
                        <p className="font-bold text-slate-900">{invoice.party_name}</p>
                        {invoice.party_address && <p className="text-sm text-slate-600 whitespace-pre-line mt-1">{invoice.party_address}</p>}
                        {(invoice.party_phone || invoice.party_email) && (
                            <div className="mt-2 text-xs text-slate-500 space-y-0.5">
                                {invoice.party_phone && <p>Ph: {invoice.party_phone}</p>}
                                {invoice.party_email && <p>Email: {invoice.party_email}</p>}
                            </div>
                        )}
                    </div>
                    {invoice.shipping_address && (
                        <div>
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase">Shipped To</h4>
                            <p className="font-medium text-slate-900">{invoice.party_name}</p>
                            <p className="text-sm text-slate-600 whitespace-pre-line mt-1">{invoice.shipping_address}</p>
                        </div>
                    )}
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
                            <TableHead>#</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>HSN/SAC</TableHead>
                            <TableHead className="text-right">Qty</TableHead>
                            <TableHead className="text-right">Unit</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead className="text-right">Disc</TableHead>
                            <TableHead className="text-right">GST %</TableHead>
                            <TableHead className="text-right">Tax Amt</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map((item: any, index: number) => (
                            <TableRow key={item.id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell className="font-medium">{item.description}</TableCell>
                                <TableCell>{item.products?.hsn_code || '-'}</TableCell>
                                <TableCell className="text-right">{item.quantity}</TableCell>
                                <TableCell className="text-right">{item.unit || '-'}</TableCell>
                                <TableCell className="text-right">₹{item.unit_price}</TableCell>
                                <TableCell className="text-right">{item.discount ? `₹${item.discount}` : '-'}</TableCell>
                                <TableCell className="text-right">{item.gst_rate}%</TableCell>
                                <TableCell className="text-right">₹{(item.tax_amount || 0).toFixed(2)}</TableCell>
                                <TableCell className="text-right font-semibold">₹{item.total_amount}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                <div className="flex justify-end">
                    <div className="w-1/3 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Subtotal:</span>
                            <span>₹{items.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-red-500">
                            <span>Discount:</span>
                            <span>-₹{items.reduce((acc, item) => acc + (item.discount || 0), 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Tax:</span>
                            <span>₹{items.reduce((acc, item) => acc + (item.tax_amount || 0), 0).toFixed(2)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold text-lg">
                            <span>Total:</span>
                            <span>₹{invoice.grand_total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                </div>

                {/* Terms / Notes */}
                <div className="mt-8 border-t pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {invoice.notes && (
                            <div>
                                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Notes</h4>
                                <p className="text-sm text-slate-600 whitespace-pre-line bg-slate-50 p-3 rounded border border-slate-100">{invoice.notes}</p>
                            </div>
                        )}

                        <div>
                            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Terms & Conditions</h4>
                            {tenant.settings?.terms ? (
                                <p className="text-sm text-slate-600 whitespace-pre-line">{tenant.settings.terms}</p>
                            ) : (
                                <ol className="list-decimal list-inside text-sm text-slate-600 space-y-1">
                                    <li>Goods once sold will not be taken back.</li>
                                    <li>Interest @ 18% p.a. will be charged if payment is not made within the due date.</li>
                                    <li>Subject to local jurisdiction only.</li>
                                </ol>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card >
    )
}
