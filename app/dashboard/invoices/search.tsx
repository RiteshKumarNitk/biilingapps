"use client"

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useDebounce } from "@/hooks/use-debounce"

export function InvoicesSearch() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const [value, setValue] = useState(searchParams.get("search") || "")
    const debouncedValue = useDebounce(value, 500)

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString())
        if (debouncedValue) {
            params.set("search", debouncedValue)
        } else {
            params.delete("search")
        }

        // Reset to first page on search
        params.delete("page")

        router.push(`${pathname}?${params.toString()}`)
    }, [debouncedValue, pathname, router, searchParams])

    return (
        <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
                placeholder="Search by invoice # or client..."
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="pl-9 h-10 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
            />
        </div>
    )
}
