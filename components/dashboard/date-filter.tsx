'use client'

import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function DashboardDateFilter() {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Default to "this-month" if nothing
    const currentFilter = searchParams.get('period') || 'this-month'
    // We can map simplified keys to month/year on server or pass logic here.
    // For simplicity, let's pass a "period" param string and handle parsing in `page.tsx`.

    const handleChange = (value: string) => {
        const params = new URLSearchParams(searchParams)
        if (value === 'all') {
            params.delete('period')
            params.delete('year')
            params.delete('month')
        } else {
            params.set('period', value)
        }
        router.push(`?${params.toString()}`)
    }

    return (
        <Select defaultValue={currentFilter} onValueChange={handleChange}>
            <SelectTrigger className="w-[140px] h-9 bg-white border-slate-200">
                <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="this-year">This Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
        </Select>
    )
}
