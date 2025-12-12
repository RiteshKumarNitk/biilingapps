
import { createClient } from '@/utils/supabase/server'
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
    const supabase = await createClient()

    const { data: q } = await supabase.from('quotations').select('*').eq('id', id).single()
    if (!q) notFound()

    const { data: items } = await supabase.from('quotation_items').select('*').eq('quotation_id', id)
    const { data: tenant } = await supabase.from('tenants').select('*').eq('id', q.tenant_id).single()

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Quotation Details</h2>
                <div className="flex space-x-2">
                    <ConvertButton quotationId={q.id} status={q.status} />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between">
                        <div>
                            <CardTitle className="text-xl">{tenant.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">{tenant.address}</p>
                            <p className="text-sm text-muted-foreground">{tenant.phone}</p>
                        </div>
                        <div className="text-right">
                            <h3 className="text-lg font-bold">QUOTATION</h3>
                            <p className="font-mono">{q.quotation_number}</p>
                            <p className="text-sm text-muted-foreground">Date: {format(new Date(q.date), 'dd MMM yyyy')}</p>
                            <Badge className="mt-2">{q.status.toUpperCase()}</Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="mb-6">
                        <h4 className="text-sm font-semibold mb-2">Bill To:</h4>
                        <div className="text-sm border p-3 rounded">
                            <p className="font-medium">{q.party_name}</p>
                        </div>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Qty</TableHead>
                                <TableHead className="text-right">Price</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items?.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.description}</TableCell>
                                    <TableCell className="text-right">{item.quantity}</TableCell>
                                    <TableCell className="text-right">₹{item.unit_price}</TableCell>
                                    <TableCell className="text-right">₹{item.total_amount}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <div className="flex justify-end mt-6">
                        <div className="w-1/3 text-right space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal:</span>
                                <span>₹{q.subtotal}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Total GST:</span>
                                <span>₹{q.total_gst}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-bold text-lg">
                                <span>Total:</span>
                                <span>₹{q.grand_total}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
