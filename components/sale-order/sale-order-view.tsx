
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export function SaleOrderView({ order, items, tenant }: { order: any, items: any[], tenant: any }) {
    return (
        <Card className="shadow-none border-0">
            <CardHeader className="flex flex-row items-start justify-between pb-8">
                <div>
                    <CardTitle className="text-3xl font-bold text-slate-800">SALE ORDER</CardTitle>
                    <p className="text-sm font-medium text-slate-500 mt-1"># {order.order_number}</p>
                </div>
                <div className="text-right">
                    {tenant?.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={tenant.logo_url} alt="Logo" className="h-12 w-auto object-contain ml-auto mb-2" />
                    ) : (
                        <h3 className="font-bold text-xl uppercase text-slate-900">{tenant?.name || 'Your Company'}</h3>
                    )}
                    <div className="text-sm text-slate-500 space-y-1 mt-2">
                        <p className="whitespace-pre-line">{tenant?.address}</p>
                        {tenant?.phone && <p>Ph: {tenant.phone}</p>}
                        {tenant?.email && <p>{tenant.email}</p>}
                        {tenant?.gstin && <p className="font-medium text-slate-700">GSTIN: {tenant.gstin}</p>}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-8 px-8 pb-8">
                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Billed To */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Billed To</h4>
                        <div className="space-y-1">
                            <p className="font-bold text-slate-900 text-lg">{order.party_name}</p>
                            {order.parties?.address && <p className="text-sm text-slate-600 whitespace-pre-line">{order.parties.address}</p>}
                            <div className="text-sm text-slate-600">
                                {order.parties?.city && <span>{order.parties.city}, </span>}
                                {order.parties?.state && <span>{order.parties.state} </span>}
                                {order.parties?.pincode && <span>{order.parties.pincode}</span>}
                            </div>

                            <div className="pt-2 space-y-1">
                                {order.parties?.phone && (
                                    <p className="text-sm text-slate-600"><span className="font-medium text-slate-500">Ph:</span> {order.parties.phone}</p>
                                )}
                                {order.parties?.email && (
                                    <p className="text-sm text-slate-600"><span className="font-medium text-slate-500">Email:</span> {order.parties.email}</p>
                                )}
                                {order.parties?.gstin && (
                                    <p className="text-sm text-slate-600"><span className="font-medium text-slate-500">GSTIN:</span> {order.parties.gstin}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Order Details */}
                    <div className="flex flex-col items-end text-right space-y-4">
                        <div className="w-full max-w-[240px] space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-slate-500">Order Date:</span>
                                <span className="text-sm font-bold text-slate-900">{format(new Date(order.date), 'dd MMM yyyy')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-slate-500">Due Date:</span>
                                <span className="text-sm font-semibold text-slate-700">{order.due_date ? format(new Date(order.due_date), 'dd MMM yyyy') : '-'}</span>
                            </div>
                            <div className="flex justify-between items-center pt-1">
                                <span className="text-sm font-medium text-slate-500">Status:</span>
                                <Badge variant={
                                    order.status === 'converted' ? 'secondary' :
                                        order.status === 'overdue' ? 'destructive' :
                                            'outline'
                                } className="capitalize font-normal">
                                    {order.status}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border border-slate-200 overflow-hidden">
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead className="w-[50px] text-slate-500">#</TableHead>
                                <TableHead className="text-slate-500">Item & Description</TableHead>
                                <TableHead className="text-right text-slate-500">Qty</TableHead>
                                <TableHead className="text-right text-slate-500">Price</TableHead>
                                <TableHead className="text-right text-slate-500">Tax</TableHead>
                                <TableHead className="text-right text-slate-500 font-semibold">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.map((item: any, index: number) => (
                                <TableRow key={index}>
                                    <TableCell className="text-slate-500 text-xs">{index + 1}</TableCell>
                                    <TableCell>
                                        <div className="font-medium text-slate-800">{item.description}</div>
                                        {item.products?.hsn_code && (
                                            <div className="text-xs text-slate-400 mt-0.5">HSN: {item.products.hsn_code}</div>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right text-slate-600">
                                        {item.quantity} <span className="text-xs text-slate-400">{item.unit || 'pcs'}</span>
                                    </TableCell>
                                    <TableCell className="text-right text-slate-600">₹{item.unit_price}</TableCell>
                                    <TableCell className="text-right text-slate-600">
                                        <div className="flex flex-col items-end">
                                            <span>{item.gst_rate}%</span>
                                            <span className="text-xs text-slate-400">₹{item.tax_amount?.toFixed(2)}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-medium text-slate-900">₹{item.total_amount?.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex justify-end pt-4">
                    <div className="w-full md:w-1/3 space-y-3 bg-slate-50 p-4 rounded-lg">
                        <div className="flex justify-between text-sm text-slate-600">
                            <span>Subtotal</span>
                            <span>₹{items.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-slate-600">
                            <span>Total Tax (GST)</span>
                            <span>₹{items.reduce((acc, item) => acc + (item.tax_amount || 0), 0).toFixed(2)}</span>
                        </div>
                        <Separator className="bg-slate-200" />
                        <div className="flex justify-between items-center pt-1">
                            <span className="font-bold text-slate-800">Grand Total</span>
                            <span className="font-bold text-xl text-blue-600">₹{order.grand_total?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                </div>

                {order.notes && (
                    <div className="pt-4 border-t border-slate-100">
                        <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Notes</h4>
                        <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-md border border-slate-100 italic">
                            {order.notes}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
