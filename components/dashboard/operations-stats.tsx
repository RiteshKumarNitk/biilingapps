'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ClipboardList, FileClock, ShoppingBag } from "lucide-react"

export function OperationsStats({
    pendingQuotes,
    pendingPO
}: {
    pendingQuotes: number
    pendingPO: number
}) {
    return (
        <Card className="shadow-sm border-none bg-indigo-50/50">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-indigo-600" />
                    Pending Actions
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                        <div className="flex items-center gap-2 mb-1">
                            <FileClock className="h-4 w-4 text-orange-500" />
                            <span className="text-xs text-slate-500">Estimates</span>
                        </div>
                        <p className="text-2xl font-bold text-slate-800">{pendingQuotes}</p>
                        <p className="text-[10px] text-slate-400">Waiting for approval</p>
                    </div>

                    <div className="bg-white p-3 rounded-lg shadow-sm">
                        <div className="flex items-center gap-2 mb-1">
                            <ShoppingBag className="h-4 w-4 text-blue-500" />
                            <span className="text-xs text-slate-500">Orders</span>
                        </div>
                        <p className="text-2xl font-bold text-slate-800">{pendingPO}</p>
                        <p className="text-[10px] text-slate-400">To be received</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
