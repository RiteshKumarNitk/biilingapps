
import { createClient } from '@/utils/supabase/server'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
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

export default async function QuotationsPage() {
    const supabase = await createClient()
    const { data: quotations } = await supabase
        .from('quotations')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Quotations / Estimates</h2>
                <Button asChild>
                    <Link href="/dashboard/quotations/create">
                        <Plus className="mr-2 h-4 w-4" /> Create Quotation
                    </Link>
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Number</TableHead>
                            <TableHead>Party</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {quotations?.map((q) => (
                            <TableRow key={q.id}>
                                <TableCell>{format(new Date(q.date), 'dd MMM yyyy')}</TableCell>
                                <TableCell className="font-medium">{q.quotation_number}</TableCell>
                                <TableCell>{q.party_name || '-'}</TableCell>
                                <TableCell>₹{q.grand_total}</TableCell>
                                <TableCell>
                                    <Badge variant={q.status === 'converted' ? 'default' : 'secondary'}>
                                        {q.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" asChild>
                                        <Link href={`/dashboard/quotations/${q.id}`}>View</Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {(!quotations || quotations.length === 0) && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24">
                                    No quotations found. Create your first estimate!
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
