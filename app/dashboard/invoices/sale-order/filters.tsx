"use client"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Filter, SortAsc, SortDesc, ChevronDown } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

export function SaleOrderFilters() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const currentStatus = searchParams.get("status") || "all"
    const currentSortBy = searchParams.get("sortBy") || "created_at"
    const currentSortOrder = searchParams.get("sortOrder") || "desc"

    const updateFilters = (updates: Record<string, string>) => {
        const params = new URLSearchParams(searchParams.toString())
        Object.entries(updates).forEach(([key, value]) => {
            if (value === "all" || (key === "sortBy" && value === "created_at") || (key === "sortOrder" && value === "desc" && currentSortBy === "created_at")) {
                if (value === "all") params.delete(key)
                else params.set(key, value)
            } else {
                params.set(key, value)
            }
        })
        router.push(`${pathname}?${params.toString()}`)
    }

    return (
        <div className="flex items-center gap-2">
            {/* Status Filter */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-10 border-slate-200 text-slate-600 font-medium bg-slate-50/50 hover:bg-white transition-colors">
                        <Filter className="h-4 w-4 mr-2 text-slate-400" />
                        {currentStatus === "all" ? "All Status" : currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
                        <ChevronDown className="h-3 w-3 ml-2 text-slate-400" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup value={currentStatus} onValueChange={(val) => updateFilters({ status: val })}>
                        <DropdownMenuRadioItem value="all">All Orders</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="open">Open</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="converted">Converted</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="overdue">Overdue</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Sort Filter */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-10 border-slate-200 text-slate-600 font-medium bg-slate-50/50 hover:bg-white transition-colors">
                        {currentSortOrder === "asc" ? <SortAsc className="h-4 w-4 mr-2 text-slate-400" /> : <SortDesc className="h-4 w-4 mr-2 text-slate-400" />}
                        Sort: {currentSortBy === "created_at" ? "Date" : "Amount"}
                        <ChevronDown className="h-3 w-3 ml-2 text-slate-400" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup value={currentSortBy} onValueChange={(val) => updateFilters({ sortBy: val })}>
                        <DropdownMenuRadioItem value="created_at">Date Created</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="grand_total">Amount</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Order</DropdownMenuLabel>
                    <DropdownMenuRadioGroup value={currentSortOrder} onValueChange={(val) => updateFilters({ sortOrder: val })}>
                        <DropdownMenuRadioItem value="desc">Descending</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="asc">Ascending</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
