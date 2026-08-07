import { cn } from "@/lib/utils"
import { AmountDisplay } from "./amount-display"

export interface PartyBalanceCardProps {
    name: string
    type?: string
    balance: number
    className?: string
    /** Compact renders inline (e.g. under a party-select field); default renders a bordered card. */
    variant?: "card" | "compact"
}

/**
 * Shows a party's name/type and current balance with the app's standard
 * Receivable(green)/Payable(red) convention. Used on the invoice form's
 * "current balance" preview, the parties list, and party detail headers,
 * which each previously computed and styled this independently.
 */
export function PartyBalanceCard({ name, type, balance, className, variant = "card" }: PartyBalanceCardProps) {
    if (variant === "compact") {
        return (
            <div className={cn("flex items-center justify-between text-xs px-1", className)}>
                <span className="text-slate-500">Current Balance:</span>
                <AmountDisplay amount={balance} colorByValue signLabels={{ positive: "Rec", negative: "Pay" }} className="font-bold" />
            </div>
        )
    }

    return (
        <div className={cn("rounded-lg border border-slate-200 bg-white p-4 flex items-center justify-between", className)}>
            <div>
                <p className="font-semibold text-slate-800">{name}</p>
                {type && <p className="text-xs text-slate-400 uppercase">{type}</p>}
            </div>
            <AmountDisplay amount={balance} colorByValue signLabels={{ positive: "Rec", negative: "Pay" }} className="font-bold text-lg" />
        </div>
    )
}
