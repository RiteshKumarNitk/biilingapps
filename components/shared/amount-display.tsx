import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/calculations"

export interface AmountDisplayProps {
    amount: number | null | undefined
    decimals?: number
    /** Colors green/red by sign (receivable/payable, profit/loss, etc). */
    colorByValue?: boolean
    /** Show a "Rec"/"Pay" (or custom) suffix based on sign - used for party balances. */
    signLabels?: { positive: string; negative: string }
    className?: string
}

/**
 * Renders a Rupee amount with the project's standard en-IN formatting.
 * Consolidates the various ad-hoc `₹{amount.toLocaleString(...)}` /
 * `.toFixed(2)` call sites (each formatted slightly differently) into one
 * place.
 */
export function AmountDisplay({ amount, decimals = 2, colorByValue, signLabels, className }: AmountDisplayProps) {
    const value = amount ?? 0
    const formatted = formatCurrency(Math.abs(value), { decimals })
    const colorClass = colorByValue
        ? value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : 'text-slate-500'
        : undefined

    return (
        <span className={cn(colorClass, className)}>
            {value < 0 && !signLabels ? '-' : ''}{formatted}
            {signLabels && (
                <span className="text-[10px] ml-1 uppercase opacity-60 font-normal">
                    {value >= 0 ? signLabels.positive : signLabels.negative}
                </span>
            )}
        </span>
    )
}
