import { getPayments } from '@/actions/payment-in'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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
import { StatsCard, FilterBar, AmountDisplay, EmptyState } from '@/components/shared'

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
                <StatsCard
                    variant="gradient"
                    color="green"
                    icon={Wallet}
                    label="Total Received"
                    value={`₹${summary.total.toLocaleString('en-IN')}`}
                />
                <StatsCard
                    variant="gradient"
                    color="slate"
                    icon={Receipt}
                    label="Payments Recorded"
                    value={summary.count}
                />
            </div>

            {/* Filters */}
            <FilterBar>
                <PaymentInSearch />
            </FilterBar>

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
                                <TableCell className="text-right font-semibold">
                                    <AmountDisplay amount={payment.amount} className="text-green-600" />
                                </TableCell>
                                <TableCell>
                                    <DeletePaymentButton id={payment.id} />
                                </TableCell>
                            </TableRow>
                        ))}
                        {payments.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6}>
                                    <EmptyState title="No payments found" />
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    )
}
