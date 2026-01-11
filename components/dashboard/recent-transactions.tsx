import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"

interface RecentTransactionsProps {
    transactions: any[]
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
    if (!transactions || transactions.length === 0) {
        return <div className="text-sm text-slate-500 text-center py-8">No recent transactions</div>
    }

    return (
        <div className="space-y-6">
            {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-blue-50 text-blue-600 text-xs font-semibold">
                                {tx.party_name?.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">{tx.party_name}</p>
                            <p className="text-xs text-muted-foreground">{tx.party?.email || tx.invoice_number}</p>
                        </div>
                    </div>
                    <div className="text-right space-y-1">
                        <p className="text-sm font-bold text-slate-900">+₹{tx.grand_total.toLocaleString()}</p>
                        <div className="flex items-center justify-end gap-2">
                            <span className="text-[10px] text-muted-foreground">
                                {formatDistanceToNow(new Date(tx.created_at), { addSuffix: true })}
                            </span>
                            <Badge variant={
                                tx.status === 'paid' ? 'default' :
                                    tx.status === 'overdue' ? 'destructive' : 'secondary'
                            } className="h-4 px-1 text-[10px] uppercase">
                                {tx.status || 'Pending'}
                            </Badge>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
