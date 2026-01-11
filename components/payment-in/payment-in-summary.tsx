'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowUpRight } from 'lucide-react'

interface PaymentInSummaryProps {
    total: number
}

export function PaymentInSummary({ total }: PaymentInSummaryProps) {
    return (
        <Card className="bg-blue-50/50 border-blue-100 shadow-sm mb-6">
            <CardContent className="p-6 flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Total Amount</p>
                    <div className="flex items-baseline gap-3">
                        <h2 className="text-3xl font-bold text-slate-800">
                            ₹ {total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </h2>
                        {/* Placeholder Growth Indicator */}
                        <div className="flex items-center text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            <span>0%</span>
                        </div>
                    </div>
                    <p className="text-sm text-slate-500 mt-2">
                        Received: <span className="font-semibold text-slate-700">₹ {total.toLocaleString('en-IN')}</span>
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
