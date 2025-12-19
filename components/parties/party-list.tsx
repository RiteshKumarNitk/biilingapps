
"use client"

import { cn } from "@/lib/utils"
import { Search, Filter, ArrowUpRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

interface PartyListProps {
    parties: any[]
    selectedId: string | null
    onSelect: (id: string) => void
}

export function PartyList({ parties, selectedId, onSelect }: PartyListProps) {
    return (
        <div className="flex flex-col h-full bg-white border-r">
            {/* SEARCH & FILTER */}
            <div className="p-3 border-b space-y-3">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search Party Name"
                        className="pl-9 h-9 bg-slate-50 border-slate-200 text-sm"
                    />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                    <div className="flex items-center gap-1 cursor-pointer hover:text-slate-700">
                        <Filter className="h-3 w-3" />
                        <span>Filter</span>
                    </div>
                    <div className="cursor-pointer hover:text-slate-700">
                        Sort by Amount
                    </div>
                </div>
            </div>

            {/* LIST */}
            <ScrollArea className="flex-1">
                <div className="flex flex-col">
                    {parties.map((party) => {
                        const isSelected = selectedId === party.id
                        const balance = party.current_balance || 0
                        const isPayable = balance < 0 // We owe them (negative logic usually, or just flagged)
                        // Wait, user said "Red -> Payable (You owe party)". Usually Payable is Liability. 
                        // "Green -> Receivable (Customer owes you)". Asset.
                        // Let's assume +ve is Receivable, -ve is Payable.

                        return (
                            <div
                                key={party.id}
                                onClick={() => onSelect(party.id)}
                                className={cn(
                                    "px-4 py-3 border-b cursor-pointer transition-colors flex justify-between items-center group",
                                    isSelected
                                        ? "bg-blue-50/50 border-l-4 border-l-blue-600 border-b-blue-100"
                                        : "hover:bg-slate-50 border-l-4 border-l-transparent"
                                )}
                            >
                                <div className="flex flex-col gap-0.5 max-w-[60%]">
                                    <span className={cn(
                                        "font-semibold text-sm truncate",
                                        isSelected ? "text-slate-900" : "text-slate-700"
                                    )}>
                                        {party.name}
                                    </span>
                                    {/* Optional Type Badge or Phone */}
                                </div>

                                <span className={cn(
                                    "font-bold text-sm",
                                    balance >= 0 ? "text-green-600" : "text-red-600"
                                )}>
                                    ₹ {Math.abs(balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    <span className="text-[10px] ml-1 uppercase text-slate-400 font-normal">
                                        {balance >= 0 ? 'Dr' : 'Cr'}
                                    </span>
                                </span>
                            </div>
                        )
                    })}

                    {/* Empty State */}
                    {parties.length === 0 && (
                        <div className="p-8 text-center text-slate-400 text-sm">
                            No parties found
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Promo / Info */}
            <div className="bg-emerald-50 p-3 border-t">
                <div className="flex items-start gap-3">
                    <div className="flex-1">
                        <p className="text-xs font-medium text-emerald-800 leading-snug">
                            Easily convert your Phone contacts into parties
                        </p>
                    </div>
                    <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <ArrowUpRight className="h-3 w-3" />
                    </div>
                </div>
            </div>
        </div>
    )
}
