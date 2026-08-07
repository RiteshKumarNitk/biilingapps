import * as React from "react"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"
import { Inbox } from "lucide-react"

export interface EmptyStateProps {
    icon?: LucideIcon
    title: string
    description?: string
    action?: React.ReactNode
    className?: string
}

/** Standard "no results" placeholder for lists/tables. */
export function EmptyState({ icon: Icon = Inbox, title, description, action, className }: EmptyStateProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center gap-2 py-16 px-4 text-center", className)}>
            <div className="rounded-full bg-slate-100 p-3 mb-1">
                <Icon className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-700">{title}</p>
            {description && <p className="text-xs text-slate-400 max-w-sm">{description}</p>}
            {action && <div className="mt-3">{action}</div>}
        </div>
    )
}
