
import { getExpenses, getCashbook } from '@/actions/accounting'
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ExpenseForm } from '@/components/accounting/expense-form'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { format } from 'date-fns'

export default async function AccountingPage() {
    const expenses = await getExpenses()
    const cashbook = await getCashbook()

    // Calculate Totals
    const totalExpense = expenses?.reduce((acc: number, curr: any) => acc + curr.amount, 0) || 0
    const cashIn = cashbook.filter((c: any) => c.type === 'credit').reduce((acc: any, curr: any) => acc + curr.amount, 0)
    const cashOut = cashbook.filter((c: any) => c.type === 'debit').reduce((acc: any, curr: any) => acc + curr.amount, 0)
    const cashBalance = cashIn - cashOut

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Accounting</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Cash Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${cashBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ₹{cashBalance.toFixed(2)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">₹{totalExpense.toFixed(2)}</div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="expenses" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="expenses">Expenses</TabsTrigger>
                    <TabsTrigger value="cashbook">Cashbook</TabsTrigger>
                </TabsList>

                <TabsContent value="expenses" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Expense History</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Desc</TableHead>
                                            <TableHead>Mode</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {expenses?.map((e: any) => (
                                            <TableRow key={e.id}>
                                                <TableCell>{format(new Date(e.date), 'dd MMM yyyy')}</TableCell>
                                                <TableCell>{e.category}</TableCell>
                                                <TableCell>{e.description}</TableCell>
                                                <TableCell className="capitalize">{e.payment_mode}</TableCell>
                                                <TableCell className="text-right">₹{e.amount}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                        <div className="col-span-3">
                            <ExpenseForm />
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="cashbook">
                    <Card>
                        <CardHeader>
                            <CardTitle>Cashbook Ledger</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="text-right text-green-600 font-bold">Credit (In)</TableHead>
                                        <TableHead className="text-right text-red-600 font-bold">Debit (Out)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {cashbook.map((Entry: any, i: number) => (
                                        <TableRow key={i}>
                                            <TableCell>{format(new Date(Entry.date), 'dd MMM yyyy')}</TableCell>
                                            <TableCell>{Entry.description}</TableCell>
                                            <TableCell className="text-right text-green-600">
                                                {Entry.type === 'credit' ? `₹${Entry.amount}` : '-'}
                                            </TableCell>
                                            <TableCell className="text-right text-red-600">
                                                {Entry.type === 'debit' ? `₹${Entry.amount}` : '-'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
