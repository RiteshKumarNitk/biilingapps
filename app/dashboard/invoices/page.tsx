
import { getInvoices } from '@/actions/invoices'
import { Button } from '@/components/ui/button'
import { Plus, FileText, ChevronRight } from 'lucide-react'
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default async function InvoicesPage() {
    const { data: invoices } = await getInvoices()

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Invoices</h2>
                    <p className="text-muted-foreground hidden md:block">Manage your invoices and payments</p>
                </div>
                <div className="flex items-center space-x-2">
                    <Link href="/dashboard/invoices/new">
                        <Button className="shadow-lg shadow-primary/20 transition-all hover:scale-105">
                            <Plus className="mr-2 h-4 w-4" /> <span className="hidden sm:inline">Create Invoice</span><span className="sm:hidden">New</span>
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="grid gap-4 md:hidden">
                {(!invoices || invoices.length === 0) ? (
                    <Card className="bg-muted/50 border-dashed">
                        <CardContent className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                            <p>No invoices found</p>
                        </CardContent>
                    </Card>
                ) : (
                    invoices.map((invoice) => (
                        <Card key={invoice.id} className="overflow-hidden border-none shadow-sm ring-1 ring-black/5 dark:ring-white/10 active:scale-[0.99] transition-all">
                            <CardHeader className="p-4 bg-muted/30 pb-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-base font-semibold">{invoice.party_name}</CardTitle>
                                        <CardDescription className="text-xs">{invoice.invoice_number}</CardDescription>
                                    </div>
                                    <Badge variant={invoice.payment_status === 'paid' ? 'default' : 'secondary'} className="capitalize">
                                        {invoice.payment_status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 pt-2">
                                <div className="flex justify-between items-end mt-2">
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground">Date</p>
                                        <p className="text-sm font-medium">{format(new Date(invoice.date), 'dd MMM yyyy')}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-muted-foreground">Amount</p>
                                        <p className="text-lg font-bold text-primary">₹{invoice.grand_total}</p>
                                    </div>
                                </div>
                                <Button variant="ghost" className="w-full mt-4 h-9 border border-input bg-background hover:bg-accent text-xs" asChild>
                                    <Link href={`/dashboard/invoices/${invoice.id}`}>
                                        View Details <ChevronRight className="ml-auto h-3 w-3 opacity-50" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="w-[100px]">No.</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {(!invoices || invoices.length === 0) ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-32 text-muted-foreground">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <FileText className="h-8 w-8 opacity-20" />
                                        <p>No invoices generated yet.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            invoices.map((invoice) => (
                                <TableRow key={invoice.id} className="group hover:bg-muted/30 transition-colors">
                                    <TableCell className="font-medium font-mono text-xs">{invoice.invoice_number}</TableCell>
                                    <TableCell className="font-medium">{invoice.party_name}</TableCell>
                                    <TableCell className="text-muted-foreground">{format(new Date(invoice.date), 'dd MMM yyyy')}</TableCell>
                                    <TableCell className="text-right font-bold">₹{invoice.grand_total}</TableCell>
                                    <TableCell>
                                        <Badge variant={invoice.payment_status === 'paid' ? 'default' : 'secondary'} className="capitalize shadow-none">
                                            {invoice.payment_status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" asChild className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Link href={`/dashboard/invoices/${invoice.id}`}>View</Link>
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
