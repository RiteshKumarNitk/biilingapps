import { requireAuth } from '@/lib/auth-server'
import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { ConvertButton } from './convert-button'
import { Separator } from '@/components/ui/separator'

export default async function QuotationViewPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;
    const user = await requireAuth()

    const q = await prisma.quotation.findUnique({
        where: { id, tenantId: user.tenantId }
    })
    
    if (!q) notFound()

    const items = await prisma.quotationItem.findMany({
        where: { quotationId: id, tenantId: user.tenantId }
    })
    
    const tenant = await prisma.tenant.findUnique({
        where: { id: q.tenantId }
    })

    if (!tenant) notFound()

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Quotation Details</h2>
                    <p className="text-sm text-muted-foreground mt-1">View and manage this quotation</p>
                </div>
                <div className="flex space-x-2">
                    <ConvertButton quotationId={q.id} status={q.status} />
                </div>
            </div>

            <Card className="rounded-xl overflow-hidden shadow-sm border-slate-200">
                <CardHeader className="bg-slate-50 border-b border-slate-100 p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                        <div>
                            <h3 className="font-bold text-lg text-slate-800 uppercase tracking-wider mb-2">{tenant.name}</h3>
                            <div className="text-sm text-slate-500 space-y-1">
                                <p className="whitespace-pre-line">{tenant.address}</p>
                                <p>Phone: {tenant.phone}</p>
                                {tenant.gstin && <p>GSTIN: {tenant.gstin}</p>}
                                {tenant.email && <p>Email: {tenant.email}</p>}
                            </div>
                        </div>
                        <div className="text-right">
                            <h3 className="text-2xl font-bold text-slate-800 mb-1">QUOTATION</h3>
                            <p className="font-mono text-slate-600 font-medium"># {q.quotationNumber}</p>
                            <div className="mt-4 space-y-1 text-sm">
                                <div className="flex justify-end gap-4">
                                    <span className="text-slate-500">Date:</span>
                                    <span className="font-medium text-slate-700">{format(new Date(q.date), 'dd MMM yyyy')}</span>
                                </div>
                                {q.validUntil && (
                                    <div className="flex justify-end gap-4">
                                        <span className="text-slate-500">Valid Until:</span>
                                        <span className="font-medium text-slate-700">{format(new Date(q.validUntil), 'dd MMM yyyy')}</span>
                                    </div>
                                )}
                                <div className="flex justify-end gap-4 mt-2">
                                    <Badge className={`${q.status?.toLowerCase() === 'converted' ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-blue-100 text-blue-700 hover:bg-blue-100'} border-none uppercase text-xs px-2`}>
                                        {q.status}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h4 className="text-xs font-semibold uppercase text-slate-400 mb-3">Bill To</h4>
                            <div className="text-sm">
                                <p className="font-bold text-slate-800 text-base mb-1">{q.partyName}</p>
                                {q.partyAddress && <p className="text-slate-500 whitespace-pre-line">{q.partyAddress}</p>}
                                {q.partyPhone && <p className="text-slate-500 mt-1">Phone: {q.partyPhone}</p>}
                                {q.partyEmail && <p className="text-slate-500">Email: {q.partyEmail}</p>}
                            </div>
                        </div>
                        {q.shippingAddress && (
                            <div>
                                <h4 className="text-xs font-semibold uppercase text-slate-400 mb-3">Ship To</h4>
                                <div className="text-sm">
                                    <p className="font-bold text-slate-800 text-base mb-1">{q.partyName}</p>
                                    <p className="text-slate-500 whitespace-pre-line">{q.shippingAddress}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="border-t border-slate-100 px-6 py-2">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-none hover:bg-transparent">
                                    <TableHead className="pl-0 text-slate-500 font-semibold w-[40%]">Item Description</TableHead>
                                    <TableHead className="text-right text-slate-500 font-semibold">Qty</TableHead>
                                    <TableHead className="text-right text-slate-500 font-semibold">Rate</TableHead>
                                    <TableHead className="text-right text-slate-500 font-semibold">GST</TableHead>
                                    <TableHead className="text-right text-slate-500 font-semibold">Tax</TableHead>
                                    <TableHead className="text-right text-slate-500 font-semibold text-xs text-red-400">Disc</TableHead>
                                    <TableHead className="text-right text-slate-500 font-semibold pr-0">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items?.map((item) => (
                                    <TableRow key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                                        <TableCell className="pl-0 py-4 align-top">
                                            <p className="font-medium text-slate-700 text-sm">{item.description}</p>
                                        </TableCell>
                                        <TableCell className="text-right py-4 align-top text-slate-600">{item.quantity}</TableCell>
                                        <TableCell className="text-right py-4 align-top text-slate-600">₹{item.unitPrice}</TableCell>
                                        <TableCell className="text-right py-4 align-top text-slate-600">{item.gstRate}%</TableCell>
                                        <TableCell className="text-right py-4 align-top text-slate-600">₹{item.taxAmount?.toFixed(2)}</TableCell>
                                        <TableCell className="text-right py-4 align-top text-red-500">
                                            {item.discount > 0 ? `-₹${item.discount}` : '-'}
                                        </TableCell>
                                        <TableCell className="text-right pr-0 py-4 align-top font-bold text-slate-800">₹{item.totalAmount?.toFixed(2)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="bg-slate-50/50 p-6 flex flex-col items-end">
                        <div className="w-full md:w-1/3 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Subtotal</span>
                                <span className="font-medium text-slate-700">₹{q.subtotal?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Total GST</span>
                                <span className="font-medium text-slate-700">₹{q.totalGst?.toFixed(2)}</span>
                            </div>
                            {q.discountAmount > 0 && (
                                <div className="flex justify-between text-sm text-red-600">
                                    <span>Total Discount</span>
                                    <span className="font-medium">-₹{q.discountAmount?.toFixed(2)}</span>
                                </div>
                            )}
                            <Separator className="my-2" />
                            <div className="flex justify-between text-lg">
                                <span className="font-bold text-slate-800">Grand Total</span>
                                <span className="font-bold text-blue-600">₹{q.grandTotal?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
                {q.notes && (
                    <div className="border-t border-slate-100 p-6 bg-slate-50/30">
                        <h4 className="text-xs font-semibold uppercase text-slate-500 mb-2">Terms & Conditions / Notes</h4>
                        <p className="text-sm text-slate-600 whitespace-pre-line">{q.notes}</p>
                    </div>
                )}
            </Card>
        </div >
    )
}
