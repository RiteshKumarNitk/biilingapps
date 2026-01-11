
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export function PurchaseBillView({ bill, items, tenant }: { bill: any, items: any[], tenant: any }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-2xl font-bold">PURCHASE BILL</CardTitle>
                    <p className="text-sm text-muted-foreground">{bill.po_number}</p>
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
                    <div className="flex-1">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Supplier Details</h4>
                        <p className="font-bold text-slate-900 text-lg">{bill.parties?.name || bill.party_name}</p>

                        <div className="text-sm text-slate-600 mt-2 space-y-1">
                            {bill.parties?.address && <p>{bill.parties.address}</p>}
                            {bill.parties?.city && (
                                <p>{bill.parties.city}{bill.parties.state ? `, ${bill.parties.state}` : ''}{bill.parties.pincode ? ` - ${bill.parties.pincode}` : ''}</p>
                            )}

                            <div className="flex gap-4 mt-2">
                                {bill.parties?.phone && (
                                    <p className="flex items-center gap-1">
                                        <span className="font-medium text-slate-500">Ph:</span> {bill.parties.phone}
                                    </p>
                                )}
                                {bill.parties?.email && (
                                    <p className="flex items-center gap-1">
                                        <span className="font-medium text-slate-500">Email:</span> {bill.parties.email}
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-4 mt-2">
                                {bill.parties?.gstin && (
                                    <p className="bg-slate-50 px-2 py-0.5 rounded border border-slate-200 inline-block text-xs">
                                        <span className="font-semibold">GSTIN:</span> {bill.parties.gstin}
                                    </p>
                                )}
                                {bill.parties?.pan_number && (
                                    <p className="bg-slate-50 px-2 py-0.5 rounded border border-slate-200 inline-block text-xs">
                                        <span className="font-semibold">PAN:</span> {bill.parties.pan_number}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="text-right">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Bill Details</h4>
                        <div className="space-y-1">
                            <p className="text-sm"><span className="text-slate-500">Date:</span> <span className="font-medium">{format(new Date(bill.date), 'dd MMM yyyy')}</span></p>
                            <p className="text-sm"><span className="text-slate-500">Bill No:</span> <span className="font-medium">{bill.po_number}</span></p>
                        </div>
                        <div className="mt-3">
                            <Badge variant={bill.status === 'received' ? 'default' : 'secondary'} className="px-3 py-1 text-xs">
                                {bill.status.toUpperCase()}
                            </Badge>
                        </div>
                    </div>
                </div>

                <Separator />

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-10">#</TableHead>
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
                                <TableCell>{item.hsn_code || item.products?.hsn_code || '-'}</TableCell>
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
                        {items.some(i => i.discount > 0) && (
                            <div className="flex justify-between text-sm text-red-500">
                                <span>Discount:</span>
                                <span>-₹{items.reduce((acc, item) => acc + (item.discount || 0), 0).toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm">
                            <span>Tax:</span>
                            <span>₹{items.reduce((acc, item) => acc + (item.tax_amount || 0), 0).toFixed(2)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold text-lg text-slate-900">
                            <span>Grand Total:</span>
                            <span>₹{bill.grand_total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                </div>

                {/* Footer Info: Terms & Notes */}
                <div className="mt-8 border-t pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            {bill.parties?.terms && (
                                <div className="mb-4">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Supplier Terms</h4>
                                    <p className="text-sm text-slate-600 whitespace-pre-line bg-slate-50 p-3 rounded border border-slate-100">{bill.parties.terms}</p>
                                </div>
                            )}
                            {bill.notes && (
                                <div>
                                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Private Notes</h4>
                                    <p className="text-sm text-slate-600 whitespace-pre-line">{bill.notes}</p>
                                </div>
                            )}
                        </div>

                        <div className="bg-slate-50 p-4 rounded-lg flex flex-col justify-center items-center text-center border border-slate-100">
                            <p className="text-xs text-slate-400 uppercase font-bold mb-8">Authorized Signatory</p>
                            <div className="w-32 h-px bg-slate-200"></div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card >
    )
}
