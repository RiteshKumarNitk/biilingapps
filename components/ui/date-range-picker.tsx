"use client"

import * as React from "react"
import { addDays, format } from "date-fns"
import { Calendar as CalendarIcon, X } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

interface DatePickerWithRangeProps {
    className?: string
}

export function DatePickerWithRange({
    className,
}: DatePickerWithRangeProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const fromParam = searchParams.get("startDate")
    const toParam = searchParams.get("endDate")

    const [date, setDate] = React.useState<DateRange | undefined>(
        fromParam && toParam
            ? { from: new Date(fromParam), to: new Date(toParam) }
            : undefined
    )

    // Update URL when date changes
    const onSelect = (range: DateRange | undefined) => {
        setDate(range)
        if (range?.from && range?.to) {
            const params = new URLSearchParams(searchParams)
            params.set("startDate", range.from.toISOString())
            params.set("endDate", range.to.toISOString())
            router.push(`${pathname}?${params.toString()}`)
        } else if (!range) {
            // Clear
            const params = new URLSearchParams(searchParams)
            params.delete("startDate")
            params.delete("endDate")
            router.push(`${pathname}?${params.toString()}`)
        }
    }

    const clear = (e: React.MouseEvent) => {
        e.stopPropagation()
        setDate(undefined)
        const params = new URLSearchParams(searchParams)
        params.delete("startDate")
        params.delete("endDate")
        router.push(`${pathname}?${params.toString()}`)
    }

    return (
        <div className={cn("grid gap-2", className)}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "w-[260px] justify-start text-left font-normal rounded-full bg-white border-slate-200 hover:bg-slate-50",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                            date.to ? (
                                <>
                                    {format(date.from, "LLL dd, y")} -{" "}
                                    {format(date.to, "LLL dd, y")}
                                </>
                            ) : (
                                format(date.from, "LLL dd, y")
                            )
                        ) : (
                            <span>Pick a date range</span>
                        )}
                        {date && <X className="ml-auto h-4 w-4 opacity-50 hover:opacity-100 p-0.5" onClick={clear} />}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={onSelect}
                        numberOfMonths={2}
                    />
                </PopoverContent>
            </Popover>
        </div>
    )
}
