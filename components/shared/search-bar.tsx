"use client"

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useDebounce } from "@/hooks/use-debounce"
import { cn } from "@/lib/utils"

export interface SearchBarProps {
    placeholder?: string
    /** URL search param to read/write. Defaults to "search". */
    paramName?: string
    debounceMs?: number
    /** Also clears the "page" param when the search term changes, so pagination resets. */
    resetPage?: boolean
    className?: string
}

/**
 * A debounced search input that syncs to a URL search param, driving a
 * server component's `searchParams` prop. Consolidates what were four
 * near-identical files (app/dashboard/invoices/search.tsx, quotations/search.tsx,
 * purchase/bills/search.tsx, invoices/payment-in/search.tsx).
 */
export function SearchBar({
    placeholder = "Search...",
    paramName = "search",
    debounceMs = 500,
    resetPage = false,
    className,
}: SearchBarProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const [value, setValue] = useState(searchParams.get(paramName) || "")
    const debouncedValue = useDebounce(value, debounceMs)

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString())
        if (debouncedValue) {
            params.set(paramName, debouncedValue)
        } else {
            params.delete(paramName)
        }
        if (resetPage) params.delete("page")

        router.push(`${pathname}?${params.toString()}`)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedValue, pathname, router, paramName, resetPage])

    return (
        <div className={cn("relative flex-1 min-w-[200px] max-w-sm", className)}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
                placeholder={placeholder}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="pl-9 h-10 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
            />
        </div>
    )
}
