
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '@/components/ui/avatar'


interface RecentSalesProps {
    data: any[]
}

export function RecentSales({ data }: RecentSalesProps) {
    return (
        <div className="space-y-8">
            {data.map((sale) => (
                <div key={sale.id} className="flex items-center">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={`https://avatar.vercel.sh/${sale.party_name}.png`} alt="Avatar" />
                        <AvatarFallback>{sale.party_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">{sale.party_name}</p>
                        <p className="text-sm text-muted-foreground">
                            {sale.invoice_number}
                        </p>
                    </div>
                    <div className="ml-auto font-medium">+₹{sale.grand_total?.toFixed(2)}</div>
                </div>
            ))}
            {data.length === 0 && (
                <div className="text-sm text-muted-foreground text-center py-4">
                    No recent sales found.
                </div>
            )}
        </div>
    )
}
