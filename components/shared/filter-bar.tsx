import * as React from "react"
import { cn } from "@/lib/utils"

export interface FilterBarProps {
    children: React.ReactNode
    className?: string
}

/**
 * The white rounded toolbar that houses a page's search box, date range
 * picker, and filter/sort controls. Previously each list page redefined
 * the same `bg-white rounded-xl border ... flex flex-wrap items-center
 * gap-3` container inline.
 */
export function FilterBar({ children, className }: FilterBarProps) {
    return (
        <div className={cn("bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center gap-3", className)}>
            {children}
        </div>
    )
}
