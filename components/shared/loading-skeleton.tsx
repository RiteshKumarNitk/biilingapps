import { cn } from "@/lib/utils"

export function Skeleton({ className }: { className?: string }) {
    return <div className={cn("animate-pulse rounded-md bg-slate-200/70", className)} />
}

/** A skeleton for a table's rows while data is loading. */
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
    return (
        <div className="w-full space-y-3 p-4">
            {Array.from({ length: rows }).map((_, r) => (
                <div key={r} className="flex items-center gap-4">
                    {Array.from({ length: columns }).map((__, c) => (
                        <Skeleton key={c} className={cn("h-4", c === 0 ? "w-1/4" : "flex-1")} />
                    ))}
                </div>
            ))}
        </div>
    )
}

/** A skeleton for a row of KPI/stat cards while dashboard data is loading. */
export function StatsCardSkeleton({ count = 4 }: { count?: number }) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="rounded-xl border-none shadow-sm p-6 space-y-3">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-7 w-2/3" />
                </div>
            ))}
        </div>
    )
}
