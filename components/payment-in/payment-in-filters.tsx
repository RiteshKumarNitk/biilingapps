'use client'

import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CalendarIcon } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, subMonths } from 'date-fns'
import { cn } from '@/lib/utils'

export function PaymentInFilters() {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Derived state from URL or logic
    const currentRange = searchParams.get('range') || 'this-month'

    const setRange = (range: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('range', range)

        // Logic to clear custom dates if preset is selected
        if (range !== 'custom') {
            params.delete('from')
            params.delete('to')
        }

        router.push(`?${params.toString()}`)
    }

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
                <span className="text-sm font-medium text-slate-500 whitespace-nowrap">Filter By:</span>
                <Button
                    variant={currentRange === 'today' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setRange('today')}
                    className={cn("rounded-full px-4", currentRange === 'today' ? "bg-blue-600 hover:bg-blue-700" : "text-slate-600")}
                >
                    Today
                </Button>
                <Button
                    variant={currentRange === 'this-week' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setRange('this-week')}
                    className={cn("rounded-full px-4", currentRange === 'this-week' ? "bg-blue-600 hover:bg-blue-700" : "text-slate-600")}
                >
                    This Week
                </Button>
                <Button
                    variant={currentRange === 'this-month' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setRange('this-month')}
                    className={cn("rounded-full px-4", currentRange === 'this-month' ? "bg-blue-600 hover:bg-blue-700" : "text-slate-600")}
                >
                    This Month
                </Button>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={currentRange === 'custom' ? 'default' : 'outline'}
                            size="sm"
                            className={cn("rounded-full px-4 gap-2", currentRange === 'custom' ? "bg-blue-600 hover:bg-blue-700" : "text-slate-600")}
                        >
                            <CalendarIcon className="h-3.5 w-3.5" />
                            Custom
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="range"
                            selected={{
                                from: searchParams.get('from') ? new Date(searchParams.get('from')!) : undefined,
                                to: searchParams.get('to') ? new Date(searchParams.get('to')!) : undefined
                            }}
                            onSelect={(range) => {
                                if (range?.from) {
                                    const params = new URLSearchParams(searchParams.toString())
                                    params.set('range', 'custom')
                                    params.set('from', range.from.toISOString())
                                    if (range.to) params.set('to', range.to.toISOString())
                                    router.push(`?${params.toString()}`)
                                }
                            }}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
                <Select defaultValue="all">
                    <SelectTrigger className="w-[180px] h-9 border-slate-200">
                        <SelectValue placeholder="Select Firm" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Firms</SelectItem>
                        <SelectItem value="main">My First Business</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}
