import { getPayments } from '@/actions/payment-in'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Plus, Wallet, Receipt } from 'lucide-react'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import { PaymentInSearch } from './search'
import { DeletePaymentButton } from '@/components/payment-in/delete-payment-button'

export default async function PaymentInPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams
    const search = typeof params.search === 'string' ? params.search : undefined
    const startDateParam = typeof params.startDate === 'string' ? params.startDate : undefined
    const endDateParam = typeof params.endDate === 'string' ? params.endDate : undefined

    const { payments, summary } = await getPayments({
        start: startDateParam ? parseISO(startDateParam) : null,
        end: endDateParam ? parseISO(endDateParam) : null,
        search,
    })

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Payment In</h1>
                    <p className="text-sm text-slate-500 mt-1">Track payments received from your customers.</p>
                </div>
                <Link href="/dashboard/invoices/payment-in/new">
                    <Button className="bg-green-600 hover:bg-green-700 shadow-sm shadow-green-200">
                        <Plus className="h-4 w-4 mr-2" /> Add Payment
                    </Button>
                </Link>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="rounded-xl border-none shadow-sm bg-gradient-to-br from-green-50 to-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-5">
                        <Wallet className="h-24 w-24 text-green-600" />
                    </div>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100/50 rounded-lg text-green-600">
                                <Wallet className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Total Received</p>
                                <h3 className="text-2xl font-bold text-slate-900 mt-0.5">
                                    ₹{summary.total.toLocaleString('en-IN')}
                                </h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-xl border-none shadow-sm bg-gradient-to-br from-slate-50 to-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-5">
                        <Receipt className="h-24 w-24 text-slate-600" />
                    </div>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-slate-100/50 rounded-lg text-slate-600">
                                <Receipt className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Payments Recorded</p>
                                <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{summary.count}</h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center gap-3">
                <PaymentInSearch />
            </div>

            {/* List Table */}
            <Card className="rounded-xl border-none shadow-sm bg-white overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Party</TableHead>
                            <TableHead>Reference</TableHead>
                            <TableHead>Mode</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="w-12"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {payments.map((payment) => (
                            <TableRow key={payment.id}>
                                <TableCell>{format(new Date(payment.date), 'dd MMM yyyy')}</TableCell>
                                <TableCell className="font-medium">{payment.party_name}</TableCell>
                                <TableCell className="text-muted-foreground">{payment.transaction_ref || '-'}</TableCell>
                                <TableCell className="capitalize">{payment.mode?.toLowerCase().replace('_', ' ')}</TableCell>
                                <TableCell className="text-right font-semibold text-green-600">
                                    ₹{payment.amount.toLocaleString('en-IN')}
                                </TableCell>
                                <TableCell>
                                    <DeletePaymentButton id={payment.id} />
                                </TableCell>
                            </TableRow>
                        ))}
                        {payments.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-32 text-muted-foreground">
                                    No payments found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    )
}
