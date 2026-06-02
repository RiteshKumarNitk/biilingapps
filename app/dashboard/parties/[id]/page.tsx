import { getPartyLedger } from '@/actions/parties'
import { requireAuth } from '@/lib/auth-server'
import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { format } from 'date-fns'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default async function PartyLedgerPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;
    const user = await requireAuth()

    const party = await prisma.party.findUnique({
        where: { id, tenantId: user.tenantId }
    })

    if (!party) notFound()

    const ledger = await getPartyLedger(id)

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{party.name}</h2>
                    <p className="text-muted-foreground">{party.type.toUpperCase()}</p>
                </div>
                <div className="text-right">
                    <h3 className="text-xl font-bold">Balance: ₹{Math.abs(party.currentBalance)}</h3>
                    <span className={party.currentBalance < 0 ? 'text-red-500' : 'text-green-500'}>
                        {party.currentBalance < 0 ? 'To Pay' : 'To Receive'}
                    </span>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Ledger / Statement</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Particulars</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead className="text-right">Debit (In)</TableHead>
                                <TableHead className="text-right">Credit (Out)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {ledger.map((entry: any, i) => (
                                <TableRow key={i}>
                                    <TableCell>{format(new Date(entry.date || entry.createdAt || entry.created_at), 'dd MMM yyyy')}</TableCell>
                                    <TableCell>{entry.type === 'invoice' || entry.type === 'purchase' ? `Invoice #${entry.invoiceNumber || entry.invoice_number}` : `Payment ${entry.mode}`}</TableCell>
                                    <TableCell className="capitalize">{entry.type}</TableCell>
                                    <TableCell className="text-right">
                                        {entry.type === 'invoice' || entry.type === 'purchase' ? `₹${entry.grandTotal || entry.grand_total}` : '-'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {entry.type === 'payment' ? `₹${entry.amount}` : '-'}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {ledger.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                        No transactions found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
