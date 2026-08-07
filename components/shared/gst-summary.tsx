import { cn } from "@/lib/utils"
import { AmountDisplay } from "./amount-display"
import { Separator } from "@/components/ui/separator"

export interface GSTSummaryProps {
    subtotal: number
    totalGst: number
    discount?: number
    grandTotal: number
    className?: string
}

/**
 * The subtotal / GST / (optional discount) / grand-total breakdown shown at
 * the bottom of invoice, quotation, and proforma forms. Each form
 * previously rendered this block independently with slightly different
 * markup.
 */
export function GSTSummary({ subtotal, totalGst, discount, grandTotal, className }: GSTSummaryProps) {
    return (
        <div className={cn("space-y-3 w-full md:w-80", className)}>
            <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>Subtotal</span>
                <AmountDisplay amount={subtotal} className="font-medium text-foreground" />
            </div>
            <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>GST</span>
                <AmountDisplay amount={totalGst} className="font-medium text-foreground" />
            </div>
            {discount !== undefined && discount > 0 && (
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>Discount</span>
                    <span className="font-medium text-foreground">- <AmountDisplay amount={discount} /></span>
                </div>
            )}
            <Separator className="my-2" />
            <div className="flex justify-between items-center text-2xl font-bold text-primary">
                <span>Total</span>
                <AmountDisplay amount={grandTotal} />
            </div>
        </div>
    )
}
