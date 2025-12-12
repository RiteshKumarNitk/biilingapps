
import { getParties } from '@/actions/parties'
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

export default async function PartiesPage() {
    const parties = await getParties()

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Parties (Customers & Suppliers)</h2>
                <div className="flex items-center space-x-2">
                    <Link href="/dashboard/parties/new">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Party
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Balance</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {parties?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                    No parties found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            parties?.map((party) => (
                                <TableRow key={party.id}>
                                    <TableCell className="font-medium">{party.name}</TableCell>
                                    <TableCell className="capitalize">{party.type}</TableCell>
                                    <TableCell>{party.phone || '-'}</TableCell>
                                    <TableCell className={party.current_balance < 0 ? 'text-red-500' : 'text-green-500'}>
                                        ₹{Math.abs(party.current_balance || 0)} {party.current_balance < 0 ? 'Payable' : 'Receivable'}
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/dashboard/parties/${party.id}`}>View Ledger</Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
