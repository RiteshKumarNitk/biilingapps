'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, TrendingUp } from "lucide-react"

export function CustomerStats({
    topCustomers
}: {
    topCustomers: any[]
}) {
    return (
        <Card className="shadow-sm border-none bg-white h-full">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-500">
                    Highest Revenue Customers
                </CardTitle>
                <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {topCustomers.map((customer, i) => (
                        <div key={customer.name} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs">
                                    {customer.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-800">{customer.name}</p>
                                    <div className="flex items-center gap-1 text-[10px] text-green-600">
                                        <TrendingUp className="h-3 w-3" /> High Volume
                                    </div>
                                </div>
                            </div>
                            <span className="font-semibold text-slate-900">
                                ₹ {customer.value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                            </span>
                        </div>
                    ))}
                    {topCustomers.length === 0 && (
                        <p className="text-sm text-slate-400">No customer data available yet.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
